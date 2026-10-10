import test from 'node:test';
import assert from 'node:assert/strict';
import { sceneDestination,travelEase } from '../src/lib/sceneTravel.js';
import { methodCardFocus } from '../src/lib/scrollStory.js';
import { activeMilliseconds,analyticsUrl,validConsent,installAnalytics,setAnalyticsConsent,track,measurementId } from '../src/lib/analytics.js';

test('scene navigation reads tall content, advances one stop and reverses without skipping',()=>{
 const stops=[{top:0,end:0},{top:800,end:1800},{top:2600,end:2600}];
 assert.equal(sceneDestination(stops,0,800,1),800);
 assert.equal(sceneDestination(stops,800,800,1),1328);
 assert.equal(sceneDestination(stops,1700,800,1),1800);
 assert.equal(sceneDestination(stops,1800,800,1),2600);
 assert.equal(sceneDestination(stops,2600,800,-1),1800);
 assert.equal(sceneDestination(stops,1328,800,-1),800);
 assert.equal(sceneDestination(stops,800,800,-1),0);
 assert.equal(sceneDestination(stops,0,800,-1),null);
 assert.equal(sceneDestination(stops,2600,800,1),null);
 assert.equal(sceneDestination([],0,800,1),null);
});
test('travel is monotonic, has no overshoot, and slows at both ends',()=>{
 assert.equal(travelEase(0),0);assert.equal(travelEase(1),1);
 for(let i=1;i<=100;i++)assert.ok(travelEase(i/100)>=travelEase((i-1)/100));
 assert.ok(travelEase(.01)<.0001);assert.ok(1-travelEase(.99)<.0001);
});
test('method hands emphasis over at the middle of its progress bar, in both directions',()=>{
 for(let from=0;from<4;from++){
  assert.equal(methodCardFocus(from,from),1);
  assert.equal(methodCardFocus(from+.25,from),.5);
  assert.equal(methodCardFocus(from+.25,from+1),0);
  assert.equal(methodCardFocus(from+.5,from),0);
  assert.equal(methodCardFocus(from+.5,from+1),0);
  assert.equal(methodCardFocus(from+.75,from),0);
  assert.equal(methodCardFocus(from+.75,from+1),.5);
  assert.equal(methodCardFocus(from+1,from+1),1);
 }
});
test('engagement excludes hidden tabs, idle time, travel and clock suspension',()=>{
 const values={now:10000,previous:9000,lastActivity:0,visible:true,focused:true,travelling:false};
 assert.equal(activeMilliseconds(values),1000);
 for(const patch of [{visible:false},{focused:false},{travelling:true}])assert.equal(activeMilliseconds({...values,...patch}),0);
 assert.equal(activeMilliseconds({...values,now:100000,previous:99000}),0);
 assert.equal(activeMilliseconds({...values,now:60500,previous:59500}),500);
 assert.equal(activeMilliseconds({...values,now:100000,previous:99000,playing:true}),1000);
 assert.equal(activeMilliseconds({...values,now:100000,previous:10000,lastActivity:100000}),2000);
});
test('analytics URL keeps safe campaign attribution and strips arbitrary queries, fragments and contact addresses',()=>{
 const base='https://portfolio.example/M-IA/';
 assert.equal(analyticsUrl(base+'?email=private%40example.com&utm_source=linkedin&analytics_debug=1#secret',base,true),base+'?utm_source=linkedin');
 assert.equal(analyticsUrl(base+'?utm_campaign=private%40example.com',base,true),base);
 assert.equal(analyticsUrl('mailto:private@example.com',base),'');
 assert.equal(analyticsUrl('https://github.com/Tom-Buzon/test?token=abc',base),'https://github.com/Tom-Buzon/test');
});
test('consent expires, rejects future or malformed values and preserves an explicit refusal',()=>{
 assert.equal(validConsent({version:1,granted:false,at:100},101),true);
 assert.equal(validConsent({version:1,granted:true,at:100},100+181*86400000),false);
 assert.equal(validConsent({version:1,granted:true,at:100},50),false);
 assert.equal(validConsent({version:1,granted:'true',at:100},101),false);
});
test('Google loads only after consent, once; refusal disables collection and deletes its cookies',()=>{
 const names=['window','document','location','localStorage','history','innerHeight'],saved=new Map(names.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 const store=new Map(),scripts=[],commands=[],win=new EventTarget(),doc=new EventTarget();let reloads=0;
 Object.assign(doc,{referrer:'https://www.linkedin.com/feed/?private=secret',body:{dataset:{locale:'fr'}},hidden:false,cookie:'_ga=abc; _ga_WWE69VZ1KD=def',title:'Portfolio',hasFocus:()=>true,querySelector:()=>null,querySelectorAll:()=>[],head:{append:node=>scripts.push(node)},createElement:()=>({dataset:{}})});
 Object.assign(win,{dataLayer:{push:command=>commands.push([...command])}});
 const loc=new URL('https://portfolio.example/M-IA/');loc.reload=()=>reloads++;
 for(const [key,value]of Object.entries({window:win,document:doc,location:loc,history:{state:{}},innerHeight:800,localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)}}))Object.defineProperty(globalThis,key,{configurable:true,value});
 let stop;
 try{
  stop=installAnalytics({production:true});track('project_open',{project_id:'mnememind'});assert.equal(scripts.length,0);assert.equal(commands.length,0);
  setAnalyticsConsent(false);assert.equal(scripts.length,0);
  setAnalyticsConsent(true);assert.equal(scripts.length,1);assert.match(scripts[0].src,/G-WWE69VZ1KD/);
  const config=commands.find(row=>row[0]==='config');assert.equal(config[2].send_page_view,false);assert.equal(config[2].allow_google_signals,false);
  assert.equal(commands.filter(row=>row[1]==='page_view').length,1);
  setAnalyticsConsent(true);assert.equal(scripts.length,1);
  track('project_open',{project_id:'mnememind'});assert.equal(commands.at(-1)[1],'project_open');
  setAnalyticsConsent(false);assert.equal(win['ga-disable-'+measurementId],true);assert.equal(reloads,1);const count=commands.length;track('project_open',{});assert.equal(commands.length,count);
 }finally{stop?.();for(const key of names){const descriptor=saved.get(key);if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
