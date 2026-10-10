/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocale } from '../i18n/Locale';
import { copy, L, localize } from '../content/copy';
import media from '../content/media.json';
import { publicUrl } from '../lib/publicUrl';

export function asset(item) {
  const value=media[item?.id] || item || {};
  const variants=value.variants || [];
  return {...value,src:publicUrl(variants.at(-1)?.src || value.src || '/images/attic-studio.webp'),thumb:publicUrl(variants[0]?.src || value.src || '/images/attic-studio.webp'),srcSet:variants.map(v=>`${publicUrl(v.src)} ${v.width}w`).join(',') || undefined};
}
export function Capture({item,full=false,...props}) {
  const a=asset(item);
  return <img src={a.src} srcSet={full?undefined:a.srcSet} sizes={full?undefined:'(max-width: 800px) 92vw, 65vw'} width={a.width} height={a.height} alt={item.title} loading="lazy" decoding="async" {...props} />;
}
Capture.propTypes={item:PropTypes.object.isRequired,full:PropTypes.bool};

export function VideoPlayer({item,worldId,onInspect}) {
  const {locale}=useLocale(), c=localize(copy,locale);
  const player=useRef(null), [playing,setPlaying]=useState(false), [error,setError]=useState(false);
  const a=media[item.id];
  useEffect(()=>{
    const node=player.current;
    const pause=()=>{if(document.hidden)node?.pause();};
    const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)node?.pause();},{threshold:.05});
    if(node)observer.observe(node);
    document.addEventListener('visibilitychange',pause);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',pause);node?.pause();};
  },[]);
  return <div className={'world-surface video-surface video-'+item.id} data-world-screen={worldId} style={{'--media-ratio':`${a.width}/${a.height}`}}>
    <video ref={player} data-media-id={item.id} src={publicUrl(a.src)} poster={publicUrl(a.poster)} controls={playing} preload="none" playsInline aria-label={item.title} onPlay={()=>{document.querySelectorAll('video').forEach(other=>{if(other!==player.current)other.pause();});setPlaying(true);onInspect?.(item.id);}} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>setError(true)} />
    {!playing && !error && <button className="video-play" onClick={()=>{setError(false);player.current.play().catch(()=>setError(true));}}><span className="play-icon" aria-hidden="true">▶</span><span>{item.title}<small>{Math.floor(a.duration/60)}:{String(Math.round(a.duration%60)).padStart(2,'0')} · {c.play}</small></span></button>}
    {error && <a className="media-error" href={publicUrl(a.src)}>{c.mediaError} ↗</a>}
  </div>;
}
VideoPlayer.propTypes={item:PropTypes.object.isRequired,worldId:PropTypes.string,onInspect:PropTypes.func};

export function StudyGraphic({type}) {
  const {locale}=useLocale();
  const label=text=>localize(text,locale);
  if(type==='sft')return <div className="study-graphic benchmark"><span className="micro-label">QWEN3 / 1.7B</span><p>{label(L('Un petit modèle. Trois étapes.','A small model. Three stages.','Een klein model. Drie stappen.'))}</p><div className="benchmark-bars">{[['BASE',35.7],['SFT',53.6],['DPO',60.7]].map(([name,value])=><div key={name}><strong>{new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(value)}<small>%</small></strong><i style={{height:value*1.8}} /><span>{name}</span></div>)}</div><small>{label(L('28 cas · benchmark interne exploratoire','28 cases · exploratory internal benchmark','28 gevallen · verkennende interne benchmark'))}</small></div>;
  return <div className="study-graphic physical-loop"><span className="micro-label">CAR AI / RASPBERRY PI 4</span><p>{label(L('Un jouet. Une boucle.','A toy. A feedback loop.','Speelgoed. Een terugkoppellus.'))}</p><svg viewBox="0 0 680 210" aria-hidden="true"><path d="M148 88H277M407 88H536M595 133V178H85V133" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M265 80L277 88L265 96M524 80L536 88L524 96M78 146L85 133L92 146" fill="none" stroke="currentColor" strokeWidth="2" /><rect x="20" y="24" width="130" height="110" rx="8"/><rect x="276" y="24" width="130" height="110" rx="8"/><rect x="534" y="24" width="130" height="110" rx="8"/><circle cx="85" cy="79" r="22"/><path d="M315 60L341 47L367 61L342 78ZM315 62V95L342 112L367 96V62M342 78V112M566 77H632M620 65L632 77L620 89" fill="none" stroke="currentColor" strokeWidth="3" /></svg><div className="physical-labels">{label([L('Caméra','Camera','Camera'),L('Interprétation','Interpretation','Interpretatie'),L('Mouvement','Movement','Beweging')]).map(text=><span key={text}>{text}</span>)}</div><small>{label(L('Schéma de principe du prototype','Prototype concept diagram','Principeschema van het prototype'))}</small></div>;
}
StudyGraphic.propTypes={type:PropTypes.string.isRequired};

