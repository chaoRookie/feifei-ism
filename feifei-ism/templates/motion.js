(function(){
const D=document,R=D.documentElement,mq=matchMedia('(prefers-reduced-motion: reduce)');
const FF=window.FF={rm:mq.matches};
const $$=(s,r)=>[...(r||D).querySelectorAll(s)];
let forced=null;
const sync=()=>{FF.rm=forced==null?mq.matches:forced;R.classList.toggle('ffrm',FF.rm);if(FF.rm)$$('.ffpre').forEach(e=>e.classList.remove('ffpre'))};
if(mq.addEventListener)mq.addEventListener('change',sync);else if(mq.addListener)mq.addListener(sync);
FF.reduce=v=>{forced=v==null?null:!!v;sync()};
sync();
const cssv=n=>getComputedStyle(R).getPropertyValue(n).trim();
FF.t=(n,d)=>{const v=cssv(n),m=parseFloat(v);return isNaN(m)?d:(/ms$/.test(v)?m:/s$/.test(v)?m*1000:m)};
function bez(x1,y1,x2,y2){const cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by,X=t=>((ax*t+bx)*t+cx)*t,Y=t=>((ay*t+by)*t+cy)*t,Dv=t=>(3*ax*t+2*bx)*t+cx;return x=>{if(x<=0)return 0;if(x>=1)return 1;let t=x;for(let i=0;i<8;i++){const e=X(t)-x;if(Math.abs(e)<1e-6)break;const d=Dv(t);if(Math.abs(d)<1e-6)break;t-=e/d}if(!(t>=0&&t<=1)){let a=0,b=1;t=x;for(let i=0;i<40;i++){if(X(t)<x)a=t;else b=t;t=(a+b)/2}}return Y(t)}}
FF.bez=bez;
const E=FF.ease={pull:t=>t<=0?0:t>=1?1:(1-1/(5*t+1))/(1-1/6),out:bez(.3,.7,.2,1),exit:bez(.4,.14,1,1),drop:bez(.5,0,.9,.4),move:t=>t*t*t*(t*(t*6-15)+10),brush:t=>Math.pow(Math.max(0,Math.min(1,t)),1.45),scrape:t=>.18*t+.82*t*t*t,lin:t=>t};
const C=FF.css={out:'cubic-bezier(.3,.7,.2,1)',exit:'cubic-bezier(.4,.14,1,1)',drop:'cubic-bezier(.5,0,.9,.4)',move:CSS.supports('transition-timing-function','linear(0,1)')?'linear(0, 0.0007, 0.0051, 0.0161, 0.0355, 0.0645, 0.1035, 0.1522, 0.2099, 0.2752, 0.3466, 0.4222, 0.5, 0.5778, 0.6534, 0.7248, 0.7901, 0.8478, 0.8965, 0.9355, 0.9645, 0.9839, 0.9949, 0.9993, 1)':'cubic-bezier(.65,0,.35,1)'};
const play=FF.play=function(o,ms,ease,fn){const id=(o.__ff||0)+1;o.__ff=id;return new Promise(r=>{if(FF.rm||ms<=0){fn(1);r(true);return}const a=performance.now();(function f(n){if(o.__ff!==id){r(false);return}const t=Math.min(1,(n-a)/ms);fn(ease(t));t<1?requestAnimationFrame(f):r(true)})(a)})};
FF.stop=o=>{o.__ff=(o.__ff||0)+1};
FF.tween=(ms,fn)=>play({},ms,E.move,fn);
const load=FF.load=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=s});
const tint=FF.tint=function(img,col){const c=D.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='multiply';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='destination-in';x.drawImage(img,0,0);return c};
const url=n=>{const m=cssv(n).match(/^url\(\s*["']?([\s\S]*?)["']?\s*\)$/);return m?m[1]:''};
const ST=[0,1,2,3,4,5].map(i=>url('--ff-st'+i));
FF.ready=Promise.all(ST.map(s=>s?load(s):Promise.resolve(null))).then(ims=>{const ok=ims.filter(Boolean),main=cssv('--c')||'#211C1C';FF.tex={raw:ok,ink:ok.map(i=>tint(i,'#5B4F4A')),pale:ok.map(i=>tint(i,'#7C6C66')),main:ok.map(i=>tint(i,main))};return FF.tex});
const R32=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const HS=(a,b)=>{let h=Math.imul(a*374761393+b*668265263|0,1274126177);h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296};
FF.line=(a,b,n)=>[...Array(n+1)].map((_,i)=>[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n]);
FF.cub=(p0,p1,p2,p3,n)=>[...Array(n+1)].map((_,i)=>{const t=i/n,s=1-t;return[s*s*s*p0[0]+3*s*s*t*p1[0]+3*s*t*t*p2[0]+t*t*t*p3[0],s*s*s*p0[1]+3*s*s*t*p1[1]+3*s*t*t*p2[1]+t*t*t*p3[1]]});
const TAPER=u=>u<.08?.8+.35*u/.08:(u<.6?1.15-.15*(u-.08)/.52:1-.78*(u-.6)/.4);
const ribbon=FF.ribbon=function(x,img,pts,w,prog,tp){prog=prog==null?1:prog;const L=[0];for(let i=1;i<pts.length;i++)L[i]=L[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const T=L[L.length-1];
 for(let i=0;i<pts.length-1;i++){if(L[i]/T>prog)break;const a=pts[i],b=pts[i+1],g=Math.atan2(b[1]-a[1],b[0]-a[0]),d=L[i+1]-L[i],sx=L[i]/T*img.width,sw=Math.max(1,d/T*img.width),k=tp?tp(L[i]/T):1;x.save();x.translate(a[0],a[1]);x.rotate(g);x.drawImage(img,sx,0,sw,img.height,0,-w*k/2,d+1.5,w*k);x.restore()}return T};

const MK=CSS.supports('mask-image','none')?'mask':(CSS.supports('-webkit-mask-image','none')?'webkitMask':'');
const mk=(el,k,v)=>{if(MK)el.style[MK+k]=v};
function smearSet(el,o){const s=el.__sm={W:el.offsetWidth||1,H:el.offsetHeight||1,dx:o.dx==null?14:o.dx,line:o.edge==='line'||!MK||!ST[3]};if(!s.line){mk(el,'Image','var(--ff-st3),linear-gradient(#000,#000)');mk(el,'Repeat','no-repeat')}return s}
function smearAt(el,p){const s=el.__sm;if(s.line){el.style.clipPath='inset(-4% '+((1-p)*104)+'% -4% -4%)'}else{const sw=Math.max(s.W*.5,140),sh=s.H*1.8,x=-sw+p*(s.W+sw*1.05),so=Math.max(0,x+sw*.45);mk(el,'Size',sw+'px '+sh+'px,'+so+'px 100%');mk(el,'Position',x+'px '+((s.H-sh)/2)+'px,0 0')}el.style.transform=s.dx?'translateX('+((1-p)*-s.dx)+'px)':''}
const unmask=FF.unmask=el=>{el.__sm=null;el.style.clipPath='';el.style.opacity='';mk(el,'Image','');mk(el,'Repeat','');mk(el,'Size','');mk(el,'Position','');el.style.transform=''};
FF.hide=(el,o={})=>{el.style.clipPath='';smearSet(el,o);smearAt(el,0)};
FF.smear=function(el,o={}){const ms=o.ms||FF.t('--t-smear',1500);el.style.opacity='';FF.hide(el,o);return play(el,ms,E.pull,p=>smearAt(el,p)).then(ok=>{if(ok)unmask(el);return ok})};
FF.wipe=function(el,ms){unmask(el);return play(el,ms||FF.t('--t-exit',280),E.exit,p=>{el.style.clipPath='inset(-4% -4% -4% '+(p*104)+'%)';el.style.transform='translateX('+(p*10)+'px)';el.style.opacity=String(1-p*.4)})};
FF.exit=el=>FF.wipe(el,FF.t('--t-exit',280));
FF.pull=function(el,o={}){let d=null;el.style.touchAction='pan-y';
 el.addEventListener('pointerdown',e=>{if(FF.rm)return;d={x:e.clientX,y:e.clientY,id:e.pointerId,on:false,p:0}});
 el.addEventListener('pointermove',e=>{if(!d)return;const mx=e.clientX-d.x,my=e.clientY-d.y;if(!d.on){if(Math.abs(my)>8&&Math.abs(my)>=Math.abs(mx)){d=null;return}if(mx<=8||mx<=Math.abs(my))return;d.on=true;d.x=e.clientX;try{el.setPointerCapture(d.id)}catch(_){}FF.stop(el);el.style.opacity='';FF.hide(el,o)}const m=Math.max(0,e.clientX-d.x);d.p=1-1/(m*.55/el.__sm.W*3+1);smearAt(el,d.p)});
 const up=()=>{if(!d)return;const on=d.on,p0=d.p;d=null;if(!on)return;play(el,Math.max(300,1500*(1-p0)),E.pull,t=>smearAt(el,p0+(1-p0)*t)).then(ok=>{if(ok)unmask(el)})};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)};
FF.reveal=function(sel,o={}){const S=$$(sel||'.sm,.sign');if(FF.rm||!S.length)return;if(!('IntersectionObserver' in window))return;const gap=o.gap==null?140:o.gap;S.forEach(s=>FF.hide(s));
 const io=new IntersectionObserver(es=>{const hit=es.filter(e=>e.isIntersecting).map(e=>e.target);hit.forEach((s,i)=>{io.unobserve(s);setTimeout(()=>FF.smear(s),i*gap)})},{rootMargin:'0px 0px -'+Math.round((1-(o.at||.92))*100)+'% 0px'});S.forEach(s=>io.observe(s))};

function hair(x,pts,W,prog,seed,col){const n=pts.length,Lc=[0];for(let i=1;i<n;i++)Lc[i]=Lc[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const T=Lc[n-1],r=R32(seed),B=36,rgb='rgba('+col.join(',')+',';
 const br=[...Array(B)].map((_,b)=>({o:(b+r()*.9)/B-.5,ink:.38+.62*r(),dry:.28+.6*r(),w:.45+1.1*r(),ph:r()*6.3}));x.lineCap='round';
 br.forEach((q,b)=>{let pv=null;const lag=Math.pow(1-q.ink,1.3)*.34+q.ph/6.3*.05,pb=prog>=1?1:Math.max(0,(prog-lag)/(1-lag));for(let i=0;i<n;i++){const u=Lc[i]/T;if(u>pb)break;const a=pts[Math.max(0,i-1)],c=pts[Math.min(n-1,i+1)],g=Math.atan2(c[1]-a[1],c[0]-a[0]),nx=-Math.sin(g),ny=Math.cos(g),w=W*TAPER(u),off=(q.o*(1-.25*Math.max(0,u-.6))+Math.sin(u*8+q.ph)*.05)*w,px=pts[i][0]+nx*off,py=pts[i][1]+ny*off,dry=u>q.dry?Math.min(1,(u-q.dry)/(1-q.dry)*1.7):0;
  if(HS(b,i)<dry*.88||HS(b+97,i>>2)<.035){pv=null;continue}
  if(pv){x.strokeStyle=rgb+(q.ink*(1-dry*.55)).toFixed(3)+')';x.lineWidth=Math.max(.7,w/B*2.6*q.w*(1-dry*.45));x.beginPath();x.moveTo(pv[0],pv[1]);x.lineTo(px,py);x.stroke()}pv=[px,py]}})}
FF.hair=(x,pts,W,prog,seed,col)=>hair(x,pts,W,prog,seed,col||[33,28,28]);
FF.write=function(cv,strokes,o={}){const x=cv.getContext('2d'),ms=o.ms||1250,gap=o.gap==null?.03:o.gap,col=o.color||[33,28,28];const L=strokes.map(s=>{let l=0;for(let i=1;i<s.pts.length;i++)l+=Math.hypot(s.pts[i][0]-s.pts[i-1][0],s.pts[i][1]-s.pts[i-1][1]);return Math.max(1,l)});
 const tot=L.reduce((a,b)=>a+b,0),span=1-gap*(strokes.length-1);let at=0;const win=strokes.map((s,i)=>{if(s.t0!=null&&s.t1!=null)return[s.t0,s.t1];const a=at,b=a+span*L[i]/tot;at=b+gap;return[a,b]});
 const draw=t=>{x.clearRect(0,0,cv.width,cv.height);strokes.forEach((s,i)=>{const[a,b]=win[i],p=t>=1?1:(t<=a?0:E.brush(Math.min(1,(t-a)/(b-a))));if(p>0)hair(x,s.pts,s.w||60,p,s.seed==null?i*7+3:s.seed,col)})};
 return{draw,final:()=>draw(1),clear:()=>x.clearRect(0,0,cv.width,cv.height),play:()=>play(cv,ms,E.lin,draw).then(ok=>{if(ok)draw(1);return ok})}};

FF.stamp=function(el){if(FF.rm)return Promise.resolve(true);let ch=el.__chop;if(!ch){ch=D.createElement('span');ch.className='ffchop';ch.setAttribute('aria-hidden','true');el.after(ch);el.__chop=ch;const p=el.offsetParent;if(p&&getComputedStyle(p).position==='static')p.style.position='relative'}
 ch.style.left=(el.offsetLeft-3)+'px';ch.style.top=(el.offsetTop-3)+'px';ch.style.width=(el.offsetWidth+6)+'px';ch.style.height=(el.offsetHeight+6)+'px';
 [el,ch].forEach(x=>x.getAnimations().forEach(a=>a.cancel()));const T=980,F='rgba(33,28,28,';
 const an=ch.animate([{transform:'scale(1.2) rotate(-4deg)',opacity:0,boxShadow:'7px 16px 20px '+F+'.14)'},{transform:'scale(1.3) rotate(-3deg)',opacity:1,boxShadow:'9px 20px 24px '+F+'.16)',offset:.15,easing:C.drop},{transform:'scale(1) rotate(-1.5deg)',opacity:1,boxShadow:'0 0 0 '+F+'.3)',offset:.27,easing:'linear'},{transform:'scale(.985) rotate(-2.3deg)',opacity:1,boxShadow:'0 0 0 '+F+'.3)',offset:.4},{transform:'scale(.985) rotate(-.7deg)',opacity:1,boxShadow:'0 0 0 '+F+'.3)',offset:.53},{transform:'scale(1) rotate(-1.5deg)',opacity:1,boxShadow:'0 0 0 '+F+'.3)',offset:.64,easing:C.out},{transform:'scale(1.22) rotate(-1deg)',opacity:0,boxShadow:'7px 16px 20px '+F+'.1)'}],{duration:T,fill:'both'});
 el.animate([{opacity:0},{opacity:0,offset:.26},{opacity:1,filter:'brightness(1.35)',offset:.27},{opacity:1,filter:'brightness(1.08)',offset:.64},{opacity:1,filter:'brightness(1)'}],{duration:T,fill:'backwards'});
 const host=el.closest('[data-shake]');if(host){host.getAnimations().forEach(a=>{if(a.id==='ffshake')a.cancel()});const h=host.animate([{transform:'none'},{transform:'none',offset:.26},{transform:'translateY(2px)',offset:.28,easing:C.out},{transform:'translateY(.6px)',offset:.45,easing:C.out},{transform:'none',offset:.7}],{duration:T});h.id='ffshake'}
 return an.finished.then(()=>true,()=>false)};
FF.stampOnView=function(el){if(FF.rm||el.__ffs||!('IntersectionObserver' in window))return;el.__ffs=1;el.style.opacity='0';const io=new IntersectionObserver(es=>{if(!es.some(e=>e.isIntersecting))return;io.disconnect();el.style.opacity='';requestAnimationFrame(()=>FF.stamp(el))},{rootMargin:'0px 0px -8% 0px'});io.observe(el)};

FF.scrape=function(cv,o){const sx=cv.getContext('2d'),BX=o.block,path=o.path,PW=o.width||82,ms=o.ms||2300,EXIT=380;
 const mk2=()=>{const c=D.createElement('canvas');c.width=cv.width;c.height=cv.height;return c};const blk=mk2(),art=mk2(),flat=mk2(),tmp=mk2(),resid=mk2();let built=false;
 const RXa=Math.min(...path.map(r=>r[0]))-38,RXb=Math.max(...path.map(r=>r[0]));
 const seg=x=>{for(let i=1;i<path.length;i++)if(path[i][0]>=x)return[path[i-1],path[i]];return[path[path.length-2],path[path.length-1]]};
 const roadY=x=>{const[a,b]=seg(x),k=b[0]===a[0]?0:Math.max(0,Math.min(1,(x-a[0])/(b[0]-a[0])));return a[1]+(b[1]-a[1])*k};
 const roadSpan=x=>{const[a,b]=seg(x),k=(b[1]-a[1])/Math.max(.5,Math.abs(b[0]-a[0]));return Math.min(95,PW*.585*Math.sqrt(1+k*k))};
 function rag(b){const [x0,y0,x1,y1]=BX,N=40,P=[];for(let k=0;k<=N;k++)P.push([x0+(x1-x0)*k/N,y0+(HS(k,1)-.5)*16]);for(let k=0;k<=N;k++)P.push([x1+(HS(k,2)-.5)*16,y0+(y1-y0)*k/N]);for(let k=N;k>=0;k--)P.push([x0+(x1-x0)*k/N,y1+(HS(k,3)-.5)*16]);for(let k=N;k>=0;k--)P.push([x0+(HS(k,4)-.5)*16,y0+(y1-y0)*k/N]);
  b.globalCompositeOperation='destination-in';b.beginPath();P.forEach((q,i)=>i?b.lineTo(q[0],q[1]):b.moveTo(q[0],q[1]));b.closePath();b.fill();b.globalCompositeOperation='source-over'}
 function build(){const ink=(FF.tex&&FF.tex.ink)||[],raw=(FF.tex&&FF.tex.raw)||[];const b=blk.getContext('2d'),H=BX[3]-BX[1],rows=Math.ceil(H/42)+2;b.clearRect(0,0,blk.width,blk.height);
  if(ink.length){for(let i=-1;i<=rows;i++){const yy=BX[1]+i*42;ribbon(b,ink[(i+10)%ink.length],FF.cub([BX[0]-40,yy],[BX[0]+140,yy+(HS(i,31)-.5)*40],[BX[2]-140,yy+(HS(i,32)-.5)*40],[BX[2]+40,yy],30),104,1)}for(let i=0;i<14;i++){const x=BX[0]+HS(i,33)*(BX[2]-BX[0]),y=BX[1]+HS(i,34)*H;ribbon(b,ink[i%ink.length],FF.line([x-30,y-26],[x+30,y+26],8),46,1)}}else{b.fillStyle='#3A302C';b.fillRect(0,0,blk.width,blk.height)}rag(b);
  const m=flat.getContext('2d');m.clearRect(0,0,flat.width,flat.height);if(raw.length>2)ribbon(m,raw[2],path,PW,1,u=>.85+.25*Math.sin(u*Math.PI));else{m.strokeStyle='#000';m.lineWidth=PW*.9;m.lineCap='round';m.beginPath();path.forEach((r,i)=>i?m.lineTo(r[0],r[1]):m.moveTo(r[0],r[1]));m.stroke()}
  const t=resid.getContext('2d');t.clearRect(0,0,resid.width,resid.height);t.lineCap='round';const W0=BX[2]-BX[0];
  for(let k=0;k<34;k++){const off=(HS(k,21)-.5)*PW*.85;t.lineWidth=.8+HS(k,23)*2;t.setLineDash([4+HS(k,24)*34,3+HS(k,25)*26]);for(let i=1;i<path.length;i++){const r=path[i],q0=path[i-1],q2=path[Math.min(path.length-1,i+1)],g=Math.atan2(q2[1]-q0[1],q2[0]-q0[0]),u=Math.max(0,(r[0]-BX[0])/W0),al=(.05+.12*HS(k,22))*(1+Math.max(0,(u-.7)/.3)*1.6);t.strokeStyle='rgba(33,28,28,'+Math.min(.42,al).toFixed(3)+')';t.beginPath();t.moveTo(q0[0]-Math.sin(g)*off,q0[1]+Math.cos(g)*off);t.lineTo(r[0]-Math.sin(g)*off,r[1]+Math.cos(g)*off);t.stroke()}}
  t.setLineDash([]);t.globalCompositeOperation='destination-in';t.drawImage(blk,0,0);t.drawImage(flat,0,0);t.globalCompositeOperation='source-over';
  const a=art.getContext('2d');a.clearRect(0,0,art.width,art.height);a.drawImage(blk,0,0);a.globalCompositeOperation='destination-out';a.drawImage(flat,0,0);a.globalCompositeOperation='source-over';a.drawImage(resid,0,0);built=true}
 function at(p,ex){if(!built)build();sx.clearRect(0,0,cv.width,cv.height);const X0=RXa-10,X1=BX[2]+30,xf=X0+p*(X1-X0);sx.drawImage(blk,0,0);
  const A=Math.max(0,Math.min(1,(xf-RXa)/(RXb-RXa))),xc=Math.min(Math.max(xf,path[0][0]),RXb),rx=1.5+24*Math.pow(A,.8),ry=roadSpan(xc)+8,lx=xf+rx*.35+ex*120,ly=roadY(xc)+ex*ex*40;
  if(xf>X0){const t=tmp.getContext('2d');t.clearRect(0,0,tmp.width,tmp.height);t.save();t.beginPath();t.rect(0,0,Math.max(0,xf-rx*.5),tmp.height);if(ex<=0&&A>0)t.ellipse(lx,ly,rx*.9,ry*.95,0,0,Math.PI*2);t.clip();t.drawImage(flat,0,0);t.restore();
   sx.globalCompositeOperation='destination-out';sx.drawImage(tmp,0,0);sx.globalCompositeOperation='source-over';sx.save();sx.beginPath();sx.rect(0,0,Math.max(0,xf-rx),cv.height);sx.clip();sx.drawImage(resid,0,0);sx.restore()}
  if(A<=0||ex>=1)return;const ink=(FF.tex&&FF.tex.ink)||[];
  const q=tmp.getContext('2d');q.clearRect(0,0,tmp.width,tmp.height);q.save();q.globalAlpha=1-ex;q.translate(lx,ly);q.shadowColor='rgba(20,16,14,'+(.15+.25*A).toFixed(2)+')';q.shadowBlur=2+7*A;q.shadowOffsetX=1+3*A;q.shadowOffsetY=1+2*A;q.beginPath();for(let k=0;k<=48;k++){const g=k/48*Math.PI*2,w=1+.1*Math.sin(g*3+A*5)+.05*Math.sin(g*7);q.lineTo(Math.cos(g)*rx*w,Math.sin(g)*ry*w)}q.closePath();q.fillStyle='#2A2422';q.fill();q.shadowColor='transparent';q.clip();
  if(ink.length){q.rotate(Math.PI/2);q.drawImage(ink[5%ink.length],-ry*1.1,-rx*1.6,ry*2.2,rx*3.2);q.rotate(-Math.PI/2)}
  const hl=Math.min(1,A*3);q.strokeStyle='rgba(255,250,240,'+(.38*hl).toFixed(3)+')';q.lineWidth=.6+A;q.beginPath();q.ellipse(rx*.15,0,rx*.6,ry*.86,0,-1.3,1.2);q.stroke();q.strokeStyle='rgba(255,250,240,'+(.15*hl).toFixed(3)+')';q.lineWidth=1;for(let k=0;k<5;k++){q.beginPath();q.ellipse(-rx*.2,0,rx*(.3+k*.1),ry*(.55+k*.08),0,-1.1,1.1);q.stroke()}q.restore();q.globalCompositeOperation='destination-in';q.drawImage(blk,0,0);q.globalCompositeOperation='source-over';sx.drawImage(tmp,0,0)}
 const final=()=>{if(!built)build();sx.clearRect(0,0,cv.width,cv.height);sx.drawImage(art,0,0);return true};
 return{final:()=>FF.ready.then(final),start:()=>FF.ready.then(()=>{at(0,0);return true}),rebuild:()=>{built=false},play:()=>FF.ready.then(()=>{if(!built)build();return play(cv,ms+EXIT,E.lin,t=>{const m=t*(ms+EXIT);if(m<ms)at(E.scrape(m/ms),0);else at(1,E.out((m-ms)/EXIT))}).then(ok=>{if(ok)final();return ok})})}};

FF.flip=function(box,mutate){const kids=[...box.children],first=new Map(kids.map(k=>[k,k.getBoundingClientRect()]));kids.forEach(k=>k.getAnimations().forEach(a=>{if(a.id==='ffmv')a.cancel()}));mutate();if(FF.rm)return Promise.resolve(true);const ms=FF.t('--t-move',520),all=[];
 [...box.children].forEach(k=>{const a=first.get(k);if(!a)return;const b=k.getBoundingClientRect(),dx=a.left-b.left,dy=a.top-b.top;if(Math.abs(dx)<1&&Math.abs(dy)<1)return;const s=1+Math.min(.05,Math.abs(dx)/2000+.03);const an=k.animate([{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'translate('+dx/2+'px,'+dy/2+'px) scaleX('+s+')',offset:.5},{transform:'none'}],{duration:ms,easing:C.move});an.id='ffmv';all.push(an.finished)});
 return Promise.all(all).then(()=>true,()=>false)};
FF.count=function(el,n){const s=String(n),old=el.dataset.v||'';el.dataset.v=s;el.setAttribute('aria-label',s);const L=Math.max(s.length,old.length),out=200,inn=FF.t('--t-release',380);let cells=[...el.children];
 while(cells.length<L){const c=D.createElement('span');c.className='ffcell';c.setAttribute('aria-hidden','true');el.prepend(c);cells.unshift(c)}
 cells.forEach((c,i)=>{const nd=s[i-(L-s.length)]||'',prev=c.lastElementChild;if(prev&&prev.textContent===nd)return;const k=(L-1-i)*40,ni=D.createElement('i');ni.textContent=nd;c.appendChild(ni);[...c.children].slice(0,-2).forEach(x=>x.remove());
  if(FF.rm||!prev){if(prev)prev.remove();return}
  prev.animate([{transform:'none',opacity:1},{transform:'translateY(-.8em)',opacity:0}],{duration:out,easing:C.exit,delay:k,fill:'forwards'}).finished.then(()=>prev.remove()).catch(()=>{});
  ni.animate([{transform:'translateY(.8em)',opacity:0},{transform:'none',opacity:1}],{duration:inn,easing:C.out,delay:k+60,fill:'backwards'})});
 [...el.children].forEach(c=>{if(!c.lastElementChild||c.lastElementChild.textContent==='')setTimeout(()=>{if(c.lastElementChild&&c.lastElementChild.textContent==='')c.remove()},700)})};
FF.swap=async function(panel,render){const tok=(panel.__sw||0)+1;panel.__sw=tok;if(FF.rm){await render();return true}await FF.wipe(panel,FF.t('--t-exit',280));if(panel.__sw!==tok)return false;await render();if(panel.__sw!==tok)return false;return FF.smear(panel,{ms:FF.t('--t-smear-s',600),dx:10})};
let wn=0;
FF.wet=function(img,o={}){if(FF.rm)return Promise.resolve(false);if(!o.force&&matchMedia('(max-width:760px),(pointer:coarse)').matches)return Promise.resolve(false);let f=img.__wet;if(!f){const id='ffwet'+(++wn),d=D.createElement('div');d.innerHTML='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="'+id+'" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></svg>';D.body.appendChild(d.firstChild);f=img.__wet=D.getElementById(id)}
 const n=f.querySelector('feTurbulence'),dm=f.querySelector('feDisplacementMap');img.style.filter='url(#'+f.id+')';n.setAttribute('seed',String(1+Math.floor(Math.random()*90)));
 return play(img,1400,E.lin,t=>{const m=t*1400,s=m<300?E.out(m/300)*16:16*(1-E.out((m-300)/1100));dm.setAttribute('scale',s.toFixed(2));n.setAttribute('baseFrequency',(.022+.006*Math.sin(t*3)).toFixed(4))}).then(ok=>{if(ok)img.style.filter='';return ok})};
FF.depth=function(sel){const S=$$(sel||'[data-depth]');if(!S.length)return;const off=()=>FF.rm||matchMedia('(max-width:760px),(pointer:coarse)').matches;let q=false;S.forEach(el=>el.classList.add('ffdeep'));
 const run=()=>{q=false;const o=off(),h=innerHeight;S.forEach(el=>{if(o){el.style.transform='';return}const r=(el.parentElement||el).getBoundingClientRect(),c=(r.top+r.height/2-h/2)/h,k=parseFloat(el.dataset.depth)||0;el.style.transform='translate3d(0,'+(-c*k*100).toFixed(1)+'px,0)'})};
 const req=()=>{if(!q){q=true;requestAnimationFrame(run)}};addEventListener('scroll',req,{passive:true});addEventListener('resize',req);run()};
let gp=null;
FF.gsap=function(plugins){const base='https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/',P=plugins||[];const js=n=>new Promise((ok,no)=>{const s=D.createElement('script');s.src=base+n+'.min.js';s.onload=ok;s.onerror=no;D.head.appendChild(s)});
 gp=gp||js('gsap').then(()=>window.gsap);
 return gp.then(g=>Promise.all(P.map(n=>window[n]?0:js(n))).then(()=>{P.forEach(n=>{if(window[n])g.registerPlugin(window[n])});return g})).catch(()=>null)};

const KB='button.k1,button.k2,button.k3,button.k4,button.k5,button.k6';
FF.roles=[['.stage button,.slabs button','k1'],['.quiz button','k2'],['button','k4']];
FF.skip='.plain,.term,.seal,[role=switch],[data-raw],.ffnav button';
const hasK=b=>/(^|\s)k[1-6](\s|$)/.test(b.className);
const IO='IntersectionObserver' in window;
let io=null;
const inView=b=>{const r=b.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight};
function strike(b){const k=b.querySelector(':scope>.ffslash');if(!k)return;if(FF.rm){k.classList.remove('ffpre','ffgo');return}k.classList.remove('ffpre','ffgo');void k.offsetWidth;k.classList.add('ffgo')}
function draw5(b){if(b.disabled)return;if(FF.rm){b.classList.remove('ffpre','ffdraw');return}b.classList.remove('ffpre','ffdraw');void b.offsetWidth;b.classList.add('ffdraw')}
function stampIn(b){const h=b.querySelector('.ffh');if(!h||FF.rm)return;h.getAnimations().forEach(x=>x.cancel());h.animate([{transform:'rotate(-7deg) scale(1.5)',opacity:.2,filter:'brightness(1)',easing:C.drop},{transform:'rotate(-2.5deg) scale(.9)',opacity:1,filter:'brightness(.55)',offset:.3,easing:C.out},{transform:'rotate(-2.5deg) scale(1.1,.84)',opacity:1,filter:'brightness(.55)',offset:.55,easing:C.out},{transform:'rotate(-2.5deg) scale(1)',opacity:1,filter:'brightness(1.4)',offset:.72},{transform:'rotate(-2.5deg) scale(1)',opacity:1,filter:'brightness(1)'}],{duration:680});b.animate([{transform:'none'},{transform:'none',offset:.29},{transform:'translateY(2px)',offset:.32,easing:C.out},{transform:'none',offset:.7}],{duration:680})}
FF.strike=strike;FF.redraw=draw5;FF.seal=stampIn;
function watch(b){if(FF.rm||!IO)return;if(!io)io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const b=e.target;if(b.disabled)setTimeout(()=>strike(b),200);else if(b.classList.contains('k5'))draw5(b)}),{rootMargin:'0px 0px -12% 0px'});io.observe(b)}
function slashSync(b,live){const k=b.querySelector(':scope>.ffslash');if(!b.disabled){if(k)k.remove();return}b.classList.remove('ffpre');if(k)return;const s=D.createElement('span');s.className='ffslash';s.setAttribute('aria-hidden','true');b.appendChild(s);if(FF.rm||!IO)return;if(live&&inView(b))strike(b);else{s.classList.add('ffpre');watch(b)}}
function wrapTx(b){if(b.querySelector(':scope>.fftx'))return;const s=D.createElement('span');s.className='fftx';[...b.childNodes].forEach(n=>{if(!(n.classList&&n.classList.contains('ffslash')))s.appendChild(n)});b.prepend(s)}
function adopt(b){if(!hasK(b)&&!b.matches(FF.skip)){const r=FF.roles.find(x=>b.matches(x[0]));if(r)b.classList.add(r[1])}if(b.__ffb||!b.matches(KB))return;b.__ffb=1;
 if(b.classList.contains('k6')&&!b.querySelector('.ffh')){const t=b.dataset.seal||(b.textContent.trim()[0]||'');if(t){const h=D.createElement('span');h.className='ffh';h.setAttribute('aria-hidden','true');h.textContent=t;b.prepend(h)}}
 if(b.classList.contains('k5')){wrapTx(b);if(!FF.rm&&IO&&!b.disabled){b.classList.add('ffpre');watch(b)}}
 slashSync(b,false)}
FF.buttons=function(root){root=root||D;if(root.tagName==='BUTTON')adopt(root);root.querySelectorAll('button').forEach(adopt)};
let pressed=null;
const down=b=>{if(b.disabled)return;clearTimeout(b.__tm);b.__t0=performance.now();b.classList.add('ffdown');pressed=b};
const release=()=>{const b=pressed;if(!b)return;pressed=null;clearTimeout(b.__tm);b.__tm=setTimeout(()=>b.classList.remove('ffdown'),Math.max(0,FF.t('--t-press-min',170)-(performance.now()-b.__t0)))};
function hitDisabled(e){const t=e.target;if(!t||!t.querySelectorAll)return;const x=e.clientX,y=e.clientY;for(const b of t.querySelectorAll('button:disabled')){if(!b.matches(KB))continue;const r=b.getBoundingClientRect();if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom){strike(b);return}}}
const near=e=>e.target&&e.target.closest?e.target.closest(KB):null;
D.addEventListener('pointerdown',e=>{const b=near(e);if(b)down(b);else hitDisabled(e)},true);
D.addEventListener('pointerup',release,true);D.addEventListener('pointercancel',release,true);
D.addEventListener('pointerout',e=>{if(pressed&&e.target===pressed&&!pressed.contains(e.relatedTarget))release()},true);
D.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){const b=near(e);if(b)down(b)}},true);
D.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')release()},true);
D.addEventListener('click',e=>{const b=near(e);if(b&&!b.disabled&&b.hasAttribute('data-toggle'))b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'))},true);
D.addEventListener('click',e=>{const b=near(e);if(!b||b.disabled)return;if(b.classList.contains('k5'))draw5(b);if(b.classList.contains('k6')&&!b.hasAttribute('aria-pressed'))stampIn(b)});
D.addEventListener('touchstart',()=>{},{passive:true});
const mo=new MutationObserver(ms=>ms.forEach(m=>{if(m.type==='childList'){m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.tagName==='BUTTON')adopt(n);else if(n.querySelectorAll)n.querySelectorAll('button').forEach(adopt)});return}
 const b=m.target;if(b.tagName!=='BUTTON')return;if(!b.__ffb){adopt(b);return}
 if(m.attributeName==='disabled')slashSync(b,true);
 else if(m.attributeName==='aria-pressed'&&b.classList.contains('k6')&&b.getAttribute('aria-pressed')==='true'&&m.oldValue!=='true')stampIn(b)}));
const boot=()=>{FF.buttons();mo.observe(R,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','aria-pressed'],attributeOldValue:true});FF.reveal();$$('[data-stamp]').forEach(FF.stampOnView);FF.depth();$$('#up,[data-top]').forEach(b=>b.addEventListener('click',()=>scrollTo({top:0,behavior:FF.rm?'auto':'smooth'})))};
D.readyState==='loading'?D.addEventListener('DOMContentLoaded',boot):boot();
})();
