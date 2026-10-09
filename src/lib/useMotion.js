import { useEffect } from 'react';
import { installRoomTravel } from './scrollStory';

// Keep one scroll controller alive across project entry/exit. Visibility observers
// reveal content without recalculating or restoring a second scroll position.
export function useMotion(enabled,page) {
  useEffect(()=>{
    if(!enabled||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let cancelled=false,dispose=()=>{};
    Promise.all([import('gsap'),import('lenis')]).then(([g,l])=>{
      if(cancelled)return;
      const main=document.querySelector('main');if(!main)return;
      const gsap=g.gsap, fine=matchMedia('(pointer:fine)').matches&&innerWidth>800;
      const lenis=fine?new l.default({lerp:.16,smoothWheel:true,anchors:false,prevent:node=>Boolean(node.closest?.('dialog,iframe'))}):null;
      const tick=time=>lenis?.raf(time*1000);
      if(lenis)gsap.ticker.add(tick);
      const navigate=event=>{if(lenis){event.preventDefault();lenis.resize();lenis.scrollTo(event.detail.top,{immediate:event.detail.immediate,force:true});}};
      const onMenu=()=>document.body.classList.contains('menu-is-open')?lenis?.stop():lenis?.start();
      const menu=new MutationObserver(onMenu);menu.observe(document.body,{attributes:true,attributeFilter:['class']});
      const seen=new WeakSet(),animated=new Set();
      const observer=new IntersectionObserver(entries=>{
        for(const entry of entries)if(entry.isIntersecting&&!entry.target.closest('[hidden]')){
          observer.unobserve(entry.target);
          // No pre-hidden text: failed or disabled animation always leaves content readable.
          const animation=gsap.fromTo(entry.target,{y:16,opacity:.4},{y:0,opacity:1,duration:.65,ease:'power3.out',clearProps:'transform,opacity'});
          animated.add(animation);
        }
      },{threshold:.12});
      const scan=()=>{main.querySelectorAll('h1,h2,[data-reveal]').forEach(node=>{if(!seen.has(node)&&!node.closest('[hidden]')){seen.add(node);observer.observe(node);}});};
      const changes=new MutationObserver(scan);changes.observe(main,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});scan();
      const progress=()=>{const max=document.documentElement.scrollHeight-innerHeight;const bar=document.querySelector('.reading-progress i');if(bar)bar.style.transform=`scaleX(${max>0?scrollY/max:0})`;};
      window.addEventListener('whoami:scroll',navigate);window.addEventListener('scroll',progress,{passive:true});
      const resize=new ResizeObserver(()=>{lenis?.resize();progress();});resize.observe(main);progress();
      const stopTravel=installRoomTravel(lenis);
      dispose=()=>{stopTravel();observer.disconnect();changes.disconnect();menu.disconnect();resize.disconnect();animated.forEach(animation=>animation.revert());gsap.ticker.remove(tick);lenis?.destroy();window.removeEventListener('whoami:scroll',navigate);window.removeEventListener('scroll',progress);};
    }).catch(()=>{/* Content and native scrolling remain usable. */});
    return()=>{cancelled=true;dispose();};
  },[enabled,page]);
}
