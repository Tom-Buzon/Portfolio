// Authored explanatory graphics for projects without a photograph or screenshot.
// These are diagrams and field notes, never presented as captures of an implementation.
export function paintExhibitPoster(ctx,width,height,id,title) {
  const colors=['#afc8a7','#ddc19d','#beaca5'];
  ctx.fillStyle='#111e26';ctx.fillRect(0,0,width,height);
  ctx.strokeStyle='#abbcad55';ctx.strokeRect(22,22,width-44,height-44);
  ctx.fillStyle='#a8bebd';ctx.font='18px monospace';ctx.fillText(title,48,65);
  const heading=(text,y=140)=>{ctx.fillStyle='#e7dfcc';ctx.font='42px sans-serif';ctx.fillText(text,48,y);};
  const foot=text=>{ctx.fillStyle='#9babae';ctx.font='18px monospace';ctx.fillText(text,48,height-48);};
  function chain(items,y=height*.49){const cell=(width-96)/items.length;items.forEach((text,i)=>{ctx.fillStyle=colors[i%3];ctx.fillRect(48+i*cell,y,cell-18,3);ctx.font='16px monospace';ctx.fillText(String(i+1).padStart(2,'0'),48+i*cell,y+37);ctx.font=items.length>4?'23px sans-serif':'28px sans-serif';ctx.fillStyle='#e2e4d9';ctx.fillText(text,48+i*cell,y+85);});}
  if(id==='sft-main'){heading('Local model. Medical triage.');ctx.fillStyle='#abbfc4';ctx.font='26px monospace';ctx.fillText('TEXT  →  QWEN3 1.7B  →  CATEGORY',48,205);chain(['LOW','MEDIUM','EMERGENCY']);foot('PRE-LABELLED CASES / EDUCATIONAL SCENARIO');}
  else if(id==='sft-training'){heading('Fine-tune on 8 GB.');chain(['Dataset','LoRA / SFT','DPO','FP16']);foot('QWEN3-1.7B-BASE / RTX 4070');}
  else if(id==='sft-results'){heading('Measure the difference.');[['BASE',35.7],['SFT',53.6],['DPO',60.7]].forEach(([name,value],i)=>{const x=80+i*285,barHeight=value*2.7,bottom=height-120;ctx.fillStyle=colors[i];ctx.fillRect(x,bottom-barHeight,225,barHeight);ctx.font='34px sans-serif';ctx.fillText(value+'%',x,bottom-barHeight-18);ctx.font='20px monospace';ctx.fillText(name,x,bottom+33);});foot('28 INTERNAL CASES / EXPLORATORY BENCHMARK');}
  else if(id==='sft-report'){heading('From model to demo.');chain(['Docker','vLLM / CPU','API','Streamlit']);foot('DEPLOYMENT / REPORT / NEXT DECISION');}
  else if(id==='car-ai-main'){heading('A toy. A feedback loop.');chain(['Camera','Interpretation','Movement']);ctx.strokeStyle='#9dbcc4';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(width-100,height*.76);ctx.lineTo(100,height*.76);ctx.lineTo(100,height*.69);ctx.stroke();foot('RASPBERRY PI 4 / CONCEPT DIAGRAM');}
  else if(id==='vesper-intent'){heading('Share an activity.',height*.4);heading('On equal terms.',height*.4+59);ctx.strokeStyle='#aac0b6';ctx.lineWidth=3;for(let i=0;i<55;i++){const h=12+Math.abs(Math.sin(i*1.7))*35;ctx.beginPath();ctx.moveTo(48+i*15,height*.72-h/2);ctx.lineTo(48+i*15,height*.72+h/2);ctx.stroke();}foot('VESPER / A DESIGN EXPLORATION');}
  else if(id==='hoplites-process'){heading('From character to gameplay.');chain(['Concept','Image','3D','Rig','Animation','Game']);foot('CREATIVE PROCESS / INTEGRATION');}
  else {const words=title.split(' ');heading(words.slice(0,3).join(' '),height*.45);if(words.length>3)heading(words.slice(3).join(' '),height*.45+60);foot('TOM BUZON / SELECTED WORK');}
}
