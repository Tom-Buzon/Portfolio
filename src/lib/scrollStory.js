// A stopped gesture in a doorway completes the journey to a readable room pose.
export function roomDestination(tops,y,height,direction){
  for(let i=1;i<tops.length;i++){
    const relative=tops[i]-y;
    if(relative>height*.13&&relative<height*.96)return Math.max(0,tops[direction>0?i:i-1]-20);
  }
  return null;
}

export function installRoomTravel(lenis){
  let timer,previous=scrollY,direction=1,userUntil=0,busy=false,release;
  const gesture=event=>{
    if(event.target.closest?.('dialog,video,iframe,input,select,textarea'))return;
    if(event.type==='keydown'&&!['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(event.key))return;
    userUntil=performance.now()+1400;
  };
  const settle=()=>{
    if(busy||performance.now()>userUntil||document.querySelector('.project-visit')||document.querySelector('dialog[open]')||document.documentElement.dataset.motion==='off')return;
    const rooms=[...document.querySelectorAll('#work,.room-threshold,#explorations')].filter(el=>el.offsetHeight>0);
    const tops=rooms.map(el=>el.getBoundingClientRect().top+scrollY),target=roomDestination(tops,scrollY,innerHeight,direction);
    if(target===null||Math.abs(target-scrollY)<16)return;
    busy=true;userUntil=0;
    const duration=Math.max(1.8,Math.min(3,Math.abs(target-scrollY)/innerHeight*1.8));
    if(lenis)lenis.scrollTo(target,{duration,easing:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,lock:true,force:true,onComplete:()=>{busy=false;previous=scrollY;}});
    else window.scrollTo({top:target,behavior:'smooth'});
    release=setTimeout(()=>{busy=false;previous=scrollY;},duration*1000+250);
  };
  const read=()=>{const delta=scrollY-previous;if(Math.abs(delta)>1)direction=Math.sign(delta);previous=scrollY;clearTimeout(timer);if(!busy)timer=setTimeout(settle,130);};
  const programmatic=()=>{userUntil=0;clearTimeout(timer);};
  ['wheel','touchmove','keydown'].forEach(type=>window.addEventListener(type,gesture,{passive:true}));
  window.addEventListener('scroll',read,{passive:true});window.addEventListener('whoami:scroll',programmatic);
  return()=>{clearTimeout(timer);clearTimeout(release);['wheel','touchmove','keydown'].forEach(type=>window.removeEventListener(type,gesture));window.removeEventListener('scroll',read);window.removeEventListener('whoami:scroll',programmatic);};
}

export function visitStops(chapters){
  return chapters.flatMap((chapter,chapterIndex)=>(chapter.items.length?chapter.items:[null]).map((item,mediaIndex)=>({chapter:chapterIndex,media:mediaIndex,item})));
}

const clamp01=value=>Math.max(0,Math.min(1,value));

// Five short beats, with a visible response to every scroll gesture.
export function methodTimeline(passed,height){
  const beat=height*.32,position=Math.max(0,passed)/beat,step=Math.min(4,Math.floor(position));
  const arrival=clamp01(-passed/(height*.32));
  return {step,fill:clamp01(position-step),progress:clamp01(position/5),arrivalOffset:passed<0&&arrival<1?passed*(1-arrival)**2:0};
}

// The closing panel gets a full approach: reveal it, pull back, then restore the tour.
export function visitReturnProgress(exitTop,height){
  return clamp01((height*.8-exitTop)/(height*.7));
}
