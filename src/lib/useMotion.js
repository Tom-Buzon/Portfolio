import { useEffect } from 'react';
import { installSceneTravel } from './sceneTravel';

// Keep one scroll controller alive across project entry/exit. Visibility observers
// reveal content without recalculating or restoring a second scroll position.
export function useMotion(enabled,page) {
  useEffect(()=>installSceneTravel(),[]);
  useEffect(()=>{
    if(!enabled||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    let cancelled=false,dispose=()=>{};
    import('gsap').then(g=>{
      if(cancelled)return;
      const main=document.querySelector('main');if(!main)return;
      const gsap=g.gsap;
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
      window.addEventListener('scroll',progress,{passive:true});
      const resize=new ResizeObserver(()=>{progress();});resize.observe(main);progress();

      dispose=()=>{observer.disconnect();changes.disconnect();resize.disconnect();animated.forEach(animation=>animation.revert());window.removeEventListener('scroll',progress);};
    }).catch(()=>{/* Content and native scrolling remain usable. */});
    return()=>{cancelled=true;dispose();};
  },[enabled,page]);
}
