import * as THREE from 'three';
import media from '../content/media.json';
import { buildProjectRooms } from './projectRooms.js';
import { paintExhibitPoster } from './exhibitPoster.js';
import { publicUrl } from '../lib/publicUrl';

// Map the four projected corners of a real scene surface to a CSS plane.
// CSS keeps video controls, text selection and keyboard interaction native.
export function quadMatrix(points,width,height) {
  const [p0,p1,p2,p3]=points;
  const dx1=p1.x-p2.x,dx2=p3.x-p2.x,dx3=p0.x-p1.x+p2.x-p3.x;
  const dy1=p1.y-p2.y,dy2=p3.y-p2.y,dy3=p0.y-p1.y+p2.y-p3.y;
  const denominator=dx1*dy2-dx2*dy1;
  if(Math.abs(denominator)<.00001)return null;
  const g=(dx3*dy2-dx2*dy3)/denominator,h=(dx1*dy3-dx3*dy1)/denominator;
  return [(p1.x-p0.x+g*p1.x)/width,(p1.y-p0.y+g*p1.y)/width,0,g/width,
    (p3.x-p0.x+h*p3.x)/height,(p3.y-p0.y+h*p3.y)/height,0,h/height,
    0,0,1,0,p0.x,p0.y,0,1];
}

export function createGallery({scene,box,cylinder,beam,label,light,glow,add,materials,sources,textures}) {
  const {oak,steel,copper,paper}=materials;
  const screens=[], pending=new Map();let disposed=false;
  const v=(...xyz)=>new THREE.Vector3(...xyz);
  function poster(title,ratio,id) {
    const canvas=document.createElement('canvas');canvas.width=960;canvas.height=Math.round(960/ratio);
    const ctx=canvas.getContext('2d');paintExhibitPoster(ctx,canvas.width,canvas.height,id,title);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);return texture;
  }
  function imageFor(id) {return media[id]?.variants?.[0]?.src || media[id]?.poster;}
  function frame(id,project,stop,title,image,ratio,w,x,y,z,rotation=0,kind='monitor') {
    const h=w/ratio, group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=rotation;scene.add(group);
    const border=kind==='paper'?.24:kind==='projection'?.06:.14;
    box(w+border,h+border,.12,0,0,0,kind==='wood'?oak:kind==='paper'?paper:steel,group);
    if(kind==='projection'){for(const y of [-h/2-.055,h/2+.055])box(w+.2,.045,.06,0,y,.075,copper,group);}
    if(kind==='paper'){for(const x of [-w/2+.1,w/2-.1])box(.08,.12,.025,x,h/2+.04,.08,copper,group);}
    const mat=new THREE.MeshBasicMaterial({map:poster(title,ratio,id),toneMapped:false});
    const display=add(new THREE.PlaneGeometry(w,h),mat,group);display.position.z=.108;
    const screen={id,project,stop,title,image,ratio,w,h,group,display,mat,loaded:'',element:null};screens.push(screen);
    return screen;
  }
  buildProjectRooms({scene,box,cylinder,beam,label,light,glow,add,materials,sources,frame,imageFor});

  function load(screen,src) {
    src=src?publicUrl(src):'';
    if(!src || screen.loaded===src)return;
    screen.loaded=src;
    const key=src+'|'+screen.ratio;
    if(pending.has(key)){pending.get(key).then(texture=>{if(texture&&!disposed&&screen.loaded===src){screen.mat.map=texture;screen.mat.needsUpdate=true;}});return;}
    const promise=new Promise(resolve=>{
      const image=new Image();image.onload=()=>{
        if(disposed){resolve(null);return;}
        const canvas=document.createElement('canvas');canvas.width=960;canvas.height=Math.round(960/screen.ratio);
        const ctx=canvas.getContext('2d');ctx.fillStyle='#080e16';ctx.fillRect(0,0,canvas.width,canvas.height);
        const scale=Math.min(canvas.width/image.width,canvas.height/image.height),w=image.width*scale,h=image.height*scale;
        ctx.drawImage(image,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
        const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);resolve(texture);
      };image.onerror=()=>resolve(null);image.src=src;
    });pending.set(key,promise);
    promise.then(texture=>{if(texture&&!disposed&&screen.loaded===src){screen.mat.map=texture;screen.mat.needsUpdate=true;}});
  }
  const corners=[v(),v(),v(),v()], projected=[v(),v(),v(),v()];
  function update(camera,progress,enabled) {
    const mobile=innerWidth<=1000 || !enabled;
    for(const screen of screens){
      if(Math.abs(progress-screen.stop)<1.35)load(screen,screen.image);
      if(!screen.element?.isConnected||screen.element.dataset.worldScreen!==screen.id)screen.element=document.querySelector(`[data-world-screen="${screen.id}"]`);
      const element=screen.element;if(!element)continue;
      const article=element.closest('.project-visit'), rect=article?.getBoundingClientRect();
      const active=!mobile&&rect&&rect.top<innerHeight*.62&&rect.bottom>innerHeight*.42&&Math.abs(progress-screen.stop)<.55;
      const source=element.querySelector('img')?.currentSrc; if(source)load(screen,source);
      element.dataset.projected=active?'true':'false';
      if(article)article.dataset.galleryActive=active?'true':'false';
      if(!active){if(!mobile){const video=element.querySelector('video');if(video&&!video.paused)video.pause();}continue;}
      corners[0].set(-screen.w/2,screen.h/2,0);corners[1].set(screen.w/2,screen.h/2,0);corners[2].set(screen.w/2,-screen.h/2,0);corners[3].set(-screen.w/2,-screen.h/2,0);
      screen.display.updateWorldMatrix(true,false);
      for(let i=0;i<4;i++){projected[i].copy(corners[i]).applyMatrix4(screen.display.matrixWorld).project(camera);projected[i].x=(projected[i].x+1)*innerWidth/2;projected[i].y=(1-projected[i].y)*innerHeight/2;}
      if(projected.some(point=>point.z>1)){element.dataset.projected='false';continue;}
      const width=screen.ratio<1?360:960,height=width/screen.ratio,matrix=quadMatrix(projected,width,height);
      if(matrix){element.style.setProperty('--screen-width',width+'px');element.style.setProperty('--screen-height',height+'px');element.style.setProperty('--screen-transform',`matrix3d(${matrix.join(',')})`);}
    }
  }
  function focus(project,which='main') {
    const screen=screens.find(s=>s.id===project+'-'+which)||screens.find(s=>s.project===project);
    if(!screen)return null;
    const p=screen.group.position, aspect=innerWidth/innerHeight;
    const tangent=Math.tan(THREE.MathUtils.degToRad(24));
    const captionTop=document.querySelector('.visit-media-caption')?.getBoundingClientRect().top||innerHeight-125;
    const top=160,bottom=Math.max(top+190,captionTop-22),height=(bottom-top)/innerHeight;
    const distance=Math.max(screen.h/(2*tangent*height),screen.w/(2*tangent*aspect*.49),3.5);
    const right=v(1,0,0).applyQuaternion(screen.group.quaternion), normal=v(0,0,1).applyQuaternion(screen.group.quaternion);
    const target=p.clone().addScaledVector(right,-distance*tangent*aspect*.4);
    target.y+=distance*tangent*((top+bottom)/innerHeight-1);
    return {position:target.clone().addScaledVector(normal,distance),look:target};
  }

  function change(event){const screen=screens.find(s=>s.id===event.detail.screen);if(screen){screen.image=event.detail.src;load(screen,screen.image);}}
  window.addEventListener('whoami:media',change);
  return {update,focus,dispose(){disposed=true;window.removeEventListener('whoami:media',change);screens.forEach(s=>{if(s.element)s.element.dataset.projected='false';});}};
}

export function createMethodObject({scene,box,line,display,textures,materials}) {
  // A small physical brief on the welcome desk: frame, build, test, annotate, revise.
  const group=new THREE.Group();group.position.set(.8,1.79,.25);scene.add(group);
  const {copper,blue,paper}=materials;
  const v=(...xyz)=>new THREE.Vector3(...xyz),cards=[];
  for(let i=0;i<5;i++){
    const card=box(.38,.035,.29,(i-2)*.48,0,.14,paper,group);cards.push(card);
    for(let j=0;j<3;j++)box(.22-j*.04,.003,.012,0,.02,-.06+j*.055,copper,card);
  }
  const prototype=box(.32,.18,.22,.95,.12,-.28,copper,group);
  const failed=box(.1,.08,.09,.95,.24,-.28,blue,group);
  const pencil=box(.015,.015,.42,-.6,.06,.21,copper,group);pencil.rotation.y=.35;
  const trace=line([v(-.95,.04,.36),v(.95,.04,.36)],0xc99565,.5,group);
  const canvas=document.createElement('canvas');canvas.width=960;canvas.height=570;
  const context=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
  display.material.map=texture;
  const names=['UNDERSTAND','BUILD','TEST','LEARN','ITERATE'];
  const notes=['Name the need. Keep the question open.','Turn the hypothesis into something testable.','An unexpected result is useful evidence.','Read the gap. Revisit the assumption.','Adjust the approach. Try again.'];
  let current=0,previous=-1;
  function drawBrief(value,selected){
    const ctx=context,w=960;ctx.fillStyle='#112027';ctx.fillRect(0,0,w,570);
    ctx.strokeStyle='#50655e';ctx.strokeRect(24,24,912,522);
    ctx.fillStyle='#b9c8b9';ctx.font='22px monospace';ctx.fillText('WORKING NOTES / '+String(selected+1).padStart(2,'0'),55,72);
    ctx.fillStyle='#f0dfc0';ctx.font='500 49px sans-serif';ctx.fillText(names[selected],55,142);
    const assembled=Math.min(1,value),tested=Math.max(0,Math.min(1,value-1)),revised=Math.max(0,Math.min(1,value-3));
    const gap=tested*(1-revised),labels=['NEED','APPROACH','TRY'];
    [0,1,2].forEach(i=>{
      const x=95+i*270+(i===2?gap*35:0),y=235+(1-assembled)*[36,-20,58][i]+(i===2?gap*30:0);
      ctx.setLineDash([8,8]);ctx.strokeStyle='#69817a';ctx.strokeRect(87+i*270,227,202,132);ctx.setLineDash([]);
      ctx.fillStyle=i===2&&gap>.4?'#704e39':'#304b47';ctx.fillRect(x,y,186,116);
      ctx.fillStyle='#d7dcc5';ctx.font='23px monospace';ctx.fillText(labels[i],x+20,y+39);
      ctx.fillStyle=i===2&&gap>.4?'#edb581':'#9cb7a7';ctx.fillRect(x+20,y+60,120,4);ctx.fillRect(x+20,y+76,85,4);
      if(i<2){ctx.strokeStyle='#c6b18d';ctx.beginPath();ctx.moveTo(300+i*270,290);ctx.lineTo(340+i*270,290);ctx.lineTo(330+i*270,283);ctx.moveTo(340+i*270,290);ctx.lineTo(330+i*270,297);ctx.stroke();}
    });
    ctx.fillStyle='#c1d0c5';ctx.font='24px sans-serif';ctx.fillText(notes[selected],55,444);
    names.forEach((_,i)=>{ctx.fillStyle=i<=selected?'#cdb48e':'#344c4c';ctx.fillRect(55+i*171,499,148,5);});
    texture.needsUpdate=true;
  }
  return progress=>{
    group.visible=progress<2;
    const selected=Number(document.querySelector('[data-method-step]')?.dataset.methodStep||0);
    current+=(selected-current)*.075;
    const frame=Math.round(current*90);if(frame!==previous){drawBrief(current,selected);previous=frame;}
    cards.forEach((card,i)=>{card.position.y=.01+Math.max(0,1-Math.abs(current-i))*.14;card.rotation.y=(i-2)*.025;});
    prototype.scale.setScalar(.55+Math.min(current,1)*.45);
    failed.position.x=.95+Math.sin(Math.max(0,Math.min(2,current-1))*Math.PI/2)*.34;
    failed.position.y=.24+Math.sin(Math.max(0,Math.min(2,current-1))*Math.PI/2)*.18;
    pencil.position.x=-.6+Math.max(0,Math.min(1,current-2))*.9;
    trace.material.opacity=.15+Math.min(current,4)*.13;
  };
}
