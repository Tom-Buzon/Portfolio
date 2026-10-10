export const measurementId='G-WWE69VZ1KD';
export const consentKey='whoami:analytics-consent:v1';
const consentAge=180*86400000;
export const validConsent=(value,now=Date.now())=>value?.version===1&&typeof value.granted==='boolean'&&Number.isFinite(value.at)&&now>=value.at&&now-value.at<consentAge;
export function readConsent(){try{const value=JSON.parse(localStorage.getItem(consentKey));return validConsent(value)?value.granted:null;}catch{return null;}}
export function analyticsUrl(raw,base,keepCampaign=false){
  try{const url=new URL(raw,base);if(!['https:','http:'].includes(url.protocol))return '';const query=new URLSearchParams();
    if(keepCampaign)for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']){const value=url.searchParams.get(key);if(value&&/^[\w .-]{1,80}$/.test(value))query.set(key,value);}
    return url.origin+url.pathname+(query.size?'?'+query:'');
  }catch{return '';}
}
// Foreground time only; a long idle tab or animation is not reading time.
export function activeMilliseconds({now,previous,lastActivity,visible,focused,travelling,playing=false}){
  if(!visible||!focused||travelling)return 0;
  const start=Math.max(previous,now-2000),end=playing?now:Math.min(now,lastActivity+60000);
  return Math.max(0,end-start);
}
let send=()=>{};
export function track(name,params={}){send(name,params);}
export function setAnalyticsConsent(granted){
  try{localStorage.setItem(consentKey,JSON.stringify({version:1,granted,at:Date.now()}));}catch{/* Apply the choice for this page even if storage is unavailable. */}
  window.dispatchEvent(new CustomEvent('whoami:consent',{detail:granted}));
}

export function installAnalytics({production=import.meta.env?.PROD}={}){
  const local=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)||!production;
  const debug=new URLSearchParams(location.search).get('analytics_debug')==='1';
  let allowed=readConsent()===true,loaded=false,route='',viewedProject='',referrer=analyticsUrl(document.referrer,location.href),current=null,candidate='',candidateAt=0,lastActivity=performance.now(),previous=lastActivity,activeMs=0,lastFlush=lastActivity;
  const progress=new Set(),seenScenes=new Set(),videoProgress=new WeakMap(),diagnostics=[];
  const context=()=>{
    const visit=document.querySelector('.project-visit');
    if(visit){const step=visit.querySelector('.visit-step.is-current');return {page_kind:'project',project_id:visit.dataset.project,scene_id:visit.dataset.exitProgress>0?'return':'project_step',chapter_id:step?.dataset.chapterId||'',step_index:Number(step?.dataset.visitStep||0)+1,media_id:step?.dataset.mediaId||'diagram'};}
    const scenes=[...document.querySelectorAll('.general-visit [data-tour-scene]')].filter(node=>node.offsetHeight);let selected=scenes[0];for(const node of scenes)if(node.getBoundingClientRect().top<=innerHeight*.4)selected=node;
    const room=selected?.classList.contains('room-threshold');
    return {page_kind:'tour',scene_id:selected?.dataset.tourScene||'top',project_id:room?selected.id:'none',...(room?{scene_phase:selected.querySelector('.room-card-scene').getBoundingClientRect().top<=innerHeight*.4?'invitation':'title'}:{}),...(selected?.id==='approach'?{step_index:Number(selected.dataset.methodStep)+1}:{})};
  };
  function emit(name,params={}){
    if(!allowed)return;
    const payload={site_language:document.body.dataset.locale||'fr',...params};
    if(local||debug){diagnostics.push({event:name,...payload});if(diagnostics.length>120)diagnostics.shift();const output=document.getElementById('analytics-diagnostics');if(output)output.textContent=JSON.stringify(diagnostics,null,2);}
    if(!local&&loaded)window.gtag('event',name,{...payload,send_to:measurementId,...(debug?{debug_mode:true}:{})});
  }
  function flush(reason){if(current&&activeMs>=100){emit('content_engagement',{...current,active_seconds:Math.round(activeMs)/1000,engagement_reason:reason});activeMs=0;}lastFlush=performance.now();}
  function page(){
    const next=analyticsUrl(location.href,location.href,true),key=location.pathname;if(key===route)return;
    flush('route_change');const oldProject=viewedProject;
    if(oldProject)emit('project_close',{project_id:oldProject,step_index:current?.step_index||1});
    route=key;current=null;candidate='';
    emit('page_view',{page_location:next,page_referrer:referrer,page_title:document.title});referrer=next;
    const project=document.querySelector('.project-visit')?.dataset.project;viewedProject=project||'';if(project)emit('project_open',{project_id:project,entry_method:oldProject?'project_navigation':document.referrer||history.state?.whoamiFromVisit?'navigation':'direct'});
    for(const key of progress)if(key.startsWith('project'))progress.delete(key);
  }
  function load(){
    if(!allowed)return;
    if(!local&&!loaded){
      window['ga-disable-'+measurementId]=false;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
      window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      window.gtag('js',new Date());
      window.gtag('config',measurementId,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:180*86400,cookie_update:false,page_location:analyticsUrl(location.href,location.href,true),page_referrer:referrer,...(debug?{debug_mode:true}:{})});
      const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+measurementId;script.dataset.portfolioAnalytics='true';document.head.append(script);loaded=true;
    }
    route='';current=null;candidate='';lastActivity=previous=performance.now();page();
  }
  function consent(event){
    const wasAllowed=allowed;allowed=event.detail===true;if(allowed&&!wasAllowed)load();
    if(!allowed){activeMs=0;current=null;candidate='';progress.clear();seenScenes.clear();
      if(loaded){window['ga-disable-'+measurementId]=true;window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});}
      const domains=[location.hostname,...location.hostname.split('.').map((_,i,array)=>'.'+array.slice(i).join('.'))];
      for(const part of document.cookie.split(';')){const name=part.trim().split('=')[0];if(!/^_ga(?:_|$)/.test(name))continue;document.cookie=name+'=; Max-Age=0; Path=/';for(const domain of domains)document.cookie=name+'=; Max-Age=0; Path=/; Domain='+domain;}
      // Unload Google's own automatic listeners as well as our custom events.
      if(loaded)location.reload();
    }
  }
  const activity=()=>{lastActivity=performance.now();};
  const keyFor=value=>JSON.stringify(value);
  function tick(){
    const now=performance.now(),travelling=document.documentElement.dataset.travelling==='true';
    if(!allowed){previous=now;return;}
    const visible=!document.hidden,focused=document.hasFocus(),playing=[...document.querySelectorAll('.project-visit video')].some(video=>!video.paused&&!video.ended);
    if(current)activeMs+=activeMilliseconds({now,previous,lastActivity,visible,focused,travelling,playing});previous=now;
    if(!visible||travelling){candidate='';return;}
    const value=context(),key=keyFor(value);
    if(key!==candidate){candidate=key;candidateAt=now;}
    if(now-candidateAt>=600&&key!==keyFor(current)){
      flush('scene_change');current=value;
      emit(value.page_kind==='project'?'project_step_view':'scene_view',value);
      if(value.page_kind==='tour'){
        seenScenes.add(value.scene_id);const nodes=[...document.querySelectorAll('.general-visit [data-tour-scene]')],at=nodes.findIndex(node=>node.dataset.tourScene===value.scene_id),percent=Math.round(at/Math.max(1,nodes.length-1)*100);
        for(const mark of [25,50,75,100])if(percent>=mark&&!progress.has('tour'+mark)){progress.add('tour'+mark);emit('tour_progress',{percent:mark,scene_id:value.scene_id,scenes_viewed:seenScenes.size});}
        if(value.scene_id==='contact'&&!progress.has('bottom')){progress.add('bottom');emit('site_bottom',{scene_id:'contact',scenes_viewed:seenScenes.size});}
      }
    }
    if(current?.page_kind==='project'){
      const steps=[...document.querySelectorAll('.visit-step')],node=steps[current.step_index-1],readToEnd=node&&node.getBoundingClientRect().bottom<=innerHeight+10;
      const percent=Math.floor((current.step_index-(readToEnd?0:1))/Math.max(1,steps.length)*100);
      for(const mark of [25,50,75,100])if(percent>=mark&&!progress.has('project'+mark)){progress.add('project'+mark);emit('project_progress',{project_id:current.project_id,percent:mark});if(mark===100)emit('project_complete',{project_id:current.project_id});}
    }
    if(now-lastFlush>=15000)flush('heartbeat');
  }
  function click(event){
    const target=event.target.closest?.('a,button,summary');if(!target)return;
    const ctx=context(),link=target.closest('a');
    if(link){const url=new URL(link.href,location.href);
      if(url.protocol==='mailto:')emit('contact_click',{...ctx,contact_method:'email'});
      else if(url.hostname==='www.linkedin.com')emit('contact_click',{...ctx,contact_method:'linkedin'});
      else if(url.pathname.includes('/reports/sft/'))emit('resource_click',{...ctx,resource_type:'sft_report'});
      else if(url.hostname==='github.com')emit('resource_click',{...ctx,resource_type:'github',link_url:analyticsUrl(url.href,location.href)});
      else if(url.origin!==location.origin)emit('outbound_click',{...ctx,link_url:analyticsUrl(url.href,location.href)});
    }
    if(target.matches('.chapter-image'))emit('media_expand',{...ctx,media_id:target.dataset.mediaId||ctx.media_id});
    if(target.matches('.scene-nav-panel a,.scene-rail-node'))emit('contents_select',{...ctx,destination:target.dataset.destination||'unknown'});
    if(target.matches('.career-open'))emit('background_open',{scene_id:'approach'});
    if(target.matches('.exploration-list summary'))emit('exploration_toggle',{exploration_name:target.querySelector('h3')?.textContent,expanded:!target.parentElement.open});
    if(target.matches('.language-switch a')&&target.lang!==document.body.dataset.locale)emit('language_change',{...ctx,target_language:target.lang});
  }
  function video(event){
    const node=event.target;if(node.tagName!=='VIDEO')return;
    const ctx={...context(),media_id:node.dataset.mediaId||'video'};let state=videoProgress.get(node);if(!state){state={seen:new Set(),last:node.currentTime,watched:0};videoProgress.set(node,state);}
    if(event.type==='play'){activity();emit(state.seen.has('start')?'video_resume':'video_start',ctx);state.seen.add('start');state.last=node.currentTime;}
    if(event.type==='pause'&&!node.ended)emit('video_pause',{...ctx,video_seconds:Math.round(node.currentTime)});
    if(event.type==='timeupdate'&&!node.seeking&&!node.paused){const delta=node.currentTime-state.last;if(delta>0&&delta<2)state.watched+=delta;state.last=node.currentTime;const percent=state.watched/node.duration*100;for(const mark of [25,50,75])if(percent>=mark&&!state.seen.has(mark)){state.seen.add(mark);emit('video_progress',{...ctx,percent:mark});}}
    if(event.type==='seeked')state.last=node.currentTime;
    if(event.type==='ended')emit('video_complete',{...ctx,watched_seconds:Math.round(state.watched)});
  }
  const atlas=event=>{if(event.origin!==location.origin||event.source!==document.querySelector('.original-atlas')?.contentWindow||event.data?.type!=='whoami:skill-select')return;activity();emit('skill_select',{skill_name:String(event.data.skill).slice(0,80),skill_family:String(event.data.family).slice(0,80)});};
  const leave=()=>{tick();flush(document.hidden?'hidden':'page_exit');};
  const routeChange=()=>{setTimeout(page,0);};
  const events=['pointerdown','keydown','wheel','touchstart','scroll'];events.forEach(type=>window.addEventListener(type,activity,{passive:true}));
  const videos=['play','pause','ended','timeupdate','seeked'];videos.forEach(type=>document.addEventListener(type,video,true));
  window.addEventListener('whoami:consent',consent);window.addEventListener('whoami:route',routeChange);window.addEventListener('message',atlas);window.addEventListener('pagehide',leave);document.addEventListener('visibilitychange',leave);document.addEventListener('click',click,true);
  send=(name,params)=>emit(name,{...context(),...params});load();const interval=setInterval(tick,500);
  return()=>{flush('dispose');clearInterval(interval);events.forEach(type=>window.removeEventListener(type,activity));videos.forEach(type=>document.removeEventListener(type,video,true));window.removeEventListener('whoami:consent',consent);window.removeEventListener('whoami:route',routeChange);window.removeEventListener('message',atlas);window.removeEventListener('pagehide',leave);document.removeEventListener('visibilitychange',leave);document.removeEventListener('click',click,true);send=()=>{};};
}
