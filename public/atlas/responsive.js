/* global groups,choose:writable,highlight:writable */
const atlasMain=document.querySelector('main');
const atlasLanguage=new URLSearchParams(location.search).get('lang')||'fr';
const atlasCopy=(fr,en,nl)=>({fr,en,nl}[atlasLanguage]||en);
const svgNSAtlas='http://www.w3.org/2000/svg';
const svgNode=(tag,attrs,parent)=>{const node=document.createElementNS(svgNSAtlas,tag);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,value);parent?.append(node);return node;};
const atlasHint=document.createElement('p');atlasHint.className='atlas-hint';atlasHint.textContent=atlasCopy('Explorez une station · compétences & outils','Explore a station · skills & tools','Verken een station · vaardigheden & tools');atlasMain.prepend(atlasHint);
// Intersecting routes share one centre; every family spans the whole map.
const atlasMap=document.getElementById('map'),atlasStations=document.getElementById('stations');atlasMap.append(atlasStations);
const routeShapes={a:[420,180,-20,48],b:[435,210,20,56],c:[365,195,-48,40],d:[380,170,48,0]};
function orbitPoint([rx,ry,rotation],angle){const a=angle*Math.PI/180,r=rotation*Math.PI/180;return [600+rx*Math.cos(a)*Math.cos(r)-ry*Math.sin(a)*Math.sin(r),360+rx*Math.cos(a)*Math.sin(r)+ry*Math.sin(a)*Math.cos(r)];}
const routePoints=Object.fromEntries(Object.entries(routeShapes).map(([key,shape])=>[key,Array.from({length:5},(_,i)=>orbitPoint(shape,shape[3]+72*i))]));
function curve(points){let path=`M ${points[0].join(' ')}`;for(let i=0;i<points.length-1;i++){const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];path+=` C ${p1[0]+(p2[0]-p0[0])/6} ${p1[1]+(p2[1]-p0[1])/6}, ${p2[0]-(p3[0]-p1[0])/6} ${p2[1]-(p3[1]-p1[1])/6}, ${p2.join(' ')}`;}return path;}
function labelLines(text,label,max=18){const lines=[''];for(const word of label.split(' ')){const last=lines.length-1;if((lines[last]+' '+word).trim().length>max&&lines[last])lines.push(word);else lines[last]=(lines[last]+' '+word).trim();}text.replaceChildren();lines.forEach((line,i)=>{const span=svgNode('tspan',{x:text.getAttribute('x'),dy:i?'23':'0'},text);span.textContent=line;});}
Object.entries(routePoints).forEach(([key,points])=>{const shape=routeShapes[key],[rx,ry,rotation]=shape,start=orbitPoint(shape,0),opposite=orbitPoint(shape,180),path=`M ${start.join(' ')} A ${rx} ${ry} ${rotation} 1 1 ${opposite.join(' ')} A ${rx} ${ry} ${rotation} 1 1 ${start.join(' ')}`,rail=document.getElementById('rail-'+key);rail.setAttribute('d',path);rail.nextElementSibling.setAttribute('d',path);points.forEach(([x,y],i)=>{groups[key].items[i].pos={x,y};const station=atlasStations.querySelector(`[data-line="${key}"][data-index="${i}"]`);station.querySelectorAll('circle').forEach(circle=>{circle.setAttribute('cx',x);circle.setAttribute('cy',y);});const text=station.querySelector('text');text.setAttribute('x',x);text.setAttribute('y',y+32);text.setAttribute('text-anchor','middle');labelLines(text,groups[key].items[i][0]);station.querySelector('rect')?.remove();});});
// Place full labels near their nodes, avoiding the core, other labels and nodes.
// Layout runs again after fonts load so fallback-font measurements cannot clip text.
function placeLabels(){
 const nodes=[...atlasStations.querySelectorAll('.station')].map(station=>{const text=station.querySelector('text'),circle=station.querySelector('.outer'),b=text.getBBox();return {station,text,x:+circle.getAttribute('cx'),y:+circle.getAttribute('cy'),w:b.width+12,h:b.height+10};}).sort((a,b)=>b.w*b.h-a.w*a.h);
 const occupied=[{x:477,y:236,w:246,h:248}],overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
 for(const n of nodes){
  const side=n.x<600?-1:1,candidates=[];
  for(const distance of [25,46,70])for(const [dx,dy]of [[side*(n.w/2+distance),0],[0,n.h/2+distance],[0,-n.h/2-distance],[-side*(n.w/2+distance),0],[side*(n.w/2+distance),n.h/2],[-side*(n.w/2+distance),-n.h/2]]){
   const box={x:Math.max(10,Math.min(1190-n.w,n.x+dx-n.w/2)),y:Math.max(10,Math.min(710-n.h,n.y+dy-n.h/2)),w:n.w,h:n.h};
   const collision=occupied.reduce((sum,b)=>sum+overlap(box,b),0)+nodes.reduce((sum,p)=>sum+overlap(box,{x:p.x-17,y:p.y-17,w:34,h:34}),0);
   const travel=Math.hypot(box.x+n.w/2-n.x,box.y+n.h/2-n.y);candidates.push({box,score:collision*1000+travel});
  }
  candidates.sort((a,b)=>a.score-b.score);const {box}=candidates[0];occupied.push(box);
  const tx=box.x+box.w/2,ty=box.y+22;n.text.setAttribute('x',tx);n.text.setAttribute('y',ty);n.text.querySelectorAll('tspan').forEach(span=>span.setAttribute('x',tx));
  n.station.querySelector('rect')?.remove();const bounds=n.text.getBBox(),hit=svgNode('rect',{x:bounds.x-5,y:bounds.y-5,width:bounds.width+10,height:bounds.height+10,fill:'transparent'});n.station.prepend(hit);n.station.querySelector('.station-hit')?.remove();n.station.prepend(svgNode('circle',{cx:n.x,cy:n.y,r:22,fill:'transparent',class:'station-hit'}));
 }
}
placeLabels();document.fonts.ready.then(placeLabels);
const sourceHighlight=highlight;
highlight=function(which){sourceHighlight(which);atlasMap.dataset.focus=which;document.documentElement.style.setProperty('--active',groups[which]?.color||groups.a.color);};
highlight('all');
Object.keys(groups).forEach(key=>{document.getElementById('rail-'+key).addEventListener('click',()=>document.querySelector(`.line[data-line="${key}"]`).click());});

// Phone: the same twenty stations become four large tactile constellations.
const families=document.createElement('div');families.className='touch-families';families.setAttribute('role','group');families.setAttribute('aria-label',atlasCopy('Domaines','Practice areas','Vakgebieden'));
const touchStage=document.createElement('div');touchStage.className='touch-map';const touchSvg=svgNode('svg',{viewBox:'0 0 600 360',role:'group','aria-label':atlasCopy('Carte tactile des compétences','Interactive skill map','Interactieve vaardighedenkaart')},touchStage);atlasHint.after(families,touchStage);
let touchFamily='a',touchIndex=0;
const touchPoints=[[95,225],[110,100],[300,45],[490,100],[505,225]];
function drawTouch(key,index=0){
 touchFamily=key;touchIndex=index;touchStage.style.setProperty('--accent',groups[key].color);families.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.family===key)));touchSvg.replaceChildren();Object.entries(groups).forEach(([k,g],i)=>{svgNode('ellipse',{cx:300,cy:190,rx:195,ry:80,transform:`rotate(${i*28-42} 300 190)`,class:'touch-orbit',style:`stroke:${g.color};opacity:${k===key ? .7 : .12}`},touchSvg);});svgNode('path',{d:curve([...touchPoints,[300,325],touchPoints[0]]),class:'touch-route'},touchSvg);svgNode('circle',{cx:300,cy:202,r:65,class:'touch-core'},touchSvg);
 const center=svgNode('text',{x:300,y:180,'text-anchor':'middle',class:'touch-core-label'},touchSvg);['Problem','↓ System','↓ Prototype'].forEach((line,i)=>{const span=svgNode('tspan',{x:300,dy:i?23:0},center);span.textContent=line;});
 groups[key].items.forEach((item,i)=>{const [x,y]=touchPoints[i],station=svgNode('g',{role:'button',tabindex:0,'aria-label':item[0],'aria-pressed':String(i===index),class:'touch-station','data-index':i},touchSvg);svgNode('circle',{cx:x,cy:y,r:37,class:'touch-hit'},station);svgNode('circle',{cx:x,cy:y,r:18,class:'touch-dot'},station);const number=svgNode('text',{x,y:y+6,'text-anchor':'middle',class:'touch-number'},station);number.textContent=i+1;const text=svgNode('text',{x,y:y+49,'text-anchor':'middle',class:'touch-label'},station);labelLines(text,item[0],18);const select=()=>choose(key,i);station.addEventListener('click',select);station.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});});
}
Object.entries(groups).forEach(([key,group],i)=>{const button=document.createElement('button');button.dataset.family=key;button.style.setProperty('--accent',group.color);const number=document.createElement('small');number.textContent='0'+(i+1);button.append(number,document.createTextNode(group.name));button.addEventListener('click',()=>choose(key,0));families.append(button);});
const sourceChoose=choose;
choose=function(key,index){sourceChoose(key,index);const focused=document.activeElement?.getAttribute('data-index');drawTouch(key,index);if(focused!==null&&focused!==undefined)touchSvg.querySelector(`[data-index="${index}"]`)?.focus({preventScroll:true});parent.postMessage({type:'whoami:skill-select',skill:groups[key].items[index][0],family:groups[key].name},location.origin);};
drawTouch('a');const mobileQuery=matchMedia('(max-width:1000px)');if(mobileQuery.matches)sourceChoose('a',0);mobileQuery.addEventListener('change',event=>{if(event.matches)sourceChoose(touchFamily,touchIndex);});
document.querySelectorAll('.mobile-panels button').forEach(button=>{button.textContent=button.dataset.panel==='skills'?atlasCopy('Compétences','Capabilities','Vaardigheden'):atlasCopy('Outils & logos','Toolkit & logos','Tools & logo’s');});
let atlasLastHeight=0;const reportHeight=()=>{if(!mobileQuery.matches)return;const height=Math.ceil(atlasMain.getBoundingClientRect().height);if(height!==atlasLastHeight){atlasLastHeight=height;parent.postMessage({type:'whoami:atlas-height',height},location.origin);}};new ResizeObserver(reportHeight).observe(atlasMain);
// Vertical gestures move the page; choosing a node never jumps its scroll.
let atlasTouch=null,atlasTouchUsed=false,atlasLastWheel=0;
addEventListener('wheel',event=>{if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;event.preventDefault();const now=performance.now(),quiet=now-atlasLastWheel;atlasLastWheel=now;if(quiet>200&&Math.abs(event.deltaY)>15)parent.postMessage({type:'whoami:atlas-navigate',direction:Math.sign(event.deltaY)},location.origin);},{passive:false});
addEventListener('touchstart',event=>{atlasTouch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;atlasTouchUsed=false;},{passive:true});
addEventListener('touchmove',event=>{if(!atlasTouch||event.touches.length!==1)return;const dx=atlasTouch.x-event.touches[0].clientX,dy=atlasTouch.y-event.touches[0].clientY;if(Math.abs(dx)>Math.abs(dy))return;if(event.cancelable)event.preventDefault();if(!atlasTouchUsed&&Math.abs(dy)>36){atlasTouchUsed=true;parent.postMessage({type:'whoami:atlas-navigate',direction:Math.sign(dy)},location.origin);}},{passive:false});
