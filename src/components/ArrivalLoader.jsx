import { useEffect, useState } from 'react';
import { useLocale } from '../i18n/Locale';

export default function ArrivalLoader(){
  const [phase,setPhase]=useState('loading');
  const {locale}=useLocale();
  useEffect(()=>{
    const started=performance.now();let exitTimer,doneTimer,finished=false;
    const finish=()=>{if(finished)return;finished=true;clearTimeout(fallback);exitTimer=setTimeout(()=>{setPhase('leaving');doneTimer=setTimeout(()=>setPhase('done'),650);},Math.max(0,650-(performance.now()-started)));};
    const fallback=setTimeout(finish,8000);
    window.addEventListener('whoami:world-ready',finish,{once:true});
    if(document.documentElement.classList.contains('world-ready'))finish();
    return()=>{clearTimeout(fallback);clearTimeout(exitTimer);clearTimeout(doneTimer);window.removeEventListener('whoami:world-ready',finish);};
  },[]);
  if(phase==='done')return null;
  return <div className={'arrival-loader '+phase} role="status" aria-live="polite"><div className="arrival-orbit" aria-hidden="true"><i/><i/><svg viewBox="0 0 100 90"><path d="M14 72 50 15 86 72M30 72 50 41 70 72"/></svg></div><p>TOM BUZON</p><span>{locale==='fr'?'La visite se prépare':locale==='nl'?'De rondleiding wordt voorbereid':'Opening the workspace'}</span><div className="arrival-line" aria-hidden="true"><i/></div><small>UNDERSTAND → BUILD → TEST → LEARN → ITERATE</small></div>;
}
