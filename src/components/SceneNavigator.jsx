import { useEffect,useMemo,useRef,useState } from 'react';
import PropTypes from 'prop-types';
import { useLocale } from '../i18n/Locale';
import { L,localize } from '../content/copy';
import { projects } from '../content/projects';
import { projectChapters } from '../content/projectChapters';
import { visitStops } from '../lib/scrollStory';
import { scrollPage } from '../lib/navigation';

export default function SceneNavigator({project}){
  const {locale,url}=useLocale(),l=value=>localize(value,locale),[open,setOpen]=useState(false),[active,setActive]=useState('top');
  const rail=useRef(null);
  const entries=useMemo(()=>{
    if(project){const p=localize(projects.find(item=>item.id===project),locale);if(p){const chapters=projectChapters(p,locale);return visitStops(chapters).map((step,i)=>({id:'step-'+i,label:step.item?.title||chapters[step.chapter].title,index:i}));}}
    return [{id:'top',label:localize(L('Accueil','Welcome','Welkom'),locale)},{id:'approach',label:localize(L('La méthode','The method','De methode'),locale)},{id:'skills',label:localize(L('Compétences','Skills','Vaardigheden'),locale)},{id:'work',label:'Portfolio'},...projects.map(p=>({id:p.id,label:p.name})),{id:'explorations',label:localize(L('Explorations','Explorations','Experimenten'),locale)},{id:'contact',label:'Contact'}];
  },[locale,project]);
  useEffect(()=>{
    let frame=0;
    const read=()=>{
      frame=0;const positions=entries.map(entry=>{const node=project?document.querySelector(`[data-visit-step="${entry.index}"]`):document.getElementById(entry.id);return node?.offsetHeight?node.getBoundingClientRect().top+scrollY:0;});
      let at=0;positions.forEach((top,i)=>{if(top<=scrollY+8)at=i;});
      const next=positions[at+1],fraction=next>positions[at]?Math.max(0,Math.min(1,(scrollY-positions[at])/(next-positions[at]))):0;
      rail.current?.style.setProperty('--route-progress',String((at+fraction)/Math.max(1,entries.length-1)));
      setActive(entries[at]?.id||'top');
    };
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(read);};
    const show=()=>setOpen(true),escape=event=>{if(event.key==='Escape')setOpen(false);};
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);window.addEventListener('whoami:arrived',read);window.addEventListener('whoami:contents',show);window.addEventListener('keydown',escape);read();
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);window.removeEventListener('whoami:arrived',read);window.removeEventListener('whoami:contents',show);window.removeEventListener('keydown',escape);};
  },[project,entries]);
  function go(event,entry){if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey)return;event.preventDefault();setOpen(false);if(project){const target=document.querySelector(`[data-visit-step="${entry.index}"]`);if(target)scrollPage(target.getBoundingClientRect().top+scrollY);}else window.dispatchEvent(new CustomEvent('whoami:navigate',{detail:entry.id}));}
  const current=entries.find(entry=>entry.id===active)||entries[0];
  const activeIndex=Math.max(0,entries.findIndex(entry=>entry.id===active));
  return <aside className={'scene-navigator'+(project?' is-project':'')+(open?' is-open':'')} aria-label={l(L('Sommaire de la visite','Tour contents','Overzicht van de rondleiding'))}>
    <nav ref={rail} className="scene-rail" aria-label={l(L('Étapes de la visite','Tour stages','Etappes van de rondleiding'))} style={{'--route-count':entries.length}}><div className="scene-rail-line" aria-hidden="true"><i/><b/></div>{entries.map((entry,i)=><a href={project?'#'+project+'-detail':url('/#'+entry.id)} key={entry.id} className="scene-rail-node" data-destination={entry.id} data-passed={i<activeIndex} aria-label={entry.label} aria-current={entry.id===active?'location':undefined} onClick={event=>go(event,entry)}><i aria-hidden="true"/><span><small>{String(i+1).padStart(2,'0')}</small>{entry.label}</span></a>)}</nav>
    <button className="scene-nav-trigger" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="scene-contents" aria-label={l(L('Ouvrir le sommaire','Open contents','Overzicht openen'))}><span aria-hidden="true">☷</span><small>{String(activeIndex+1).padStart(2,'0')} / {String(entries.length).padStart(2,'0')}</small></button>
    {open&&<><button className="scene-nav-scrim" aria-label={l(L('Fermer le sommaire','Close contents','Overzicht sluiten'))} onClick={()=>setOpen(false)}/><div className="scene-nav-panel" data-tour-native><div className="scene-nav-heading"><div><small>INDEX / {project?'PROJECT':'PORTFOLIO'}</small><span>{project?projects.find(p=>p.id===project)?.name:l(L('Suivre le fil.','Follow the story.','Volg het verhaal.'))}</span></div><button onClick={()=>setOpen(false)} aria-label={l(L('Fermer','Close','Sluiten'))}>×</button></div><p className="scene-nav-location"><span>{String(activeIndex+1).padStart(2,'0')} / {String(entries.length).padStart(2,'0')}</span>{current?.label}</p><nav id="scene-contents">{entries.map((entry,i)=><a href={project?'#'+project+'-detail':url('/#'+entry.id)} key={entry.id} data-destination={entry.id} aria-current={entry.id===active?'location':undefined} onClick={event=>go(event,entry)}><span>{String(i+1).padStart(2,'0')}</span>{entry.label}<i>↗</i></a>)}</nav></div></>}
  </aside>;
}
SceneNavigator.propTypes={project:PropTypes.string};
