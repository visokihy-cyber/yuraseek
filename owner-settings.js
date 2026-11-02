(()=>{'use strict';
const KEY='yuraseek-owner-mode',status=document.getElementById('status'),enable=document.getElementById('enable'),disable=document.getElementById('disable');
function active(){try{if(localStorage.getItem(KEY)==='1')return true;}catch{}return document.cookie.split(';').some(c=>c.trim()===KEY+'=1');}
function render(){const on=active();status.textContent=on?'Режим владельца включён. В этом браузере ваши визиты не учитываются ни Google, ни Яндексом.':'Режим владельца выключен. Для исключения своих посещений включите его в этом браузере.';enable.hidden=on;disable.hidden=!on;}
function change(on){try{if(on)localStorage.setItem(KEY,'1');else localStorage.removeItem(KEY);}catch{}
 const domain=['yuraseek.com','www.yuraseek.com'].includes(location.hostname)?'; Domain=yuraseek.com':'';
 document.cookie=KEY+'='+(on?'1':'')+'; Path=/; Max-Age='+(on?'34560000':'0')+'; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'')+domain;
 render();if(active()!==on)status.textContent='Не удалось сохранить настройку. Разрешите сохранение данных для yuraseek.com и повторите попытку.';
}
enable.addEventListener('click',()=>change(true));disable.addEventListener('click',()=>change(false));window.addEventListener('storage',e=>{if(e.key===KEY)render();});render();})();