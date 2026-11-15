(()=>{
 const EPOCH=Date.parse('2026-11-14T00:00:00Z'),rST=window.setTimeout.bind(window),rMC=window.MessageChannel;
 let now=0,seq=0;const timers=new Map(),rafs=new Map(),anims=new Map(),seen=new WeakSet();
 performance.now=()=>now;
 Date.now=()=>EPOCH+now;
 window.setTimeout=(fn,ms,...a)=>{const id=++seq;timers.set(id,{due:now+Math.max(0,+ms||0),fn,a,every:0});return id};
 window.setInterval=(fn,ms,...a)=>{const id=++seq,every=Math.max(1,+ms||0);timers.set(id,{due:now+every,fn,a,every});return id};
 window.clearTimeout=window.clearInterval=id=>{timers.delete(id)};
 window.requestAnimationFrame=fn=>{const id=++seq;rafs.set(id,fn);return id};
 window.cancelAnimationFrame=id=>{rafs.delete(id)};
 const ani=Element.prototype.animate;
 Element.prototype.animate=function(...a){const x=ani.apply(this,a);seen.add(x);anims.set(x,now);x.pause();x.currentTime=0;return x};
 const flush=()=>new Promise(r=>{const c=new rMC();c.port1.onmessage=()=>rST(r,0);c.port2.postMessage(0)});
 const call=(f,a)=>{try{f(...a)}catch(e){console.error(e)}};
 const sync=()=>{
  for(const a of document.getAnimations()){if(!seen.has(a)){seen.add(a);anims.set(a,now);a.pause()}}
  for(const[a,t0]of anims){
   if(a.playState==='idle'||a.playState==='finished'){anims.delete(a);continue}
   const t=now-t0,end=a.effect?a.effect.getComputedTiming().endTime:0;
   if(t>=end)a.finish();else{a.pause();a.currentTime=t}
  }
 };
 const next=to=>{let b=null;for(const[id,t]of timers)if(t.due<=to&&(!b||t.due<b[1].due))b=[id,t];return b};
 window.__vt={
  now:()=>now,
  async advance(ms){
   const to=now+ms;
   for(let b=next(to);b;b=next(to)){const[id,t]=b;now=t.due;if(t.every)t.due+=t.every;else timers.delete(id);call(t.fn,t.a);await flush()}
   now=to;
   const cbs=[...rafs.values()];rafs.clear();cbs.forEach(f=>call(f,[now]));
   await flush();sync();await flush();return now
  },
  sync
 };
})();
