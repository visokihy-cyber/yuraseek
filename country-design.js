(()=>{'use strict';

const regionConfig=window.YS_REGION, nz=regionConfig?.schema==='nz'||document.title.includes('Зеландия'),catalog=nz?places:data,$=id=>document.getElementById(id),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),picked=id=>selected.has(nz?String(id):Number(id)),emit=(name,detail)=>document.dispatchEvent(new CustomEvent('yura:'+name,{detail}));

const titles=['Мыс Реинга','Бей-оф-Айлендс','Вайтанги','Лес каури и Тане-Махута','Остров Уаихеке','Пляж Пиха','Кафедральная бухта','Хот-Уотер-Бич','Пещеры Вайтомо','Хоббитон','Уаи-О-Тапу','Долина Уаймангу','Те-Пуиа','Лес Редвудс','Водопады Хука и Таупо','Тонгариро','Таранаки','Музей Те-Папа','Заливы Мальборо','Абель-Тасман','Уарарики и Голден-Бей','Кайкоура','Скалы Пунакаики','Ущелье Хокитика','Артурс-Пасс','Касл-Хилл','Ледники Франц-Иосиф и Фокс','Озеро Мэтисон','Перевал Хааст','Ванака и Даймонд-Лейк','Пик Ройс','Ледник Роб-Рой','Куинстаун','Гленорки','Эрроутаун','Милфорд-Саунд','Ки-Саммит','Даутфул-Саунд','Аораки / Маунт-Кук','Ледник Тасман','Озеро Пукаки','Озеро Текапо','Глиняные скалы','Акароа','Полуостров Отаго','Валуны Моераки','Катлинс','Остров Ракиура'];

const title=p=>regionConfig?(p.shortName||p.name):nz?(titles[p.id-1]||p.name):p.name.split(':')[0],photo=p=>nz?p.photo:p.photo?.url,short=p=>{const raw=(p.desc||'').replace(/<[^>]+>/g,'');const first=raw.match(/^.*?[.!?](?:\s|$)/)?.[0]||raw;return first.length>170?first.slice(0,167).replace(/\s+\S*$/,'')+'…':first;};

const nav=$('country-mobile-nav');

const filters=document.querySelector('.filters');

$('search').closest('label').hidden=true;$('search').value='';

for(const el of [...$('choose').children])if(el.matches('.eyebrow,h2,p,.island-switch'))el.hidden=true;

document.querySelector('.opening')?.remove();

$('country-filter-toggle').hidden=true;

for(const id of ['priority','tag','format','walk','region'])filters.append($(id).closest('label'));

const options=(el,items)=>{el.replaceChildren(...items.map(([value,label])=>new Option(label,value)));};

options($('priority'),[["", "Все"], ["1", "Главное в регионе"], ["3", "Стоит заехать"], ["4", "Для отдельной поездки"]]);

options($('format'),[["", "Все"], ["short", "Короткая остановка"], ["hours", "Несколько часов"], ["half", "Полдня"], ["day", "Целый день"], ["multi", "Несколько дней"]]);



for(const [id,text] of Object.entries({"priority": "Приоритет посещения", "tag": "Чем заняться", "format": "Время на посещение"})){const label=$(id).closest('label');for(const n of label.childNodes)if(n.nodeType===3)n.textContent=text;}

for(const n of $('only').closest('label').childNodes)if(n.nodeType===3)n.textContent=" Только мой список";

const regionGroups=nz?[['north-top','Северный остров — север'],['north-center','Северный остров — центр и юг'],['south-top','Южный остров — север'],['south-bottom','Южный остров — юг и Ракиура']]:[['inland','Центр и север страны'],['pacific-north','Тихоокеанское побережье — север'],['pacific-south','Тихоокеанское побережье — центр и юг'],['caribbean','Карибское побережье']];

options($('region'),[['','Вся страна'],...regionGroups]);

for(const id of ['region','walk']){$(id).value='';$(id).disabled=true;$(id).closest('label').hidden=true;}

for(const id of ['priority','tag','format','walk','region']){const allOption=[...$(id).options].find(o=>o.value==='');if(allOption)allOption.textContent='Все';}

function regionMatch(p,r){if(!r)return true;if(nz){if(r==='north-top')return p.id<=8;if(r==='north-center')return p.id>=9&&p.id<=18;if(r==='south-top')return p.id>=19&&p.id<=29;if(r==='south-bottom')return p.id>=30;return false;}const regions={'inland':['Центр и вулканы','Горы Таламанка','Север: Ареналь и реки','Монтеверде'],'pacific-north':['Гуанакасте','Юг полуострова Никоя'],'pacific-south':['Центральный Тихий океан','Оса и южный Тихий океан'],'caribbean':['Карибское побережье']};return regions[r]?.includes(p.region);}

const formatGroup=p=>({"Остановка": "short", "Несколько часов": "hours", "Полдня": "half", "День": "day", "Несколько дней": "multi", "Несколько ночей": "multi"})[p.format]||"";

function filteredPlaces(){return catalog.filter(p=>(!$('tag').value||p.experiences.includes($('tag').value))&&(!$('format').value||formatGroup(p)===$('format').value)&&(!$('priority').value||String(p.priority)===$('priority').value)&&(!$('only').checked||picked(p.id)));}

if(nz)filtered=filteredPlaces;else current=filteredPlaces;

const chips=document.createElement('div');chips.id='active-filters';chips.setAttribute('aria-label','Выбранные фильтры');filters.after(chips);

const result=document.querySelector('.resultbar');$('choose').append(result);

const toolbar=document.querySelector('.toolbar');toolbar.classList.add('simple-toolbar');$('resetFilters').classList.add('filter-reset');

$('choose').after($('geography'));$('geography').after($('cards'));$('cards').after($('empty'));

const atlasWorkspace=document.createElement('div');atlasWorkspace.className='atlas-workspace';$('choose').before(atlasWorkspace);atlasWorkspace.append($('choose'),$('geography'));toolbar.append(result);$('clear').textContent='Сбросить';$('copy').textContent='Скопировать список';filters.append($('clear'),$('copy'));$('mapIntro').querySelector('h2')?.remove();$('mapIntro').querySelector('.eyebrow')?.remove();

const mapIntro=$('mapIntro');mapIntro.querySelectorAll(':scope > p').forEach(p=>p.remove());

const countryBrief=document.createElement('div');countryBrief.className='country-map-brief';

countryBrief.innerHTML=regionConfig?.brief|| (nz?'<p>В Новую Зеландию едут за природой, которая меняется на каждом переезде: вулканами и гейзерами, фьордами, ледниками, бирюзовыми озёрами и океанскими берегами.</p><p>На Северном острове — геотермальные долины, культура маори и зелёные холмы. На Южном — горные пейзажи, тропы, озёра и фьорды. В одном путешествии можно сочетать короткие остановки у красивых видов, прогулки и большие походы.</p>':'<p>В Коста-Рику едут за тропической природой: увидеть ленивцев и туканов, пройти по облачному лесу, искупаться у водопадов и встретить закат на океане.</p><p>В центре страны — вулканы, горячие источники и горные леса. На Тихоокеанском побережье — пляжи, сёрфинг и национальные парки; на Карибском — влажные джунгли и другой ритм жизни. Здесь особенно интересно чередовать наблюдение за животными, прогулки и отдых у воды.</p>');

mapIntro.prepend(countryBrief);

const countrySlides=(regionConfig?.slides||(nz?[36,11,41,22,7,39,3,17]:[8,13,38,27,33,2,16,39])).map(id=>{const p=catalog.find(p=>Number(p.id)===id);if(!p)return p;const o=window.YS_CONTENT?.countries?.[regionConfig?.slug]?.['slide-'+id];if(!o)return p;return {...p,photo:o.src?(/^(https?:|\/)/.test(o.src)?o.src:'/'+o.src):p.photo,photoAlt:o.src?(document.documentElement.lang==='en'?regionConfig.title:o.alt||p.name):p.photoAlt,credit:o.src?escape(o.creditText||''):p.credit,photoFocusX:o.focusX??(o.src?50:p.photoFocusX),photoFocusY:o.focusY??(o.src?50:p.photoFocusY)};}).filter(p=>p&&photo(p));

const gallery=document.createElement('section');gallery.className='country-side-gallery';gallery.setAttribute('aria-label','Фотографии '+(regionConfig?.name||(nz?'Новой Зеландии':'Коста-Рики')));

gallery.innerHTML='<img alt="" decoding="async"><div class="side-gallery-controls"><button type="button" aria-label="Предыдущее фото">‹</button><button type="button" aria-label="Приостановить смену фотографий">Ⅱ</button><button type="button" aria-label="Следующее фото">›</button></div><div class="side-gallery-credit"></div>';

countryBrief.after(gallery);let slideIndex=0,slideRevision=0,slidePaused=matchMedia('(prefers-reduced-motion: reduce)').matches;

const slideImage=gallery.querySelector('img'),slideCredit=gallery.querySelector('.side-gallery-credit'),slideButtons=gallery.querySelectorAll('button');

function showCountrySlide(index){if(!countrySlides.length){gallery.hidden=true;return;}const revision=++slideRevision;slideIndex=(index+countrySlides.length)%countrySlides.length;const p=countrySlides[slideIndex],next=new Image();next.onload=()=>{if(revision!==slideRevision)return;slideImage.sizes=next.sizes;slideImage.srcset=next.srcset;slideImage.src=next.src;slideImage.alt=p.photoAlt||p.name;slideImage.style.objectPosition=(Number.isFinite(p.photoFocusX)?Math.max(0,Math.min(100,p.photoFocusX)):50)+"% "+(Number.isFinite(p.photoFocusY)?Math.max(0,Math.min(100,p.photoFocusY)):50)+"%";slideCredit.innerHTML=nz?p.credit:p.photo.customCredit?escape(p.photo.customCredit):`Фото: ${escape(p.photo.author)} · <a href="${escape(p.photo.licenseUrl)}" target="_blank" rel="noopener">${escape(p.photo.license)}</a> · <a href="${escape(p.photo.page)}" target="_blank" rel="noopener">источник</a>`;};next.sizes='(max-width:700px) 100vw, 480px';next.srcset=photo(p).replace('-960.webp','-480.webp')+' 480w, '+photo(p)+' 960w';next.src=photo(p);}

function updateSlidePause(){slideButtons[1].textContent=slidePaused?'▶':'Ⅱ';slideButtons[1].setAttribute('aria-label',slidePaused?'Продолжить смену фотографий':'Приостановить смену фотографий');}

slideButtons[0].onclick=()=>showCountrySlide(slideIndex-1);slideButtons[2].onclick=()=>showCountrySlide(slideIndex+1);slideButtons[1].onclick=()=>{slidePaused=!slidePaused;updateSlidePause();};

let galleryVisible=false,galleryStarted=false;new IntersectionObserver(entries=>{galleryVisible=entries[0].isIntersecting;if(galleryVisible&&!galleryStarted){galleryStarted=true;showCountrySlide(0);}}).observe(gallery);

setInterval(()=>{if(galleryVisible&&!slidePaused&&!document.hidden&&!mapIntro.hidden&&gallery.getBoundingClientRect().height>0)showCountrySlide(slideIndex+1);},10000);updateSlidePause();





$('empty').innerHTML='<h3>Мест с такими условиями пока нет</h3><button type="button" class="quiet" id="design-reset">Показать все места</button>';$('design-reset').onclick=()=>{$('resetFilters').click();emit('show-pane','list');};

for(const a of document.querySelectorAll('a[href="#choose"]'))a.addEventListener('click',e=>{e.preventDefault();emit('show-pane','list');});

$('map-fit').remove();document.querySelector('.mapframe').append($('map-fullscreen'));
const mapReset=document.createElement('button');mapReset.type='button';mapReset.id='map-reset';mapReset.className='quiet';mapReset.textContent='Сбросить';document.querySelector('.map-tools').append(mapReset);
const resetStyle=document.createElement('style');resetStyle.textContent='#map-reset{display:none}@media(max-width:700px){body.country-page .map-tools #map-reset{display:inline-flex;align-items:center;justify-content:center;min-height:44px;grid-column:2;white-space:nowrap}}';document.head.append(resetStyle);
mapReset.onclick=()=>{$('clear').click();};


const mini=document.createElement('section');mini.id='map-preview';mini.hidden=true;mini.setAttribute('aria-label','Выбранное место на карте');document.querySelector('.mapframe').append(mini);let miniPoint=null;

function miniView(){if(!miniPoint)return;const p=catalog.find(p=>String(p.id)===String(miniPoint.id));if(!p)return;mini.innerHTML=`<button class="preview-close quiet" type="button" aria-label="Закрыть выбранное место">×</button><img style="object-position:${Number.isFinite(p.photoFocusX)?Math.max(0,Math.min(100,p.photoFocusX)):50}% ${Number.isFinite(p.photoFocusY)?Math.max(0,Math.min(100,p.photoFocusY)):50}%" src="${escape(photo(p))}" alt="${escape(title(p))}"><div class="mini-copy"><strong>${escape(title(p))}</strong><span>${escape(p.time||'')} · ${escape(p.walk||'')}</span><div><button class="quiet" data-design-open="${p.id}">Подробнее</button><button data-design-pick="${p.id}" title="Добавление в список позволяет, скопировать общий список выбранных мест для отправки в текстовом сообщении" aria-pressed="${picked(p.id)}">${picked(p.id)?'В списке ✓':'В список +'}</button></div></div>`;mini.hidden=false;mini.querySelector('.preview-close').onclick=()=>{mini.hidden=true;miniPoint=null;emit('clear-map-point');};}

$('clear').addEventListener('click',()=>{mini.hidden=true;miniPoint=null;});
document.addEventListener('yura:map-point',e=>{miniPoint=e.detail;miniView();});document.addEventListener('yura:pane',()=>{mini.hidden=true;});

function enhanceCards(){for(const c of document.querySelectorAll('#cards .card')){const id=c.dataset.id||c.id.replace('place-',''),p=catalog.find(p=>String(p.id)===String(id));if(!p)continue;if(!c.querySelector('.preview-body')){const div=document.createElement('div');div.className='preview-body';div.innerHTML=`<div class="preview-region">${escape(p.region)}</div><h3>${escape(title(p))}</h3>${nz?`<div class="preview-original">${escape(p.name.split(' — ')[0])}</div>`:''}<p class="preview-summary">${escape(short(p))}</p><div class="preview-facts"><span><small>Время на посещение</small>${escape((p.time||p.format||'См. подробности').split(';')[0])}</span><span><small>Нагрузка</small>${escape(p.walk||'См. подробности')}</span></div><div class="preview-actions"><button type="button" class="quiet" data-design-open="${p.id}">Подробнее →</button><button type="button" class="quiet" data-show-place="${p.id}">На карте</button><button type="button" data-design-pick="${p.id}" title="Добавление в список позволяет, скопировать общий список выбранных мест для отправки в текстовом сообщении"></button></div>`;c.append(div);}

 const b=c.querySelector('[data-design-pick]'),label=picked(p.id)?'В списке ✓':'В список +';if(b.textContent!==label)b.textContent=label;b.setAttribute('aria-pressed',String(picked(p.id)));c.classList.toggle('selected',picked(p.id));}}

let detailId=null;

function enhanceDetail(){const c=$('placeDialogBody').querySelector('.card');if(!c)return;const id=c.dataset.placeId||c.dataset.id,p=catalog.find(p=>String(p.id)===String(id));if(!p)return;detailId=p.id;

 let dock=$('detail-dock');if(!dock){dock=document.createElement('div');dock.id='detail-dock';$('placeDialog').append(dock);}if(dock.dataset.id!==String(p.id)){dock.dataset.id=String(p.id);dock.innerHTML=`<button data-design-pick="${p.id}" title="Добавление в список позволяет, скопировать общий список выбранных мест для отправки в текстовом сообщении"></button><button class="quiet" data-show-place="${p.id}">На карте</button><button class="quiet" data-design-route="${p.id}">Маршрут →</button>`;}const b=dock.querySelector('[data-design-pick]'),label=picked(p.id)?'В списке ✓':'В список +';if(b.textContent!==label)b.textContent=label;b.setAttribute('aria-pressed',String(picked(p.id)));}

function updateState(){const selectedLabel='В списке · '+selected.size;const b=nav.querySelector('[data-pane="selected"]');if(b.textContent!==selectedLabel)b.textContent=selectedLabel;const active=[];for(const id of ['search','region','tag','walk','format','priority']){const el=$(id);if(el.value)active.push({id,label:id==='search'?'Поиск: '+el.value:el.options[el.selectedIndex].text});}const markup=active.map(x=>`<button type="button" class="filter-chip" data-remove-filter="${x.id}">${escape(x.label)} ×</button>`).join('');if(chips.innerHTML!==markup)chips.innerHTML=markup;const reset=$('resetFilters');reset.hidden=!active.length;document.body.classList.toggle('has-selection',selected.size>0);if(miniPoint){const b=mini.querySelector('[data-design-pick]');if(b){b.textContent=picked(miniPoint.id)?'В списке ✓':'В список +';b.setAttribute('aria-pressed',String(picked(miniPoint.id)));}}}

let queued=false;function refresh(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;enhanceCards();enhanceDetail();updateState();});}

new MutationObserver(refresh).observe($('cards'),{childList:true,subtree:true});new MutationObserver(refresh).observe($('placeDialogBody'),{childList:true,subtree:true});

const originalRefresh=nz?render:apply;if(nz){render=function(...args){originalRefresh(...args);refresh();};}else{apply=function(...args){originalRefresh(...args);refresh();};}

document.addEventListener('yura:selection',refresh);document.addEventListener('yura:pane',refresh);

document.addEventListener('click',e=>{const pick=e.target.closest('[data-design-pick]');if(pick){const id=nz?String(pick.dataset.designPick):Number(pick.dataset.designPick);selected.has(id)?selected.delete(id):selected.add(id);save();nz?render():apply();refresh();return;}const open=e.target.closest('[data-design-open]');if(open){emit('open',{id:open.dataset.designOpen});return;}const route=e.target.closest('[data-design-route]');if(route){emit('route-to',{id:route.dataset.designRoute,key:miniPoint?.id==route.dataset.designRoute?miniPoint.key:route.dataset.designRoute});return;}const remove=e.target.closest('[data-remove-filter]');if(remove){const el=$(remove.dataset.removeFilter);el.value='';el.dispatchEvent(new Event(el.id==='search'?'input':'change',{bubbles:true}));refresh();}});

// Route endpoint actions are kept inside the route planner.

const endpointLinks=document.createElement('p');endpointLinks.className='route-endpoint-help';endpointLinks.textContent='Выбери начало и конец из списка или нажми «На карте». Кружки с числом мест раскрываются при приближении.';$('routeDialog').querySelector('.route-content').prepend(endpointLinks);

const oldNote=[...document.querySelectorAll('#choose .muted')];for(const p of oldNote)if(/браузер|файл|перемещ/i.test(p.textContent))p.hidden=true;

nz?render():apply();refresh();

const backTop=document.createElement('button');backTop.type='button';backTop.className='back-to-top';backTop.hidden=true;backTop.setAttribute('aria-label','Вернуться к началу страницы');backTop.innerHTML='<span aria-hidden="true">↑</span> Наверх';document.body.append(backTop);

const updateBackTop=()=>{backTop.hidden=window.scrollY<600||document.body.classList.contains('country-map-mode');};

window.addEventListener('scroll',updateBackTop,{passive:true});document.addEventListener('yura:pane',()=>requestAnimationFrame(updateBackTop));

backTop.onclick=()=>{window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};updateBackTop();

})();