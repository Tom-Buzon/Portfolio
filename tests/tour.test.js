import test from 'node:test';
import assert from 'node:assert/strict';
import { CatmullRomCurve3, Vector3 } from 'three';
import { measureTour, sampleTour, tourRoutes } from '../src/scene/tour.js';
import { roomDestination, visitStops,methodTimeline,visitReturnProgress } from '../src/lib/scrollStory.js';

test('method beats respond continuously, take less than two viewports and reverse cleanly',()=>{
  const height=1000;
  for(let step=0;step<5;step++){
    const start=methodTimeline(step*320,height),halfway=methodTimeline(step*320+160,height);
    assert.equal(start.step,step);assert.equal(halfway.step,step);
    assert.ok(Math.abs(halfway.fill-.5)<1e-8);
  }
  assert.equal(methodTimeline(1600,height).progress,1);
  assert.equal(methodTimeline(750,height).step,2);
  assert.equal(methodTimeline(500,height).step,1);
  assert.equal(methodTimeline(-400,height).arrivalOffset,0);
  assert.ok(methodTimeline(-160,height).arrivalOffset<0);
  assert.equal(methodTimeline(0,height).arrivalOffset,0);
});

test('the project return reveals its intent before completion and can be reversed mid-approach',()=>{
  assert.equal(visitReturnProgress(850,1000),0);
  assert.equal(visitReturnProgress(800,1000),0);
  assert.equal(visitReturnProgress(450,1000),.5);
  assert.equal(visitReturnProgress(100,1000),1);
  assert.equal(visitReturnProgress(900,1000),0);
});

test('the method camera decelerates into its reading pose and accelerates out smoothly',()=>{
  const stops=measureTour([{top:0,height:800,from:0},{top:1200,height:2600,from:1,hold:true,ease:true},{top:4000,height:800,from:2}],1000);
  const arrival=1080;
  const early=sampleTour(stops,arrival-100)-sampleTour(stops,arrival-110);
  const late=sampleTour(stops,arrival)-sampleTour(stops,arrival-10);
  assert.ok(late<early/5);
  assert.equal(sampleTour(stops,1200),1);
  assert.equal(sampleTour(stops,2800),1);
  assert.equal(sampleTour(stops,4000),2);
});

test('a stopped doorway gesture completes toward the intended room, and leaves reading poses alone',()=>{
  const tops=[3000,4200,5500],height=1000;
  assert.equal(roomDestination(tops,3500,height,1),4180);
  assert.equal(roomDestination(tops,3500,height,-1),2980);
  assert.equal(roomDestination(tops,4800,height,1),5480);
  assert.equal(roomDestination(tops,4800,height,-1),4180);
  assert.equal(roomDestination(tops,4080,height,1),null);
  assert.equal(roomDestination(tops,1000,height,1),null);
});

test('a scroll-only project visit reaches every supplied medium and evidence chapter in order',()=>{
  const chapters=[{items:[{id:'a'},{id:'b'},{id:'c'}]},{items:[],graphic:'results'},{items:[{id:'d'}]}];
  assert.deepEqual(visitStops(chapters).map(s=>[s.chapter,s.media,s.item?.id]),[[0,0,'a'],[0,1,'b'],[0,2,'c'],[1,0,undefined],[2,0,'d']]);
});

test('a crossing keeps travelling through its entire visible interval without a dead final screen',()=>{
  const stops=measureTour([{top:0,height:800,from:0},{top:1600,height:600,from:1,to:2},{top:2200,height:1100,from:2}],800);
  const begin=1600-800*.72,end=2200-800*.32;
  let previous=sampleTour(stops,begin);
  for(let y=begin+1;y<end;y+=7){const next=sampleTour(stops,y);assert.ok(next>previous);previous=next;}
  assert.equal(sampleTour(stops,end),2);
  assert.ok(sampleTour(stops,end-80)>1.9);
  assert.equal(sampleTour(stops,-1),0);
  assert.equal(sampleTour(stops,99999),2);
});

test('translated heights and short mobile sections preserve their endpoints and reversible navigation',()=>{
  for(const viewport of [740,844,1080])for(const height of [460,680,950]){
    const stops=measureTour([{top:0,height:900,from:0},{top:1400,height,from:1,to:2},{top:1400+height,height:1800,from:2}],viewport);
    const y=1400+height*.4;
    const expected=sampleTour(stops,y);
    sampleTour(stops,10000);
    assert.equal(sampleTour(stops,y),expected);
    assert.equal(sampleTour(stops,1400+height-viewport*.32),2);
    for(let i=1;i<stops.length;i++){assert.ok(stops[i].y>stops[i-1].y);assert.ok(stops[i].p>=stops[i-1].p);}
  }
});

test('cinematic arcs stay inside the expanded rooms and outside gallery objects, including mobile clearance',()=>{
  for(const [route,stops] of Object.entries(tourRoutes)){
    const curve=new CatmullRomCurve3(stops.map(p=>new Vector3(...p.slice(0,3))),false,'centripetal');
    let distance=0,previous=curve.getPoint(0);
    const samples=stops.length*100;
    for(let i=1;i<=samples;i++){
      const p=curve.getPoint(i/samples);distance+=p.distanceTo(previous);
      assert.ok(p.distanceTo(previous)<.25,'no discontinuous camera segment');previous=p;
      for(const mobile of [false,true]){
        const x=p.x,y=p.y+(mobile?.65:0),z=p.z;
        if(route==='agency'){
          assert.ok(x>-23.4 && x<-4.4 && z>-11.4 && z<5.6);
          // When crossing the old wall, the camera must use the new doorway.
          if(Math.abs(x+8)<.3)assert.ok(z> -7.6 && z<-.1);
        }
        if(route==='portfolio'){
          assert.ok(x>5.5 && x<23.4 && z>-49.4 && z<-4.5);
          for(const exhibitZ of [-18,-27,-37,-45]){
            assert.ok(Math.abs(x-16)>3.35 || Math.abs(z-exhibitZ)>2.55,'camera outside exhibit plinth');
          }
        }
        if(route==='home'){
          assert.ok(x>-7.4 && x<7.7 && z>-59 && z<15);
          for(const stationZ of [0,-14,-28,-42,-54])assert.ok(Math.hypot(x-1.1,z-stationZ)>3,'home arcs clear the workstations');
        }
        if(route==='whoami'){
          assert.ok(x>-23.4&&x<23.4&&z>-86&&z<15);
          if(x<-8)assert.ok(z>-11.5&&z<5.5,'supervision room envelope');
          if(x>8){assert.ok(x<14.2,'gallery route stays in the clear aisle');}
          if(Math.abs(x+8)<.3)assert.ok(z>-7.6&&z<-.1,'use the supervision doorway');
          if(Math.abs(x-8)<.3)assert.ok([[-14,-9],[-33,-25],[-51,-43]].some(([back,front])=>z>back+.2&&z<front-.2),'use an actual opening between rooms');
          if(Math.abs(z+6.5)<.55)assert.ok(x<-1.5||x>6.6,'clear the new welcome bookshelves');
        }
        const ridge=x<-8?-16:x>8?16:0;
        const ceiling=ridge===0?10-Math.abs(x)*5.5/8:9-Math.abs(x-ridge)*4.5/8;
        assert.ok(y<ceiling-.2,`${route} camera below rafters at ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`);
      }
    }
    assert.ok(distance>(route==='agency'?24:45),'keep the original sense of travel');
  }
});

test('optional case-study height extends its own reading pose and preserves subsequent travel',()=>{
  for(const height of [1000,3200,6100])for(const viewport of [720,844,1080]){
    const top=5000,next=top+height;
    const stops=measureTour([{top:top-1000,height:800,from:7.4},{top,height,from:8,hold:true},{top:next,height:1200,from:9,hold:true}],viewport);
    assert.equal(sampleTour(stops,top),8);
    assert.equal(sampleTour(stops,top+height-viewport),8);
    assert.equal(sampleTour(stops,next),9);
    for(let i=1;i<stops.length;i++)assert.ok(stops[i].y>stops[i-1].y&&stops[i].p>=stops[i-1].p);
    const position=top+height/2;const forward=sampleTour(stops,position);sampleTour(stops,next+999);
    assert.equal(sampleTour(stops,position),forward);
  }
});
