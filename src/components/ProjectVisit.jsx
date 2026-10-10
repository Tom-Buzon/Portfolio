import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocale } from '../i18n/Locale';
import { copy,L,localize } from '../content/copy';
import { projectChapters,roomNames } from '../content/projectChapters';
import { sftEvidence } from '../content/sftEvidence';
import { mediaNarrative } from '../content/mediaNarrative';
import { publicUrl } from '../lib/publicUrl';
import { scrollPage } from '../lib/navigation';
import { restoreReadingPosition } from '../lib/languagePosition';
import { visitStops,visitReturnProgress } from '../lib/scrollStory';
import { asset,Capture,VideoPlayer } from './ProjectMedia';
import ProjectSkills from './ProjectSkills';
import ChapterGraphic from './ChapterGraphic';

export default function ProjectVisit({project,initialSelection,initialPosition,onRemember,onClose}) {
  const {locale}=useLocale(),c=localize(copy,locale),l=value=>localize(value,locale);
  const chapters=useMemo(()=>projectChapters(project,locale),[project,locale]);
  const stops=useMemo(()=>visitStops(chapters),[chapters]);
  // Hydrate the same first frame as the server, then restore the translated step.
  const initialIndex=Math.max(0,stops.findIndex(step=>step.chapter===initialSelection?.chapter&&step.media===initialSelection?.media));
  const [index,setIndex]=useState(initialIndex),[desktop,setDesktop]=useState(false);
  const [lightbox,setLightbox]=useState(null),[zoom,setZoom]=useState(false);
  const [returning,setReturning]=useState(false);
  const article=useRef(null),sections=useRef([]),exit=useRef(null),dialog=useRef(null),trigger=useRef(null),restore=useRef(initialIndex),closing=useRef(false);
  const selectedIndex=useRef(index);useEffect(()=>{selectedIndex.current=index;},[index]);
  const selection=stops[index]||stops[0],chapter=chapters[selection.chapter],item=selection.item;
  const screen=project.id==='clipgenerator'&&item?.type==='video'?item.id:chapter.screen;
  const screenId=project.id+'-'+screen;
  const close=useRef(onClose);useEffect(()=>{close.current=onClose;},[onClose]);
  useEffect(()=>{onRemember(project.id,{chapter:selection.chapter,media:selection.media});},[onRemember,project.id,selection]);
  useEffect(()=>{
    let layout,resizeFrame,resizeFrame2,returnTimer;
    const size=()=>{const next=innerWidth>1000,previous=layout,at=selectedIndex.current;layout=next;setDesktop(next);if(previous!==undefined&&previous!==next){cancelAnimationFrame(resizeFrame);cancelAnimationFrame(resizeFrame2);resizeFrame=requestAnimationFrame(()=>{resizeFrame2=requestAnimationFrame(()=>{const target=sections.current[at];if(target)scrollPage(target.getBoundingClientRect().top+scrollY,true);});});}};size();window.addEventListener('resize',size);
    let frame=0;
    const read=()=>{
      frame=0;if(closing.current)return;
      let active=0;const boundary=Math.max(150,innerHeight*.27);sections.current.forEach((element,i)=>{if(element&&element.getBoundingClientRect().top<=boundary)active=i;});setIndex(active);
      const progress=exit.current?visitReturnProgress(exit.current.getBoundingClientRect().top,innerHeight):0;
      article.current.style.setProperty('--visit-exit-progress',progress);
      article.current.dataset.exitProgress=String(progress);
      setReturning(progress>0);
      if(progress===1&&scrollY>100){closing.current=true;returnTimer=setTimeout(()=>close.current({fromScroll:true}),document.documentElement.dataset.motion==='off'?0:350);}
    };
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(read);};
    window.addEventListener('scroll',scroll,{passive:true});
    let first,second,stopRestore;first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>{if(initialPosition){stopRestore=restoreReadingPosition(initialPosition,read);}else{const target=sections.current[restore.current];if(target)scrollPage(target.getBoundingClientRect().top+scrollY,true);read();}});});
    return()=>{stopRestore?.();clearTimeout(returnTimer);cancelAnimationFrame(frame);cancelAnimationFrame(first);cancelAnimationFrame(second);cancelAnimationFrame(resizeFrame);cancelAnimationFrame(resizeFrame2);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',size);};
  },[initialPosition]);
  useEffect(()=>{
    window.dispatchEvent(new CustomEvent('whoami:inspect',{detail:{project:project.id,open:true,screen}}));
    document.querySelectorAll('.project-visit video').forEach(video=>{if(video.closest('[data-world-screen]')?.dataset.worldScreen!==screenId)video.pause();});
    if(item?.type==='image')window.dispatchEvent(new CustomEvent('whoami:media',{detail:{screen:screenId,src:asset(item).thumb}}));
    return()=>window.dispatchEvent(new CustomEvent('whoami:inspect',{detail:{project:project.id,open:false}}));
  },[project.id,screen,screenId,item]);
  useEffect(()=>{if(lightbox){dialog.current?.showModal();setZoom(false);}else dialog.current?.close();},[lightbox]);
  useEffect(()=>{const key=event=>{if(event.key==='Escape'&&!lightbox&&!document.querySelector('dialog[open]'))close.current();};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[lightbox]);
  function go(next){const target=sections.current[Math.max(0,Math.min(stops.length-1,next))];if(target)scrollPage(target.getBoundingClientRect().top+scrollY);}
  function finish(){if(exit.current)scrollPage(exit.current.getBoundingClientRect().top+scrollY+innerHeight*.1);}
  function closeLightbox(){setLightbox(null);trigger.current?.focus({preventScroll:true});}
  function enlarge(event,entry){trigger.current=event.currentTarget;setLightbox(entry);}
  function mediaView(step,world=false){
    const part=chapters[step.chapter],entry=step.item,frame=project.id+'-'+(project.id==='clipgenerator'&&entry?.type==='video'?entry.id:part.screen);
    return <div className="visit-display"><div className={'visit-screen-space'+(project.id==='clipgenerator'&&step.chapter===0?' is-duet':'')}>
      {entry?.type==='video'?(world&&project.id==='clipgenerator'?part.items:[entry]).map(video=><VideoPlayer key={video.id} item={video} worldId={world?project.id+'-'+video.id:undefined} onInspect={()=>{if(world){const next=stops.findIndex(s=>s.item?.id===video.id);if(next!==index)go(next);}}}/>):<div key={frame} className="world-surface chapter-surface" data-world-screen={world?frame:undefined}>{entry?<button className="chapter-image" data-media-id={entry.id} onClick={event=>enlarge(event,entry)} aria-label={`${c.enlarge} — ${entry.title}`}><Capture item={entry}/><span>⤢ {c.enlarge}</span></button>:<ChapterGraphic type={part.graphic}/>}</div>}
    </div>{entry&&<div className="visit-media-caption"><p>{entry.title}</p>{entry.description&&<p className="visit-media-note">{entry.description}</p>}<span>{l(L('Média','Media','Media'))} {step.media+1} / {part.items.length} · {l(L('Défilez pour la suite','Scroll to continue','Scroll om verder te gaan'))} ↓</span></div>}</div>;
  }
  return <article ref={article} id={project.id+'-visit'} data-project={project.id} data-returning={returning} className={'project-visit scroll-visit visit-'+project.id} style={{'--project-color':project.color}} data-scene-stop={project.station} data-scene-hold data-scene-view data-inspect-screen={screen}>
    <div className="visit-toolbar"><button onClick={onClose} className="visit-return">← <span>{l(L('Retour à la visite','Back to the tour','Terug naar de rondleiding'))}</span></button>{project.id==='sft'?<div className="sft-resources"><a href={publicUrl('/reports/sft/')} target="_blank" rel="noreferrer">{c.report} ↗</a><a href="https://github.com/Tom-Buzon/medicalTriageDocker" target="_blank" rel="noreferrer">GitHub · {l(L('Déploiement','Deployment','Deployment'))} ↗</a></div>:<span>{l(roomNames[project.id])}</span>}</div>
    <div id={project.id+'-detail'} tabIndex={-1} className="visit-story">
      <h1 className="sr-only">{project.name}</h1>
      {stops.map((step,i)=>{const part=chapters[step.chapter];return <section key={i} ref={node=>{sections.current[i]=node;}} className={'visit-step'+(index===i?' is-current':'')} data-visit-step={i} data-chapter-id={part.screen} data-media-id={step.item?.id||part.graphic} aria-label={part.title}>
        <div className="visit-prose"><p className="overline">{project.name} / {project.category}</p><p className="micro-label">{String(step.chapter+1).padStart(2,'0')} / {String(chapters.length).padStart(2,'0')} · {part.title}</p><h2>{step.item?.type==='image'?step.item.title:part.title}</h2><div className="visit-chapter-copy">{i===0&&project.id==='mnememind'&&<p>{project.story[0]}</p>}{(mediaNarrative(step.item?.id,locale)||part.body).map((paragraph,j)=><p key={j}>{paragraph}</p>)}</div>
          {part.evidence&&<div className="chapter-evidence">{part.evidence.map(number=>{const [status,title,body]=l(sftEvidence[number]);return <div key={number} className="evidence-note"><small>{status}</small><h3>{title}</h3><p>{body}</p></div>;})}</div>}
          {part.transcript&&<details className="guidance-transcript"><summary>{l(L('Lire les textes du guidage','Read the guidance text','Lees de begeleidingstekst'))} +</summary><ol lang="fr"><li>Retrouve la radio au son. Approche-toi pour la ramasser.</li><li>Ici LIA. Je te reçois. Un flash a précédé la panne et une forte secousse. Un impact est possible, mais rien n’est confirmé.</li><li>Va vers la droite sur environ 7 pas. Puis prends vers le bas, vers le secteur ateliers.</li><li>Le contact avec la Terre est coupé. Je fonctionne sur un nœud de secours. Je cherche encore à joindre l’équipage. Maintiens contrôle pour me parler, puis relâche pour transmettre.</li></ol></details>}
          {i===0&&<ProjectSkills project={project}/>}<p className="visit-role">{project.role}<span>{project.status}</span></p><p className="step-reading-cue">{i+1} / {stops.length} <span>↓ {l(L('Défilez pour continuer','Scroll to continue','Scroll om verder te gaan'))}</span></p>
        </div>{!desktop&&<div className="visit-mobile-media">{mediaView(step)}</div>}
      </section>;})}
      <div className="visit-exit" ref={exit}><div className="visit-exit-card"><small>{project.name} · {l(L('Fin du parcours','End of the walkthrough','Einde van de rondleiding'))}</small><p>{l(L('Reprenons la visite.','Back to the tour.','Terug naar de rondleiding.'))}</p><span>{l(L('Défilez pour prendre du recul et retrouver la pièce. Vous pourrez ensuite poursuivre vers le projet suivant.','Scroll to step back into the room. From there, continue to the next project.','Scroll om terug te stappen in de kamer. Ga daarna verder naar het volgende project.'))}</span><button onClick={onClose}>{l(L('Retour à la visite','Back to the tour','Terug naar de rondleiding'))} ↗</button></div></div>
    </div>
    <div className="visit-desktop-media">{mediaView(selection,true)}</div>
    <nav className="visit-sequence-nav" aria-label={l(L('Parcours du projet','Project walkthrough','Projectrondleiding'))}><button disabled={index===0} onClick={()=>go(index-1)} aria-label={c.previous}>←</button><button className="visit-mobile-contents" onClick={()=>window.dispatchEvent(new Event("whoami:contents"))}><small>{index+1} / {stops.length} · ☷</small><span>{item?.title||chapter.title}</span></button><label><span>{String(index+1).padStart(2,'0')} / {String(stops.length).padStart(2,'0')} <b>{l(L('DÉFILEZ POUR EXPLORER','SCROLL TO EXPLORE','SCROLL OM TE VERKENNEN'))}</b></span><select aria-label={l(L('Aller à une étape du projet','Jump to a project step','Ga naar een projectstap'))} value={index} onChange={event=>go(Number(event.target.value))}>{stops.map((step,i)=><option key={i} value={i}>{String(i+1).padStart(2,'0')} · {step.item?.title||chapters[step.chapter].title}</option>)}</select></label><button onClick={()=>index===stops.length-1?finish():go(index+1)} aria-label={index===stops.length-1?c.resume:c.next}>{index===stops.length-1?'↗':'→'}</button><i style={{transform:`scaleX(${(index+1)/stops.length})`}}/></nav>
    <div className="visit-return-status" aria-hidden={!returning}><span>↓ {l(L('Retour dans la pièce','Returning to the room','Terug naar de kamer'))}</span><span>{l(roomNames[project.id])}</span><i/></div>
    <dialog ref={dialog} className="capture-dialog" aria-label={lightbox?.title||c.capture} onCancel={event=>{event.preventDefault();closeLightbox();}}><div className="capture-dialog-top"><p>{lightbox?.title}</p><button onClick={()=>setZoom(!zoom)} aria-pressed={zoom}>100 %</button><button onClick={closeLightbox}>{c.close} ×</button></div><div className={'capture-dialog-image'+(zoom?' zoomed':'')}>{lightbox&&<Capture item={lightbox} full/>}</div></dialog>
  </article>;
}
ProjectVisit.propTypes={project:PropTypes.object.isRequired,initialSelection:PropTypes.object,initialPosition:PropTypes.object,onRemember:PropTypes.func.isRequired,onClose:PropTypes.func.isRequired};
