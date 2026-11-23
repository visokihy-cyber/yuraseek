const fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
async function build(file){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(source,{url:'https://yuraseek.com/'+file,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});const w=dom.window;
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.ResizeObserver=w.IntersectionObserver=class{observe(){} disconnect(){}};w.scrollTo=()=>{};w.fetch=()=>Promise.reject(new Error('Offline build'));w.setInterval=()=>0;
 for(const s of [...w.document.scripts]){if(s.type==='module')continue;const src=s.getAttribute('src');if(src&&/analytics|language/.test(src))continue;try{const code=src?fs.readFileSync(path.join(root,new URL(src,w.location.href).pathname),'utf8'):s.textContent;require('node:vm').runInContext(code,dom.getInternalVMContext());}catch(e){errors.push((src||'inline')+': '+e.message);}}
 require('node:vm').runInContext(fs.readFileSync(path.join(root,'trip-catalog.js'),'utf8').replace('export function','function')+';enhanceCatalogue();',dom.getInternalVMContext());
 await new Promise(r=>setTimeout(r,20));
 const cards=w.document.getElementById('cards'); const count=cards?.querySelectorAll('.card').length;if(errors.length||!count)throw Error(file+': '+errors.join(';'));
 let output=source.replace(/<main id="cards"[^>]*>[\s\S]*?<\/main>/,cards.outerHTML).replace('class="country-page"','class="country-page trip-pilot"');
 if(!output.includes('href="/trip-collection.css'))output=output.replace('</head>','<link rel="stylesheet" href="/trip-collection.css?v=62"></head>');
 fs.writeFileSync(path.join(root,file),output);console.log(file,count);
 dom.window.close();
}
(async()=>{const urls=[...fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').matchAll(/<loc>https:\/\/yuraseek.com\/(.*?\.html)<\/loc>/g)].map(m=>m[1]);for(const f of (process.argv[2]?[process.argv[2]]:urls))await build(f);})();

