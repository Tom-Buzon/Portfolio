import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../i18n/Locale';
import { copy,method,localize } from '../content/copy';
import { scrollPage } from '../lib/navigation';
import { methodTimeline } from '../lib/scrollStory';

export default function MethodDesk(){
  const {locale}=useLocale(), c=localize(copy,locale), steps=localize(method,locale);
  const [step,setStep]=useState(0);
  const section=useRef(null);
  const pinned=()=>innerWidth>1000&&innerHeight>=640&&document.documentElement.dataset.motion!=='off';
  useEffect(()=>{
    const read=()=>{
      const element=section.current;if(!element||element.closest('[hidden]'))return;
      const cards=element.querySelectorAll('.method-cards button');
      if(!pinned()){let active=0;cards.forEach((card,i)=>{if(card.getBoundingClientRect().top<innerHeight*.55)active=i;card.style.setProperty('--step-progress','0');});element.style.setProperty('--method-arrival','0px');setStep(active);return;}
      const timeline=methodTimeline(-element.getBoundingClientRect().top,innerHeight);
      element.style.setProperty('--method-arrival',timeline.arrivalOffset+'px');
      element.style.setProperty('--method-progress',timeline.progress);
      cards.forEach((card,i)=>card.style.setProperty('--step-progress',i<timeline.step?1:i===timeline.step?timeline.fill:0));
      setStep(timeline.step);
    };
    window.addEventListener('scroll',read,{passive:true});window.addEventListener('resize',read);window.addEventListener('attic:motion',read);read();
    return()=>{window.removeEventListener('scroll',read);window.removeEventListener('resize',read);window.removeEventListener('attic:motion',read);};
  },[]);
  function choose(index){setStep(index);if(pinned())scrollPage(section.current.getBoundingClientRect().top+scrollY+(index+.03)*innerHeight*.32);}
  return <section ref={section} className="method-desk" id="approach" data-method-step={step} data-scene-stop="1" data-scene-hold data-scene-ease data-scene-view><div className="method-sticky"><div className="wrap"><div className="method-heading"><p className="overline">01 / {c.method}</p><h2>{c.methodTitle}</h2><p className="method-desk-lead">{c.methodLead}</p></div><div className="method-cards" role="group" aria-label={c.method}>{steps.map(([name,title,body],index)=><button key={name} aria-pressed={step===index} data-complete={index<step} onClick={()=>choose(index)}><span className="micro-label">0{index+1} / {name}</span><strong>{title}</strong><span className="method-card-body">{body}</span><i aria-hidden="true">{index<step?'✓':step===index?'→':'↗'}</i><span className="method-card-progress" aria-hidden="true"/></button>)}</div><p className="method-scroll-cue"><span>{locale==='fr'?'Le scroll fait avancer les étapes':locale==='nl'?'Scroll om de stappen te doorlopen':'Scroll advances the steps'}</span><strong aria-live="polite">{step+1} / 5 · {steps[step][0]} ↓</strong><i aria-hidden="true"/></p></div></div></section>;
}
