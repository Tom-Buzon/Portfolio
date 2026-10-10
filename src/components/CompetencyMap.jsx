import { useEffect, useRef } from 'react';
import { useLocale } from '../i18n/Locale';
import { copy, localize } from '../content/copy';
import { publicUrl } from '../lib/publicUrl';

// Isolate the complete supplied atlas to preserve its typography and interactions.
export default function CompetencyMap() {
  const { locale }=useLocale(), frame=useRef(null);
  useEffect(()=>{
    let visible=false;
    const sync=()=>frame.current?.contentWindow?.postMessage({type:'whoami:atlas-motion',enabled:visible&&document.documentElement.dataset.motion!=='off'&&!document.hidden},location.origin);
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});
    observer.observe(frame.current);const node=frame.current;node.addEventListener('load',sync);
    const size=event=>{if(event.origin!==location.origin||event.source!==node.contentWindow||event.data?.type!=='whoami:atlas-height'||node.clientWidth>1000)return;const height=Number(event.data.height);if(Number.isFinite(height)&&height>=200&&height<=2400)node.style.setProperty('--atlas-touch-height',Math.ceil(height)+'px');};
    window.addEventListener('message',size);
    window.addEventListener('attic:motion',sync);document.addEventListener('visibilitychange',sync);
    return()=>{observer.disconnect();node.removeEventListener('load',sync);window.removeEventListener('message',size);window.removeEventListener('attic:motion',sync);document.removeEventListener('visibilitychange',sync);};
  },[]);
  return <iframe ref={frame} className="original-atlas" title={localize(copy,locale).skills} src={publicUrl('/atlas/index.html')+'?v=6&lang='+locale} loading="lazy" scrolling="no" />;
}
