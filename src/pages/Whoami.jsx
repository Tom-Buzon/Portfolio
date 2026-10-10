import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocale } from '../i18n/Locale';
import { copy, localize } from '../content/copy';
import { projects, aliases, projectIds } from '../content/projects';
import { explorations } from '../content/skills';
import { publicUrl } from '../lib/publicUrl';
import { plainClick, scrollPage, scrollToId } from '../lib/navigation';
import { track } from '../lib/analytics';
import { restoreReadingPosition } from '../lib/languagePosition';
import CompetencyMap from '../components/CompetencyMap';
import ProjectStage from '../components/ProjectStage';
import ProjectVisit from '../components/ProjectVisit';
import MethodDesk from '../components/MethodDesk';
import { email } from '../data';

export default function Whoami({ initialProject = '', initialAnchor = '', readingPosition }) {
  const { locale, url } = useLocale();
  const c = localize(copy,locale);
  const work = useMemo(() => localize(projects,locale),[locale]);
  const [opened,setOpened] = useState(initialProject), [direct,setDirect] = useState(Boolean(initialProject));
  const [visited,setVisited]=useState(!initialProject);
  const [returning,setReturning]=useState(false);
  useEffect(()=>{if(returning){const timer=setTimeout(()=>setReturning(false),1000);return()=>clearTimeout(timer);}},[returning]);
  const origin = useRef({ y:0, trigger:null });
  const selections=useRef({});
  const positionConsumed=useRef(false);
  const remember=useCallback((id,value)=>{selections.current[id]=value;},[]);
  const navigate = useCallback(id => {
    const target = aliases[id] || id;
    setOpened(''); setDirect(false); setVisited(true);
    history.pushState({whoamiProject:'',whoamiScroll:0},'',url('/#'+target));
    scrollToId(target);
  },[url]);
  useEffect(() => {
    const restoration=history.scrollRestoration; history.scrollRestoration='manual';
    const onNavigate = event => navigate(event.detail);
    const onPop = event => {
      const match = location.pathname.match(/\/work\/([^/]+)\/?$/);
      const id = match && projectIds.includes(match[1]) ? match[1] : '';
      setOpened(id);
      if (!id) { setDirect(false); setVisited(true); requestAnimationFrame(() => requestAnimationFrame(() => { scrollPage(event.state?.whoamiScroll ?? origin.current.y,true); let attempts=0;const restore=()=>{origin.current.trigger?.focus({preventScroll:true});if(document.activeElement!==origin.current.trigger&&attempts++<16)requestAnimationFrame(restore);};requestAnimationFrame(restore); })); }
      else { setDirect(false); requestAnimationFrame(()=>scrollPage(0,true)); }
    };
    window.addEventListener('whoami:navigate',onNavigate); window.addEventListener('popstate',onPop);
    return () => { history.scrollRestoration=restoration; window.removeEventListener('whoami:navigate',onNavigate); window.removeEventListener('popstate',onPop); };
  },[navigate]);
  useEffect(() => {
    if(readingPosition&&!readingPosition.project)return restoreReadingPosition(readingPosition);
    const raw = decodeURIComponent(location.hash.slice(1)), target = aliases[raw] || raw || initialAnchor;
    if (!initialProject && target) {
      if (aliases[raw] || initialAnchor) history.replaceState({},'',url('/#'+target));
      scrollToId(target,true);
    }
  },[initialAnchor,initialProject,url,readingPosition]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('whoami:route',{detail:opened}));
    const selected = work.find(project => project.id === opened);
    document.title = selected ? `${selected.name} — Tom Buzon` : `Tom Buzon — ${c.identity}`;
    document.documentElement.dataset.direct = opened ? 'true' : 'false';
  },[opened,direct,work,c.identity]);
  function openCase(id,event) {
    positionConsumed.current=true;
    if (opened === id) { closeCase(); return; }
    origin.current = { y:scrollY,trigger:event?.currentTarget || document.activeElement };
    history.replaceState({...history.state,whoamiScroll:scrollY},'',location.href);
    history.pushState({whoamiProject:id,whoamiFromVisit:!direct,whoamiScroll:scrollY},'',url(`/work/${id}/`));
    setOpened(id);
    requestAnimationFrame(()=>scrollPage(0,true));
    requestAnimationFrame(()=>document.getElementById(id+'-detail')?.focus({preventScroll:true}));
  }
  function closeCase(options) {
    track('project_return',{project_id:opened,return_method:options?.fromScroll?'scroll':'button'});
    if(options?.fromScroll)setReturning(true);
    if (direct) { setVisited(true); const id=opened; setDirect(false);setOpened('');history.replaceState({},'',url('/#'+id));scrollToId(id,true); }
    else if (history.state?.whoamiFromVisit) history.back();
    else {setVisited(true);setOpened('');history.replaceState({},'',url('/#work'));scrollPage(origin.current.y,true);}
  }
  const go = (event,id) => { if(plainClick(event)){event.preventDefault();navigate(id);} };
  return <>
    {visited && <div className="general-visit" data-returning={returning} hidden={Boolean(opened)}>
      <section className="home-hero personal-hero" data-tour-scene="top" data-scene-stop="0" data-scene-view>
        <img className="attic-image" src={publicUrl('/images/attic-studio.webp')} alt="" width="1672" height="941" />
        <div className="hero-shade" /><div className="hero-image-slice slice-one" aria-hidden="true" /><div className="hero-image-slice slice-two" aria-hidden="true" />
        <div className="hero-copy wrap"><div className="hero-copy-card"><p className="overline"><span className="small-line" /> TOM BUZON / {c.identity}</p><h1>{c.heroFirst}<br /><span className="warm">{c.heroLast}</span></h1><p className="hero-description">{c.heroBody}</p><div className="actions"><a className="button button-light" href="#work" onClick={event=>go(event,'work')}>{c.explore}<span>↗</span></a><a className="quiet-link" href="https://www.linkedin.com/in/tom-buzon-93833b229/" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a></div></div></div>
        <div className="hero-baseline wrap"><span>UNDERSTAND → BUILD → TEST → LEARN → ITERATE</span><span>LEIDEN / NL</span><a href="#approach" onClick={event=>go(event,'approach')} aria-label={c.method}>↓</a></div>
      </section>
      <MethodDesk />
      <section className="skills-section section" id="skills" data-tour-scene="skills" data-scene-stop="2" data-scene-view><div className="wrap"><div className="skills-heading" data-reveal><p className="overline">02 / APPROACH & SKILLS</p><h2>{c.skillsTitle}</h2><p>{c.skillsLead}</p></div><CompetencyMap /></div></section>
      <section className="work-opening section" id="work" data-tour-scene="work" data-scene-stop="3" data-scene-view><div className="wrap"><p className="overline">03 / {c.selected}</p><div className="work-heading"><h2>{c.workTitle}</h2><p>{c.workLead}</p></div><nav className="project-index" aria-label={c.work}>{work.map((project,i)=><a key={project.id} href={'#'+project.id} onClick={event=>go(event,project.id)} style={{'--project-color':project.color}}><span>0{i+1}</span>{project.name}<b>↗</b></a>)}</nav></div></section>
    {work.map((project,index)=><ProjectStage key={project.id} project={project} number={index+1} onOpen={event=>openCase(project.id,event)}/>)}
      <section className="explorations-section section" id="explorations" data-tour-scene="explorations" data-scene-stop="16"><div className="wrap"><p className="overline">THE EXPLORATION BOOK</p><div className="work-heading"><h2>{c.archives}</h2><p>{c.archivesLead}</p></div><div className="exploration-list">{localize(explorations,locale).map(([name,tools,body],i)=><details key={name}><summary><span>{String(i+1).padStart(2,'0')}</span><h3>{name}</h3><b aria-hidden="true">+</b></summary><div><p>{body}</p><p className="micro-label">{tools}</p></div></details>)}</div></div></section>
      <section className="personal-contact section" id="contact" data-tour-scene="contact" data-scene-stop="16" data-scene-view><div className="wrap"><p className="overline">LET’S TALK</p><h2>{c.contactTitle}</h2><p>{c.contactBody}</p><div className="actions"><a className="button button-light" href={'mailto:'+email}>{c.email} <span>↗</span></a><a className="quiet-link" href="https://www.linkedin.com/in/tom-buzon-93833b229/" target="_blank" rel="noreferrer">LinkedIn ↗</a></div></div></section>
    </div>}
    {opened && <ProjectVisit key={opened} project={work.find(project=>project.id===opened)} initialSelection={selections.current[opened]} initialPosition={!positionConsumed.current&&readingPosition?.project===opened?readingPosition:undefined} onRemember={remember} onClose={closeCase}/>}
  </>;
}
Whoami.propTypes={initialProject:PropTypes.string,initialAnchor:PropTypes.string,readingPosition:PropTypes.object};
