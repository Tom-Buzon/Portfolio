// The camera has one route and one timing curve, regardless of input strength.
export const travelEase=t=>t*t*t*(t*(t*6-15)+10);
export const methodCanPin=(width,height)=>width>1000?height>=640:width>=360&&height>=720;
export function sceneDestination(stops,y,height,direction){
  if(!stops.length)return null;
  let index=0;
  for(let i=0;i<stops.length;i++)if(stops[i].top<=y+8)index=i;
  const current=stops[index];
  if(direction>0){
    if(y<current.end-8)return Math.min(current.end,y+height*.66);
    return stops[index+1]?.top??null;
  }
  if(y>current.top+8)return Math.max(current.top,y-height*.66);
  return stops[index-1]?.end??null;
}

export function sceneStops(){
  const y=scrollY,h=innerHeight,visit=document.querySelector('.project-visit');
  const stops=[];
  const add=(id,top,end=top)=>stops.push({id,top:Math.max(0,top),end:Math.max(top,end)});
  if(visit){
    visit.querySelectorAll('.visit-step').forEach((el,i)=>{const top=el.getBoundingClientRect().top+y;add('step-'+i,top,top+el.offsetHeight-h);});
    const exit=visit.querySelector('.visit-exit');if(exit)add('return',exit.getBoundingClientRect().top+y-h*.1);
  }else{
    document.querySelectorAll('.general-visit [data-tour-scene]').forEach(el=>{
      if(!el.offsetHeight)return;
      const top=el.getBoundingClientRect().top+y,id=el.dataset.tourScene;
      if(id==='approach'&&methodCanPin(innerWidth,innerHeight)&&document.documentElement.dataset.motion!=='off'){
        for(let i=0;i<5;i++)add('method-'+i,top+i*h*.32);
      }else if(el.classList.contains('room-threshold')){add(id+'-title',top);const card=el.querySelector('.room-card-scene');const cardTop=card.getBoundingClientRect().top+y;add(id+'-card',cardTop,cardTop+card.offsetHeight-h);}
      else add(id,top,top+el.offsetHeight-h);
    });
    const footer=document.querySelector('.site-footer');if(footer)add('footer',footer.getBoundingClientRect().top+y);
  }
  const max=document.documentElement.scrollHeight-h;
  return stops.map(stop=>({...stop,top:Math.min(max,stop.top),end:Math.min(max,stop.end)}));
}

export function installSceneTravel(){
  let frame=0,busy=false,lastInput=0,accumulated=0,touch=null,touchUsed=false,disposed=false;
  const html=document.documentElement;
  const reduced=()=>html.dataset.motion==='off'||matchMedia('(prefers-reduced-motion:reduce)').matches;
  const release=()=>{busy=false;html.dataset.travelling='false';window.dispatchEvent(new Event('whoami:arrived'));};
  function travel(top,immediate=false,explicit=false){
    if(busy&&!immediate&&!explicit)return;
    cancelAnimationFrame(frame);lastInput=performance.now();
    const target=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,top)),from=scrollY;
    if(immediate||reduced()||Math.abs(target-from)<2){window.scrollTo({top:target,behavior:'instant'});release();return;}
    busy=true;html.dataset.travelling='true';
    const sameMethod=document.querySelector('#approach')?.contains(document.elementFromPoint(innerWidth*.4,innerHeight*.5));
    const duration=document.querySelector('.project-visit')?1150:sameMethod&&Math.abs(target-from)<innerHeight*.5?260:Math.min(2800,1650+Math.abs(target-from)/innerHeight*180);
    const start=performance.now();
    const draw=now=>{if(disposed)return;const t=Math.min(1,(now-start)/duration);window.scrollTo({top:from+(target-from)*travelEase(t),behavior:'instant'});if(t<1)frame=requestAnimationFrame(draw);else{lastInput=performance.now();release();}};
    frame=requestAnimationFrame(draw);
  }
  const native=target=>Boolean(target?.closest?.('dialog,[data-tour-native],input,textarea,select,video'));
  function advance(direction){
    if(busy)return;
    const target=sceneDestination(sceneStops(),scrollY,innerHeight,direction);
    if(target!==null)travel(target);
  }
  function wheel(event){
    if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||native(event.target))return;
    event.preventDefault();
    const now=performance.now(),quiet=now-lastInput;lastInput=now;
    if(busy){accumulated=0;return;}
    if(quiet<180&&accumulated===0)return;
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    if(quiet>180||Math.sign(accumulated)!==Math.sign(delta))accumulated=0;
    accumulated+=delta;
    if(Math.abs(accumulated)>=24){const direction=Math.sign(accumulated);accumulated=0;advance(direction);}
  }
  const touchStart=event=>{touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY,native:native(event.target)}:null;touchUsed=false;};
  const touchMove=event=>{
    if(!touch||touch.native||event.touches.length!==1)return;
    const dx=touch.x-event.touches[0].clientX,dy=touch.y-event.touches[0].clientY;
    if(Math.abs(dx)>Math.abs(dy))return;
    if(event.cancelable)event.preventDefault();
    if(!touchUsed&&Math.abs(dy)>36){touchUsed=true;advance(Math.sign(dy));}
  };
  const key=event=>{
    if(native(event.target)||event.target.closest?.('button,a,[role=button]'))return;
    const direction=['ArrowDown','PageDown',' '].includes(event.key)?(event.shiftKey?-1:1):['ArrowUp','PageUp'].includes(event.key)?-1:0;
    if(direction){event.preventDefault();if(!event.repeat)advance(direction);}
    else if(['Home','End'].includes(event.key)){event.preventDefault();const stops=sceneStops();if(stops.length)travel(event.key==='Home'?stops[0].top:stops.at(-1).top);}
  };
  // A deliberate destination wins over settling caused by focus/anchor scrolling.
  // Wheel and touch input remain locked until the chosen journey has finished.
  const navigate=event=>{event.preventDefault();travel(event.detail.top,event.detail.immediate,true);};
  const next=event=>advance(event.detail.direction);
  const atlas=event=>{if(event.origin===location.origin&&event.source===document.querySelector('.original-atlas')?.contentWindow&&event.data?.type==='whoami:atlas-navigate')advance(Math.sign(event.data.direction));};
  const scrollEnd=()=>{if(busy||performance.now()-lastInput<400)return;const stops=sceneStops();if(!stops.length)return;const inReading=stops.some(s=>scrollY>=s.top-2&&scrollY<=s.end+2);if(!inReading){const nearest=stops.reduce((a,b)=>Math.abs(a.top-scrollY)<Math.abs(b.top-scrollY)?a:b);travel(nearest.top);}};
  window.addEventListener('wheel',wheel,{passive:false});window.addEventListener('touchstart',touchStart,{passive:true});window.addEventListener('touchmove',touchMove,{passive:false});window.addEventListener('keydown',key);
  window.addEventListener('whoami:scroll',navigate);window.addEventListener('whoami:step',next);window.addEventListener('message',atlas);window.addEventListener('scrollend',scrollEnd);
  html.dataset.sceneNavigation='true';
  return()=>{disposed=true;cancelAnimationFrame(frame);release();delete html.dataset.sceneNavigation;window.removeEventListener('wheel',wheel);window.removeEventListener('touchstart',touchStart);window.removeEventListener('touchmove',touchMove);window.removeEventListener('keydown',key);window.removeEventListener('whoami:scroll',navigate);window.removeEventListener('whoami:step',next);window.removeEventListener('message',atlas);window.removeEventListener('scrollend',scrollEnd);};
}
