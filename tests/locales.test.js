import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { readFile, access } from 'node:fs/promises';
import { languages,routes,directory } from '../scripts/routes.js';
import { projects } from '../src/content/projects.js';

test('language routing preserves anchors and data identifiers',async()=>{
 const vite=await createServer({configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true},appType:'custom'});
 try{
  const {translate,localeUrl,localizeData}=await vite.ssrLoadModule('/src/i18n/core.js');
  assert.equal(localeUrl('/agence/#brief','nl'),'/nl/agence/#brief');
  assert.equal(localeUrl('/en/portfolio/','fr'),'/portfolio/');
  assert.equal(localeUrl('https://example.com/','nl'),'https://example.com/');
  assert.equal(translate('L’agence','en'),'The studio');
  assert.equal(translate('Une idée','nl'),'Een idee');
  assert.equal(translate(' Votre besoin ','en'),' Your need ');
  assert.deepEqual(localizeData({id:'Contexte',title:'Contexte'},'en'),{id:'Contexte',title:'Context'});
 }finally{await vite.close();}
});

test('project-site routes, language switches and runtime textures retain the deployment prefix',async()=>{
 const vite=await createServer({configFile:false,optimizeDeps:{noDiscovery:true,include:[]},base:'/M-IA/',server:{middlewareMode:true},appType:'custom'});
 try{
  const {localeUrl}=await vite.ssrLoadModule('/src/i18n/core.js');
  const {publicUrl}=await vite.ssrLoadModule('/src/lib/publicUrl.js');
  assert.equal(localeUrl('/agence/#brief','nl'),'/M-IA/nl/agence/#brief');
  assert.equal(localeUrl('/M-IA/en/portfolio/#vesper','fr'),'/M-IA/portfolio/#vesper');
  assert.equal(localeUrl('/','en'),'/M-IA/en/');
  assert.equal(localeUrl('#methode','nl'),'#methode');
  assert.equal(localeUrl('https://example.com/','en'),'https://example.com/');
  assert.equal(publicUrl('/images/vesper.webp'),'/M-IA/images/vesper.webp');
  assert.equal(publicUrl('/M-IA/images/vesper.webp'),'/M-IA/images/vesper.webp');
  assert.equal(publicUrl('//example.com/image.webp'),'//example.com/image.webp');
 }finally{await vite.close();}
});

test('all 33 personal portfolio entries preserve assets, project links, languages and canonical URLs',async t=>{
 try{await access('dist/nl/portfolio/index.html');}catch{t.skip('Run npm run build first to verify generated documents.');return;}
 const home=await readFile('dist/index.html','utf8');
 const base=home.match(/src="([^"]*\/)assets\/[^"/]+\.js"/)?.[1];
 assert.ok(base,'HTML must reference compiled JavaScript, not /src/main.jsx');
 for(const locale of languages)for(const route of routes){
   const html=await readFile('dist/'+directory(locale,route)+'index.html','utf8');
   assert.match(html,new RegExp('<html lang="'+locale+'"'));
   assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
   assert.match(html,/hreflang="fr"/);assert.match(html,/hreflang="en"/);assert.match(html,/hreflang="nl"/);
   assert.match(html,/<link rel="canonical" href="https:\/\/[^"]+"/);
   assert.ok(!html.includes('chat-launcher'));
   assert.ok(!html.includes('Attic Factory'));
   if(route.project){
     assert.match(html,new RegExp('id="'+route.project+'-detail" tabindex="-1"'));
     assert.match(html,/class="visit-return"/);
     assert.ok(html.includes(projects.find(p=>p.id===route.project).name));
   }else{
     let previous=-1;
     for(const project of projects){const position=html.indexOf('id="'+project.id+'"');assert.ok(position>previous);previous=position;}
   }
   for(const [,url] of html.matchAll(/(?:href|src)="(\/[^"#?]*)[^" ]*"/g)){
     if(url.startsWith('//'))continue;
     assert.ok(url.startsWith(base),`Unprefixed URL: ${url}`);
     const file=url.slice(base.length);
     await access('dist/'+file+(file.endsWith('/')||!file?'index.html':''));
   }
 }
 if(base==='/M-IA/'){
   assert.ok(!home.includes('chat-launcher'),'the static demo must not offer the unavailable API');
   await access('dist/.nojekyll');
 }
});

test('project sources preserve all media, scope distinctions and stable identifiers in every language',async()=>{
 const {localize}=await import('../src/content/copy.js');
 const media=JSON.parse(await readFile('src/content/media.json','utf8'));
 assert.equal(projects.find(p=>p.id==='mnememind').groups.flatMap(g=>g.media).length,12);
 assert.equal(projects.find(p=>p.id==='atticagentwatcher').groups.flatMap(g=>g.media).length,5);
 assert.deepEqual(projects.slice(-2).map(p=>p.id),['vesper','hoplites']);
 assert.equal(projects[1].id,'atticagentwatcher');
 for(const locale of languages){
   const localized=localize(projects,locale);
   assert.deepEqual(localized.map(p=>p.id),projects.map(p=>p.id));
   for(const project of localized){
     assert.equal(typeof project.title,'string');assert.equal(project.story.length,4);
     for(const item of project.groups.flatMap(g=>g.media)){
       for(const variant of media[item.id]?.variants||[{src:item.src}])await access('public'+variant.src);
     }
   }
 }
 assert.equal(media.hoplites.start,43);assert.equal(media.hoplites.duration,65);
 for(const item of Object.values(media)){if(item.poster)await access('public'+item.poster);}
});

test('every source capture and video belongs to a readable chapter and Blender is retired',async()=>{
 const {projectChapters}=await import('../src/content/projectChapters.js');
 const {localize}=await import('../src/content/copy.js');
 assert.equal(projects.some(project=>project.id==='blender'),false);
 for(const locale of languages)for(const project of localize(projects,locale)){
   const chapters=projectChapters(project,locale), represented=new Set(chapters.flatMap(chapter=>chapter.items.map(item=>item.id)));
   const supplied=[...project.groups.flatMap(group=>group.media),...(project.videos||[])];
   supplied.forEach(item=>assert.ok(represented.has(item.id),`${item.id} must remain reachable in ${locale}`));
   for(const chapter of chapters){assert.ok(chapter.title&&chapter.screen&&(chapter.body.length||chapter.evidence?.length));assert.ok(chapter.items.length||chapter.graphic);chapter.body.forEach(body=>assert.equal(typeof body,'string'));}
   if(project.id==='car-ai')assert.equal(chapters.length,2);
   if(project.id==='sft')assert.deepEqual(chapters.flatMap(chapter=>chapter.evidence),[0,1,2,3,4,5,6,7,8]);
 }
});

test('embedded skill atlas retains the original complete station data and logo mappings',async()=>{
 const source=(await readFile('docs/portfolio-materials/sources/skill-map/index (6).html','utf8')).replace(/\r\n/g,'\n');
 const adapted=(await readFile('public/atlas/index.html','utf8')).replace(/\r\n/g,'\n');
 for(const [start,end] of [['const groups=','const svgNS='],['const toolLogoSlugs=','function mark(']]){
   const original=source.slice(source.indexOf(start),source.indexOf(end));
   assert.ok(original.length>100);assert.ok(adapted.includes(original));
 }
 assert.match(adapted,/id="station-select"/);assert.match(adapted,/TOM \/ CAPABILITY ATLAS/);
 const slugs=[...new Set([...source.matchAll(/:'([a-z0-9-]+\/[a-z0-9-]+)'/g)].map(match=>match[1]))];
 for(const slug of slugs)assert.match(await readFile('public/atlas/logos/'+slug.replaceAll('/','--')+'.svg','utf8'),/<svg/);
});

test('screen projection maps every corner correctly for angled and portrait media',async()=>{
 const vite=await createServer({configFile:false,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true},appType:'custom'});
 try{
  const {quadMatrix}=await vite.ssrLoadModule('/src/scene/gallery.js');
  for(const [width,height] of [[960,540],[360,640]]){
   const points=[{x:210,y:120},{x:890,y:170},{x:850,y:560},{x:240,y:600}];
   const m=quadMatrix(points,width,height);
   [[0,0],[width,0],[width,height],[0,height]].forEach(([x,y],i)=>{
    const w=m[3]*x+m[7]*y+m[15];
    assert.ok(Math.abs((m[0]*x+m[4]*y+m[12])/w-points[i].x)<1e-7);
    assert.ok(Math.abs((m[1]*x+m[5]*y+m[13])/w-points[i].y)<1e-7);
   });
  }
  assert.equal(quadMatrix(Array(4).fill({x:0,y:0}),960,540),null);
 }finally{await vite.close();}
});
