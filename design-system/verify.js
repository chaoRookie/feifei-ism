const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const P=path.join(__dirname,'out/project'),A=path.join(__dirname,'../feifei-ism/assets/'),ids={};fs.readFileSync(path.join(__dirname,'blobs.txt'),'utf8').trim().split('\n').forEach(l=>{const[a,b]=l.split(' ');ids[b]=a});
(async()=>{fs.mkdirSync(path.join(__dirname,'out/shots'),{recursive:true});const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:400}});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route('**/*',r=>{const u=new URL(r.request().url());const m=u.pathname.match(/^\/_blob\/(\w+)/);if(m)return r.fulfill({path:A+ids[m[1]],contentType:'image/webp'});if(u.hostname==='ds.test')return r.fulfill({body:global.cur,contentType:'text/html; charset=utf-8'});r.continue()});
const tcss=fs.readFileSync(P+'/tokens.css','utf8'),bcss=fs.readFileSync(P+'/components/bundle.css','utf8'),bjs=fs.readFileSync(P+'/components/bundle.js','utf8');
for(const c of fs.readdirSync(P+'/components').filter(x=>fs.existsSync(`${P}/components/${x}/preview.html`))){
 const body=fs.readFileSync(`${P}/components/${c}/preview.html`,'utf8').replace(/^<!--[^\n]*\n/,'').replace(/<!doctype html>/i,'');
 global.cur=`<!doctype html><html data-theme="paper"><head><style>${tcss}</style><style>${bcss}</style><script>${bjs}<\/script></head>${body.replace(/^<html[^>]*>/,'').replace(/<\/html>\s*$/,'')}</html>`;
 errs.length=0;await pg.goto('https://ds.test/');await pg.waitForTimeout(c==='BrushBars'?2500:1500);
 await pg.screenshot({path:path.join(__dirname,`out/shots/${c}.png`),fullPage:true});console.log(c,errs.join('|')||'no errors');}
await b.close()})();
