// Small-screen arrangement of the existing trip controls. Restore their original
// parents on wider screens so the desktop layout and event handlers stay intact.
export function installMobileTrip({dialog, region, t, town, count, read, listText, touched, redrawDesktop}) {
  const phone = matchMedia('(max-width:700px)');
  let refresh = () => {};
  let dispose = () => {};

  function mount() {
    const q = selector => dialog.querySelector(selector);
    const styles = document.querySelector('link[href^="/phone-trip.css"]');
    if(styles) document.head.append(styles);
    const cleanups = [];
    const listen = (node, event, fn) => {
      node.addEventListener(event, fn);
      cleanups.push(() => node.removeEventListener(event, fn));
    };
    function create(tag, cls, parent, label) {
      const node = document.createElement(tag);
      node.className = cls;
      if (label) node.textContent = label;
      parent.append(node);
      cleanups.push(() => node.remove());
      return node;
    }
    function move(node, target) {
      const anchor = document.createComment('desktop position');
      node.before(anchor);
      target.append(node);
      cleanups.push(() => anchor.replaceWith(node));
    }
    function rename(node, text) {
      const original = node.textContent;
      node.textContent = text;
      cleanups.push(() => node.textContent = original);
    }

    const head = q('.collection-head');
    const choose = document.getElementById('choose');
    const nav = document.getElementById('country-mobile-nav');
    const summary = create('div', 'phone-trip-overview', dialog);
    head.after(summary);
    move(q('.collection-drive-summary'), summary);
    const cities = create('details', 'phone-cities', summary);
    const edit = create('summary', 'phone-change', cities);
    const endpoints = create('span', '', edit);
    create('span', 'phone-edit', edit, t('Изменить', 'Edit'));
    move(q('.collection-towns'), cities);
    const empty = create('section', 'phone-empty', dialog);
    summary.after(empty);
    create('h3', '', empty, t('Какие места хотите посетить?', 'Where would you like to go?'));
    create('p', '', empty, t('Добавляйте места из карточек или с карты. Здесь появится ваш маршрут.', 'Add places from the cards or map. Your route will appear here.'));
    const start = create('button', 'collection-primary', empty, t('Выбрать места', 'Choose places') + ' · ' + region.title);
    start.dataset.action = 'browse';
    const bottom = create('section', 'phone-exports', dialog);
    const exportTitle = create('h3', '', bottom, t('Взять в дорогу', 'Take your trip with you'));
    exportTitle.tabIndex = -1;
    const actions=create('div','phone-take-actions',summary);
    const sharing=typeof navigator.share==='function' && (document.permissionsPolicy||document.featurePolicy)?.allowsFeature?.('web-share')!==false;
    const share=create('button','phone-quick-share',actions,sharing?t('Поделиться списком','Share trip list'):t('Скопировать список','Copy trip list'));
    const feedback=create('p','phone-share-message',summary);
    feedback.setAttribute('role','status');
    let sharingNow=false;
    async function sendList(button, allowShare, message) {
      if (sharingNow || button.disabled) return;
      sharingNow=true;
      message.replaceChildren();
      const text=listText();
      try {
        const result=await deliverTripText(text,navigator,allowShare,dialog);
        if (!dialog.open || text!==listText()) return;
        if (result==='copied') {
          message.textContent=t('Скопировано: ','Copied: ')+region.title+' · '+count(read().length)+t('. Вставьте в чат.','. Paste into your chat.');
        } else if (result==='manual') {
          const field=document.createElement('textarea');
          field.readOnly=true;
          field.value=text;
          field.setAttribute('aria-label',t('Список для копирования','Trip list to copy'));
          message.replaceChildren(t('Скопируйте выделенный текст в чат.','Copy the selected text into your chat.'),field);
          field.focus();field.select();
        }
      } finally { sharingNow=false; }
    }
    listen(share,'click',()=>sendList(share,sharing,feedback));
    const copy=q('[data-action=copy]');
    listen(copy,'click',event=>{
      event.stopPropagation();
      sendList(copy,false,q('.collection-status'));
    });
    const saveShortcut = create('button','phone-save-shortcut',actions,t('К списку и файлу ↓','Jump to trip exports ↓'));
    listen(saveShortcut,'click',() => {
      exportTitle.scrollIntoView({block:'start'});
      exportTitle.focus({preventScroll:true});
    });
    move(q('.collection-downloads'), bottom);
    move(q('.collection-status'), bottom);
    move(q('[data-action=clear]'), actions);
    rename(q('[data-action=copy]'), t('Скопировать для попутчиков', 'Copy for travel companions'));
    rename(q('[data-action=kml]'), t('Скачать для Google My Maps', 'Download for Google My Maps'));
    rename(q('[data-action=clear]'), t('Очистить поездку', 'Clear trip'));
    const helpStep = q('.collection-help li');
    rename(helpStep, t('Скачайте файл кнопкой выше.', 'Download the file using the button above.'));
    const undo = q('.collection-undo');
    move(undo, summary);
    // Keep Undo reachable when the last place is removed.
    head.after(undo, summary);
    const toast = document.getElementById('collection-toast');
    move(toast, nav);
    const tag = create('span', 'phone-region-count', choose);
    choose.prepend(tag);
    const only=document.getElementById('only');
    const onlyLabel=only.closest('label');
    const emptyResult=document.getElementById('empty');
    rename(emptyResult.querySelector('h3'),t('Мест по этим условиям нет','No places match these filters'));
    rename(emptyResult.querySelector('button'),t('Показать все ','Show all ')+count(region.places.length));
    listen(emptyResult,'click',event=>{
      if (!event.target.closest('button')) return;
      event.preventDefault();
      event.stopPropagation();
      document.getElementById('resetFilters').click();
      if(choose.classList.contains('filters-open'))choose.querySelector('.region-filter-toggle').click();
      document.getElementById('cards').scrollIntoView({block:'start'});
    });
    const tools=document.querySelector('.map-tools');
    const settings=create('button','phone-map-settings',tools,t('Настройки карты','Map settings'));
    tools.prepend(settings);
    function showSettings(open) {
      tools.classList.toggle('phone-settings-open',open);
      settings.setAttribute('aria-expanded',String(open));
    }
    showSettings(false);
    listen(settings,'click',()=>showSettings(settings.getAttribute('aria-expanded')!=='true'));
    listen(tools,'change',()=>showSettings(false));
    listen(tools,'click',event=>{
      if(event.target.closest('#map-locate,#map-route,#map-hotels'))showSettings(false);
    });
    listen(document,'yura:pane',()=>showSettings(false));
    cleanups.push(()=>{tools.classList.remove('phone-settings-open');onlyLabel.classList.remove('phone-hide-only');});
    const legend = document.querySelector('.trip-catalog-legend');
    const normalLegend = legend.textContent;
    function mapKey() {
      const google = document.getElementById('map-layer').value === 'google';
      const entries = [
        ['phone-pin-key', '7', t('Карточка','Place card')],
        ...(google ? [['phone-group-key', '×3', t('Места рядом','Places nearby')]] : []),
        ['phone-saved-key', '✓', t('В поездке','In trip')],
        ['phone-highlight-key', '', t('Главное','Highlight')]
      ];
      legend.replaceChildren(...entries.map(([cls,icon,label]) => {
        const item = document.createElement('span'), mark = document.createElement('i');
        mark.className=cls; mark.setAttribute('aria-hidden','true'); mark.textContent=icon;
        item.append(mark, label); return item;
      }));
      legend.hidden=document.getElementById('map-layer').value==='stay22';
    }
    listen(document.getElementById('map-layer'),'change',mapKey);
    mapKey();
    cleanups.push(()=>{legend.hidden=false;legend.textContent=normalLegend;});
    const mapRoute = document.getElementById('map-route');
    rename(mapRoute, t('Как добраться', 'Directions'));
    const preview = document.getElementById('map-preview');
    function addDirections() {
      const pick = preview.querySelector('[data-design-pick]');
      if (!pick) return;
      const title=preview.querySelector('.mini-copy strong')?.textContent;
      const details=preview.querySelector('[data-design-open]');
      if(details && title && !details.classList.contains('phone-preview-title')){
        details.classList.add('phone-preview-title');
        details.dataset.phoneOriginal=details.textContent;
        const caption=document.createElement('small');
        caption.textContent=t('Подробнее ›','Details ›');
        details.replaceChildren(title,caption);
      }
      if (preview.querySelector('.phone-directions')) return;
      const access = region.routeAccess?.[pick.dataset.designPick];
      if (!access?.query || access.kind === 'blocked') return;
      const link = document.createElement('a');
      link.className = 'phone-directions';
      link.textContent = t('Как добраться ↗', 'Directions ↗');
      const args = new URLSearchParams({api:'1', destination:access.query, travelmode:'driving'});
      if (access.placeId) args.set('destination_place_id', access.placeId);
      link.href = 'https://www.google.com/maps/dir/?' + args;
      link.target = '_blank';
      link.rel = 'noopener';
      preview.querySelector('.mini-copy').append(link);
    }
    const previewChanges = new MutationObserver(addDirections);
    previewChanges.observe(preview,{childList:true,subtree:true});
    addDirections();
    cleanups.push(() => {previewChanges.disconnect(); preview.querySelector('.phone-directions')?.remove(); const b=preview.querySelector('.phone-preview-title');if(b){b.textContent=b.dataset.phoneOriginal;b.classList.remove('phone-preview-title');delete b.dataset.phoneOriginal;}});
    const name = id => {
      const p = region.places.find(p => String(p.id) === String(id));
      return p?.shortName || p?.name || '';
    };
    const tab = nav.querySelector('[data-pane=selected]');
    listen(document, 'ys:mobile-pick', event => {
      touched();
      const {id, added} = event.detail;
      toast.querySelector('span').textContent = name(id) + (added ? t(' — в поездке', ' added') : t(' — убрано', ' removed'));
      if (added && read().length === 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        tab.animate([{boxShadow:'inset 0 0 0 2px #bc8f5a'},{boxShadow:'none'}], {duration:1200});
      }
    });
    let previousList='';
    const current = () => {
      share.disabled=q('[data-action=copy]').disabled;
      const list=dialog.open ? listText() : '';
      if(list!==previousList){feedback.textContent='';previousList=list;}
      const total = read().length;
      saveShortcut.hidden = total < 6;
      dialog.classList.toggle('phone-no-places', !total);
      endpoints.textContent = town('start').name === town('end').name
        ? town('start').name + t(' · туда и обратно', ' · round trip')
        : town('start').name + ' → ' + town('end').name;

      const stops = q('.collection-stops');
      for (const a of stops.querySelectorAll('.collection-links a')) {
        const url = new URL(a.href);
        const query = url.searchParams.get('query');
        if (a.parentElement.firstElementChild === a || !query) continue;
        const args = new URLSearchParams({api:'1', destination:query, travelmode:'driving'});
        if (url.searchParams.has('query_place_id')) args.set('destination_place_id', url.searchParams.get('query_place_id'));
        a.href = 'https://www.google.com/maps/dir/?' + args;
        a.classList.add('phone-parking');
        const item = region.routeAccess?.[a.closest('article').id.replace('collection-place-','')];
        const parking = item?.kind === 'parking' || /парков|стоянк|parking|car park|aparcamiento/i.test(item?.label || '');
        a.textContent = parking ? t('К парковке ↗','Drive to parking ↗') : t('Как доехать ↗','Directions ↗');
      }
    };
    listen(dialog,'close', () => { cities.open=false; feedback.textContent=''; dialog.scrollTop=0; });
    const navSize = new ResizeObserver(() => document.body.style.setProperty('--phone-nav-height',nav.offsetHeight+'px'));
    navSize.observe(nav);
    const shown = document.getElementById('shownCount');
    function updateCount() {
      const noSelection=!read().length;
      onlyLabel.classList.toggle('phone-hide-only',noSelection);
      if(noSelection && only.checked){only.checked=false;only.dispatchEvent(new Event('change',{bubbles:true}));}
      const digits = shown.textContent.match(/\d+/g);
      const total = region.places.length;
      const visible = Number(digits?.[0] ?? total);
      tag.textContent = visible === total ? count(total) : t('Места', 'Places') + ' · ' + visible + ' / ' + total;
    }
    const filterButton = choose.querySelector('.region-filter-toggle');
    function updateFilterLabel(){
      const n = ['priority','tag','format'].filter(id => document.getElementById(id)?.value).length + Number(document.getElementById('only').checked);
      const open = choose.classList.contains('filters-open');
      filterButton.textContent = (open ? t('Свернуть','Hide filters') : t('Фильтры','Filters')) + (n ? ' · ' + n : '');
    }
    const selectCount = new MutationObserver(() => { updateCount(); updateFilterLabel(); });
    listen(choose,'click',event=>{
      if(event.target.closest('#resetFilters,[data-remove-filter]')) queueMicrotask(updateFilterLabel);
    });
    selectCount.observe(shown,{childList:true,subtree:true,characterData:true});
    updateCount();
    const cleanupBack = supportBack(dialog);
    refresh = current;
    current();
    dispose = () => {
      cleanupBack();
      navSize.disconnect();
      selectCount.disconnect();
      cleanups.reverse().forEach(f => f());
      dialog.classList.remove('phone-no-places');
      document.body.style.removeProperty('--phone-nav-height');
      refresh=()=>{};
    };
  }
  if (phone.matches) mount();
  phone.addEventListener('change', () => {
    if (phone.matches) mount();
    else {
      dispose();
      if(dialog.open) redrawDesktop();
    }
  });
  return () => refresh();
}

// A phone's Back command dismisses the most recent trip or place sheet.
// Use the current URL so filters, map selection and scroll position survive.
function supportBack(trip) {
  const dialogs = [trip, document.getElementById('placeDialog'),document.getElementById('collection-confirm')].filter(Boolean);
  const key='ysPhoneSheet';
  let pending=false;
  function watch() {
    if(pending)return;
    const open=dialogs.filter(d=>d.open);
    const last=open.at(-1);
    const id=history.state?.[key];
    if(last && last.id!==id) {
      if(id && !open.some(d=>d.id===id)) history.replaceState({...history.state,[key]:last.id},'');
      else history.pushState({...history.state,[key]:last.id},'');
    } else if(!last && id) {
      pending=true;
      history.back();
    }
  }
  function onPop() {
    pending=false;
    const id=history.state?.[key];
    for (const d of [...dialogs].reverse()) {
      if (d.id===id) break;
      if (d.open) d.close();
    }
  }
  const observer=new MutationObserver(() => {
    const id=history.state?.[key];
    if(id && dialogs.some(d=>d.id===id&&!d.open) && dialogs.some(d=>d.open) && id==='collection-confirm') {
      if(!pending){pending=true;history.back();}
    } else watch();
  });
  dialogs.forEach(d=>observer.observe(d,{attributes:true,attributeFilter:['open']}));
  window.addEventListener('popstate',onPop);
  return () => {
    observer.disconnect();
    window.removeEventListener('popstate',onPop);
    if(history.state?.[key]) {const state={...history.state};delete state[key];history.replaceState(state,'');}
  };
}

// Keep native user activation by making share the first asynchronous operation.
// Dismissing the OS sheet must never copy text or trigger a download.
export async function deliverTripText(text,device,sharing,dialog){
  if(sharing){
    try{
      if(!device.canShare || device.canShare({text})){
        await device.share({text});
        return 'shared';
      }
    }catch(error){if(error?.name==='AbortError')return 'cancelled';}
  }
  // The copy event commits this click's payload while the dialog has focus.
  // Fall back to the async API on engines that don't dispatch a copy event.
  const field=document.createElement('textarea');
  field.value=text;field.readOnly=true;
  field.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;font-size:16px;pointer-events:none';
  const previous=document.activeElement;
  dialog.append(field);
  let supplied=false;
  const onCopy=event=>{
    if(!event.clipboardData)return;
    event.clipboardData.setData('text/plain',text);
    event.preventDefault();
    supplied=true;
  };
  field.addEventListener('copy',onCopy);
  try{
    field.focus({preventScroll:true});
    field.select();
    supplied=document.execCommand('copy') && supplied;
  }catch{}finally{field.remove();previous?.focus({preventScroll:true});}
  if(!device.clipboard?.writeText)return supplied?'copied':'manual';
  try {
    await device.clipboard.writeText(text);
    // Verify only where read access has already been granted. Never prompt
    // on a copy gesture and never keep or transmit clipboard contents.
    let canVerify=false;
    try{canVerify=(await device.permissions.query({name:'clipboard-read'})).state==='granted';}catch{}
    if(canVerify && typeof device.clipboard.readText==='function'){
      if(await device.clipboard.readText()!==text){
        await device.clipboard.writeText(text);
        if(await device.clipboard.readText()!==text)return 'manual';
      }
    }
    return 'copied';
  } catch {return 'manual';}
}
