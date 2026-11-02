/* Only the neutral homepage chooses a language; explicit language/region URLs stay intact. */
(()=>{
 if(location.pathname!=='/')return;
 const valid=value=>value==='ru'||value==='en';
 const read=(storage,key)=>{try{return storage.getItem(key)}catch{return null}};
 const preference=()=>{try{return read(localStorage,'yuraseek-language')}catch{return null}};
 const visit=lang=>{if(lang==='en')location.replace('/en/'+location.search+location.hash)};
 const saved=preference();if(valid(saved)){visit(saved);return;}
 // A link from another YuraSeek page retains the language of that page.
 try{if(document.referrer&&new URL(document.referrer).origin===location.origin)return}catch{}
 let automatic;try{automatic=read(sessionStorage,'yuraseek-auto-language')}catch{}
 if(valid(automatic)){visit(automatic);return;}
 const fallback=()=>/^ru(?:-|$)/i.test(navigator.language||navigator.languages?.[0]||'')?'ru':'en';
 const controller=new AbortController();let settled=false;
 const finish=(lang,remember=false)=>{
  if(settled)return;settled=true;clearTimeout(timer);controller.abort();
  const chosen=preference();if(valid(chosen))lang=chosen;
  if(remember)try{sessionStorage.setItem('yuraseek-auto-language',lang)}catch{}
  document.documentElement.classList.remove('ys-language-pending');visit(lang);
 };
 const timer=setTimeout(()=>finish(fallback()),1500);
 const style=document.createElement('style');style.textContent='html.ys-language-pending body{visibility:hidden}';document.head.append(style);
 document.documentElement.classList.add('ys-language-pending');
 addEventListener('pageshow',event=>{if(event.persisted)document.documentElement.classList.remove('ys-language-pending')});
 fetch('https://yuraseek-admin.visokihy.workers.dev/api/language',{credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal})
 .then(r=>{if(!r.ok)throw Error('Language unavailable');return r.json()})
 .then(data=>finish(valid(data.language)?data.language:fallback(),valid(data.language)))
 .catch(()=>finish(fallback()));
})();
