const SLOT={cur:null,P:{error:4,load:3,hidden:2,rare:1},req(k){if(this.cur&&this.P[this.cur]>=this.P[k])return false;this.cur=k;dispatchEvent(new CustomEvent('mate',{detail:k}));return true},rel(k){if(this.cur===k)this.cur=null}};
Promise.all([FF.load('__ASSET:partners/dswim.webp__'),FF.load('__ASSET:partners/dragon_peek.webp__')]).then(([dragon,dpeek])=>{
 const mc=document.getElementById('mate'),mx=mc.getContext('2d'),sc=document.getElementById('swim'),sx=sc.getContext('2d');let run=0;
 function draw(cx,img,c,i){if(!img)return;const fw=img.width/25;cx.imageSmoothingEnabled=false;cx.clearRect(0,0,c.width,c.height);cx.drawImage(img,Math.floor(i%25)*fw,0,fw,img.height,0,0,c.width,c.width*img.height/fw)}
 function stop(){run++;mc.hidden=true;sc.hidden=true;sc.classList.remove('on')}
 addEventListener('mate',stop);
 function peek(kind,ms){const who=[dpeek].filter(Boolean);if(!who.length||!SLOT.req(kind))return;const pal=who[Math.floor(Math.random()*who.length)];const me=++run;mc.hidden=false;if(RM){draw(mx,pal,mc,12);setTimeout(()=>{if(me===run){mc.hidden=true;SLOT.rel(kind)}},ms);return}const a=performance.now();(function f(n){if(me!==run)return;const k=(n-a)/ms;if(k>=1){mc.hidden=true;SLOT.rel(kind);return}draw(mx,pal,mc,Math.floor(k*25));requestAnimationFrame(f)})(a)}
 function swim(){if(!dragon||RM||!SLOT.req('rare'))return;const me=++run;sc.hidden=false;sc.classList.add('on');const a=performance.now();(function f(n){if(me!==run)return;const k=(n-a)/14000;if(k>=1){sc.hidden=true;sc.classList.remove('on');SLOT.rel('rare');return}draw(sx,dragon,sc,n/90);sc.style.transform='translateX('+(-110+k*(innerWidth+220))+'px)';requestAnimationFrame(f)})(a)}
 const quit=()=>{if(!sc.hidden){stop();SLOT.rel('rare')}};sc.addEventListener('click',quit);addEventListener('keydown',e=>{if(e.key==='Escape')quit()});
 peek('load',1800);
 if(location.hash==='#longlong'||Math.random()<1/30)setTimeout(swim,2400);
 let taps=0;['first','seal'].forEach(i=>{const e=document.getElementById(i);if(e)e.addEventListener('click',()=>{if(++taps>=3){taps=0;peek('hidden',2400)}})});
 window.mateError=()=>peek('error',2400);
});
