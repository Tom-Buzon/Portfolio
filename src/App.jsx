import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { LocaleProvider, useLocale } from './i18n/Locale';
import { localeUrl } from './i18n/core';
import { copy, localize } from './content/copy';
import { email } from './data';
import SignalText from './components/SignalText';
import ArrivalLoader from './components/ArrivalLoader';
import AtticWorld from './components/AtticWorld';
import Whoami from './pages/Whoami';
import { useMotion } from './lib/useMotion';
import { plainClick,scrollPage } from './lib/navigation';

function Roof() { return <svg viewBox="0 0 38 32" aria-hidden="true"><path d="M3 27 19 5l16 22M11 27l8-11 8 11M19 5v-3" fill="none" stroke="currentColor" strokeWidth="2.2" /></svg>; }
function Shell({ project, anchor }) {
  const { locale, url } = useLocale();
  const c = localize(copy, locale);
  const [active, setActive] = useState('profile'), [motion, setMotion] = useState(true), [systemReduced, setSystemReduced] = useState(false);
  const [currentProject, setCurrentProject] = useState(project);
  const chapters = [['profile', c.profile], ['approach', c.skills], ['work', c.work]];
  useMotion(motion, 'whoami');
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const read = () => { let saved; try { saved = localStorage.getItem('attic-motion'); } catch { /* Optional preference. */ } setSystemReduced(media.matches); setMotion(!media.matches && saved !== 'off'); };
    read(); media.addEventListener('change', read);
    return () => media.removeEventListener('change', read);
  }, []);
  useEffect(() => { document.documentElement.dataset.motion = motion ? 'on' : 'off'; window.dispatchEvent(new CustomEvent('attic:motion', { detail: motion })); }, [motion]);
  useEffect(() => {
    const read = () => {
      if(document.querySelector('.project-visit')){setActive('work');return;}
      const sections = ['profile', 'approach', 'skills', 'work'].map(id => document.getElementById(id)).filter(Boolean);
      let chosen = 'profile';
      for (const section of sections) if (section.getBoundingClientRect().top < innerHeight * .5) chosen = section.id==='skills'?'approach':section.id;
      setActive(chosen);
    };
    const route = event => {setCurrentProject(event.detail || '');if(event.detail)setActive('work');};
    window.addEventListener('scroll', read, { passive:true }); window.addEventListener('whoami:route', route); read();
    return () => { window.removeEventListener('scroll', read); window.removeEventListener('whoami:route', route); };
  }, []);
  const toggleMotion = () => {
    const point=innerHeight*.35;
    const anchor=[...document.querySelectorAll('main [data-scene-stop]')].find(element=>{const rect=element.getBoundingClientRect();return rect.top<=point&&rect.bottom>point;});
    const offset=anchor?-anchor.getBoundingClientRect().top:0;
    const next=!motion;setMotion(next);
    try { localStorage.setItem('attic-motion',next?'on':'off'); } catch { /* Optional preference. */ }
    requestAnimationFrame(()=>requestAnimationFrame(()=>{if(anchor?.isConnected)scrollPage(Math.max(0,anchor.getBoundingClientRect().top+scrollY+Math.min(offset,Math.max(0,anchor.offsetHeight-180))),true);}));
  };
  const go = (event, id) => {
    if (!plainClick(event)) return;
    event.preventDefault(); window.dispatchEvent(new CustomEvent('whoami:navigate', { detail:id }));
  };
  const languages = <div className="language-switch" role="group" aria-label="Language">{['fr','en','nl'].map(lang => <a key={lang} href={localeUrl(currentProject ? `/work/${currentProject}/` : `/#${active}`,lang)} hrefLang={lang} lang={lang} aria-current={lang === locale ? 'true' : undefined} aria-label={{fr:'Français',en:'English',nl:'Nederlands'}[lang]}>{lang.toUpperCase()}</a>)}</div>;
  return <div className="site page-whoami" id="top">
    <ArrivalLoader /><AtticWorld page="whoami" />
    <a className="skip-link" href="#main">{c.skip}</a>
    <div className="reading-progress" aria-hidden="true"><i /></div>
    <header className="site-header">
      <a className="brand" href={url('/')} onClick={event => go(event,'top')} aria-label="Tom Buzon"><Roof /><span>tom buzon<span className="brand-point">.</span></span></a>
      <nav className="header-sections" aria-label={c.menu}>{chapters.map(([id,label])=><a key={id} href={url('/#'+id)} aria-current={active===id?'location':undefined} onClick={event=>go(event,id)}><SignalText text={label} active={active===id}/></a>)}</nav>
      <div className="header-actions">{languages}</div>
    </header>
    <nav className="chapter-rail" aria-label={c.menu}>{chapters.map(([id,label],i) => <a key={id} href={url('/#'+id)} onClick={event => go(event,id)} aria-label={label} aria-current={active === id ? 'location' : undefined}><span>{label}</span><i /><small>0{i+1}</small></a>)}</nav>
    <main id="main"><Whoami initialProject={project} initialAnchor={anchor} /></main>
    <footer className="site-footer personal-footer"><div className="footer-top"><a className="brand" href={url('/')} onClick={event => go(event,'top')}><Roof /><span>tom buzon.</span></a><p>{c.location}<br />Strategy, technology & hands-on delivery</p><a href={'mailto:'+email}>{c.email} ↗</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Tom Buzon</span><nav aria-label={c.menu}>{chapters.map(([id,label]) => <a key={id} href={url('/#'+id)} onClick={event => go(event,id)}>{label}</a>)}<a href="https://www.linkedin.com/in/tom-buzon-93833b229/" target="_blank" rel="noreferrer">LinkedIn ↗</a></nav><span>WHOAMI</span></div></footer>
    <button className="motion-toggle" disabled={systemReduced} title={systemReduced ? c.reduced : undefined} aria-pressed={!motion} onClick={toggleMotion}><span className="motion-bars" aria-hidden="true"><i /><i /><i /></span>{motion ? c.motionOn : c.motionOff}</button>
  </div>;
}
Shell.propTypes = { project:PropTypes.string, anchor:PropTypes.string };
export default function App({ locale = 'fr', project = '', anchor = '' }) { return <LocaleProvider locale={locale}><Shell project={project} anchor={anchor} /></LocaleProvider>; }
App.propTypes = { locale:PropTypes.string, project:PropTypes.string, anchor:PropTypes.string };
