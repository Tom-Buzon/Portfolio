import { scrollPage } from './navigation';

const storageKey='whoami:language-position';

// Store a semantic location, not an absolute page height: translations reflow.
export function captureReadingPosition(){
  const project=document.querySelector('.project-visit');
  let element,position;
  if(project){
    const current=project.querySelector('.visit-step.is-current');
    const exiting=Number(project.dataset.exitProgress)>0;
    element=exiting?project.querySelector('.visit-exit'):current;
    position={project:project.dataset.project,step:Number(current?.dataset.visitStep)||0,exiting};
  }else{
    const sections=[...document.querySelectorAll('.general-visit [data-scene-stop]')].filter(node=>node.offsetHeight);
    element=sections[0];
    for(const section of sections)if(section.getBoundingClientRect().top<=innerHeight*.2)element=section;
    position={section:element?.id||'top',expanded:[...document.querySelectorAll('.general-visit details')].flatMap((node,index)=>node.open?[index]:[])};
  }
  return {...position,offset:element?-element.getBoundingClientRect().top/element.offsetHeight:0};
}

export function saveReadingPosition(position,destination){
  try{sessionStorage.setItem(storageKey,JSON.stringify({...position,destination:new URL(destination,location.href).pathname,savedAt:Date.now()}));}catch{/* The destination anchor remains a usable fallback. */}
}

export function takeReadingPosition(){
  try{
    const saved=JSON.parse(sessionStorage.getItem(storageKey));sessionStorage.removeItem(storageKey);
    if(saved?.destination!==location.pathname||Date.now()-saved.savedAt>60000||!Number.isFinite(saved.offset))return undefined;
    return saved;
  }catch{return undefined;}
}

export function restoreReadingPosition(position,onRestore=()=>{}){
  let frame,observer,timer,stopped=false;
  const events=['wheel','touchstart','pointerdown','keydown'];
  const stop=()=>{stopped=true;cancelAnimationFrame(frame);observer?.disconnect();clearTimeout(timer);events.forEach(type=>window.removeEventListener(type,stop,true));};
  const align=()=>{
    if(stopped)return;
    const element=position.project?document.querySelector(position.exiting?'.project-visit .visit-exit':`.project-visit [data-visit-step="${Number(position.step)||0}"]`):position.section==='top'?document.querySelector('.personal-hero'):document.getElementById(position.section);
    if(element?.offsetHeight){scrollPage(Math.max(0,element.getBoundingClientRect().top+scrollY+element.offsetHeight*position.offset),true);onRestore();}
  };
  frame=requestAnimationFrame(()=>{
    if(!position.project)document.querySelectorAll('.general-visit details').forEach((node,index)=>{node.open=position.expanded?.includes(index)||false;});
    align();
    observer=new ResizeObserver(align);const main=document.querySelector('main');if(main)observer.observe(main);
    document.fonts?.ready.then(align);
    timer=setTimeout(stop,1600);
    events.forEach(type=>window.addEventListener(type,stop,{capture:true,passive:true}));
  });
  return stop;
}
