export const plainClick = event => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
export function scrollPage(top, immediate = false) {
  const event = new CustomEvent('whoami:scroll', { cancelable:true, detail:{ top, immediate } });
  if (window.dispatchEvent(event)) window.scrollTo({ top, behavior:immediate || document.documentElement.dataset.motion === 'off' ? 'instant' : 'smooth' });
}
let cancelAnchor=()=>{};
export function scrollToId(id, immediate = false) {
  cancelAnchor();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const align=()=>{
      const element=document.getElementById(id);
      if(element?.offsetHeight)scrollPage(Math.max(0,element.getBoundingClientRect().top+scrollY),immediate);
    };
    align();
    if(!immediate)return;
    // An atlas or font can finish sizing after a direct URL has been opened.
    // Keep its destination aligned until that layout settles or the visitor acts.
    const observer=new ResizeObserver(align),main=document.querySelector('main');
    if(main)observer.observe(main);
    const events=['wheel','touchstart','pointerdown','keydown'];
    const stop=()=>{observer.disconnect();clearTimeout(timer);events.forEach(type=>window.removeEventListener(type,stop,true));};
    const timer=setTimeout(stop,1800);
    events.forEach(type=>window.addEventListener(type,stop,{capture:true,passive:true}));
    cancelAnchor=stop;
  }));
}
