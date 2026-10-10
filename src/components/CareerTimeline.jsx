import { useEffect,useRef,useState } from 'react';
import { useLocale } from '../i18n/Locale';
import { copy,experience,L,localize } from '../content/copy';

export default function CareerTimeline(){
  const {locale}=useLocale(),l=value=>localize(value,locale),c=l(copy),items=l(experience);
  const [open,setOpen]=useState(false),[selected,setSelected]=useState(0),track=useRef(null),dialog=useRef(null),trigger=useRef(null);
  useEffect(()=>{if(open)dialog.current?.showModal();else dialog.current?.close();},[open]);
  useEffect(()=>{const restore=event=>{setOpen(Boolean(event.detail.open));setSelected(event.detail.selected||0);};window.addEventListener('whoami:career-restore',restore);return()=>window.removeEventListener('whoami:career-restore',restore);},[]);
  function choose(index){setSelected(index);const node=track.current?.children[index];if(node)track.current.scrollTo({left:node.offsetLeft-track.current.offsetLeft,behavior:document.documentElement.dataset.motion==='off'?'instant':'smooth'});}
  function close(){setOpen(false);trigger.current?.focus({preventScroll:true});}
  return <div className="career-inline"><button ref={trigger} className="career-open" aria-expanded={open} aria-controls="career-timeline" onClick={()=>setOpen(true)}>{l(L('Mon parcours','My background','Mijn achtergrond'))}<span>↗</span></button>
    <dialog ref={dialog} id="career-timeline" className="career-dialog" aria-labelledby="career-title" onCancel={event=>{event.preventDefault();close();}}><div className="career-dialog-head"><div><p className="overline">01 / {c.method}</p><h2 id="career-title">{l(L('Mon parcours','My background','Mijn achtergrond'))}</h2></div><button onClick={close} aria-label={c.close}>×</button></div><p className="career-summary">{c.studies}</p><div className="career-years">{items.map(([date],i)=><button key={date} onClick={()=>choose(i)} aria-pressed={selected===i}>{date}</button>)}</div><ol ref={track} className="career-track">{items.map(([date,company,role,body],i)=><li key={date}><span className="career-dot"/><p className="micro-label">{date} / {company}</p><h3>{role}</h3><p>{body}</p><span className="career-number">0{i+1}</span></li>)}</ol><p className="career-hint">↔ {l(L('Explorez la frise de gauche à droite','Explore the timeline from left to right','Verken de tijdlijn van links naar rechts'))}</p></dialog>
  </div>;
}
