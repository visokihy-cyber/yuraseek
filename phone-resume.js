// The directory links supply the localized region names and the exact selection keys.
const nav=document.querySelector('.home-dest-nav');
const phone=matchMedia('(max-width:700px)');
const section=document.createElement('section');
section.className='phone-resume';section.hidden=true;nav.after(section);
const en=document.documentElement.lang==='en',t=(ru,eng)=>en?eng:ru;
section.setAttribute('aria-label',t('Сохранённые поездки','Saved trips'));
const plural=new Intl.PluralRules(en?'en':'ru');
const make=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n};
function refresh(){
  section.hidden=true;section.replaceChildren();
  if(!phone.matches)return;
  const saved=[];
  for(const a of nav.querySelectorAll('[data-trip-key]')){
    try{
      const ids=JSON.parse(localStorage.getItem(a.dataset.tripKey)||'[]');
      if(!Array.isArray(ids))continue;
      const n=new Set(ids.map(String).filter(s=>/^\d+$/.test(s))).size;
      if(!n)continue;
      const url=new URL(a.href);url.hash='trip';
      const unit=en?(n===1?'place':'places'):({one:'место',few:'места'}[plural.select(n)]||'мест');
      saved.push({title:a.textContent.trim()+' · '+n+' '+unit,url,at:Number(localStorage.getItem('ys-recent:'+a.dataset.tripKey))||0});
    }catch{}
  }
  if(!saved.length){
    const choose=make('a',t('Выбрать направление','Choose a destination'));
    choose.href='#destinations';choose.className='phone-start-trip';
    section.append(choose);section.hidden=false;
    section.setAttribute('aria-label',choose.textContent);
    return;
  }
  section.setAttribute('aria-label',t('Сохранённые поездки','Saved trips'));
  saved.sort((a,b)=>b.at-a.at);
  const first=saved.shift(),link=make('a','');
  link.href=first.url;link.className='phone-resume-main';
  link.append(make('strong',t('Продолжить поездку','Continue your trip')),make('span',first.title));
  const arrow=make('b','→');arrow.setAttribute('aria-hidden','true');link.append(arrow);section.append(link);
  if(saved.length){
    const d=make('details','');d.append(make('summary',t('Другие поездки','Other trips')+' · '+saved.length));
    for(const item of saved){const a=make('a',item.title);a.href=item.url;d.append(a)}
    section.append(d);
  }
  section.hidden=false;
}
phone.addEventListener('change',refresh);window.addEventListener('pageshow',refresh);
window.addEventListener('storage',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});refresh();