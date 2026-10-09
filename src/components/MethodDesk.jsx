import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../i18n/Locale';
import { copy,method,localize } from '../content/copy';
import { scrollPage } from '../lib/navigation';

export default function MethodDesk(){
  const {locale}=useLocale(), c=localize(copy,locale), steps=localize(method,locale);
  const [step,setStep]=useState(0);
  const section=useRef(null);
  const pinned=()=>innerWidth>1000&&innerHeight>=640&&document.documentElement.dataset.motion!=='off';
  useEffect(()=>{
    const read=()=>{if(section.current?.closest('[hidden]'))return;if(!pinned()){let active=0;section.current.querySelectorAll('.method-cards button').forEach((card,i)=>{if(card.getBoundingClientRect().top<innerHeight*.55)active=i;});setStep(active);return;}const passed=-section.current.getBoundingClientRect().top;setStep(Math.max(0,Math.min(4,Math.floor((passed+innerHeight*.1)/(innerHeight*.7)))));};
    window.addEventListener('scroll',read,{passive:true});window.addEventListener('resize',read);window.addEventListener('attic:motion',read);read();
    return()=>{window.removeEventListener('scroll',read);window.removeEventListener('resize',read);window.removeEventListener('attic:motion',read);};
  },[]);
  function choose(index){setStep(index);if(pinned())scrollPage(section.current.getBoundingClientRect().top+scrollY+index*innerHeight*.7,true);}
  return <section ref={section} className="method-desk" id="approach" data-method-step={step} data-scene-stop="1" data-scene-hold data-scene-view><div className="method-sticky"><div className="wrap"><div className="method-heading"><p className="overline">01 / {c.method}</p><h2>{c.methodTitle}</h2><p className="method-desk-lead">{c.methodLead}</p></div><div className="method-cards" role="group" aria-label={c.method}>{steps.map(([name,title,body],index)=><button key={name} aria-pressed={step===index} onClick={()=>choose(index)}><span className="micro-label">0{index+1} / {name}</span><strong>{title}</strong><span className="method-card-body">{body}</span><i aria-hidden="true">{step===index?'●':'↗'}</i></button>)}</div><p className="method-scroll-cue">{locale==='fr'?'Défilez pour suivre les cinq étapes':locale==='nl'?'Scroll door de vijf stappen':'Scroll through the five steps'} <span>{step+1} / 5 ↓</span></p></div></div></section>;
}
