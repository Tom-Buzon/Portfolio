import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { languages, routes, directory } from './routes.js';
import { projects } from '../src/content/projects.js';
import { copy, localize } from '../src/content/copy.js';
const media=JSON.parse(await readFile('src/content/media.json','utf8'));
const site=(process.env.SITE_URL || 'https://tom-buzon.github.io/M-IA/').replace(/\/?$/,'/');
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const locale of languages)for(const route of routes){
  const c=localize(copy,locale),project=localize(projects.find(p=>p.id===route.project),locale);
  const title=project?`${project.name} — Tom Buzon`:`Tom Buzon — ${c.identity}`;
  const description=project?project.lead:c.heroBody;
  const dir=directory(locale,route),canonicalRoute=route.anchor?{...route,path:''}:route;
  const canonical=new URL(directory(locale,canonicalRoute),site).href;
  const selected=project?.defaultMedia && media[project.defaultMedia];
  const imagePath=selected?.variants?.at(-1)?.src || (project?.id==='blender'?'/images/blender-room.webp':'/images/attic-studio.webp');
  const image=new URL(imagePath.slice(1),site).href;
  const author={'@type':'Person',name:'Tom Buzon',url:site,sameAs:['https://www.linkedin.com/in/tom-buzon-93833b229/']};
  const schema=project?{'@context':'https://schema.org','@type':'CreativeWork',name:project.name,description,inLanguage:locale,url:canonical,author,image}:{'@context':'https://schema.org','@type':'ProfilePage',name:title,description,inLanguage:locale,url:canonical,mainEntity:author};
  const alternates=languages.map(lang=>`<link rel="alternate" hreflang="${lang}" href="${new URL(directory(lang,canonicalRoute),site).href}" />`).join('');
  if(dir)await mkdir(dir,{recursive:true});
  await writeFile(dir+'index.html',`<!doctype html>
<html lang="${locale}"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="theme-color" content="#090e15" /><link rel="icon" type="image/svg+xml" href="/favicon.svg" /><title>${escape(title)}</title><meta name="description" content="${escape(description)}" /><link rel="canonical" href="${canonical}" />${alternates}<link rel="alternate" hreflang="x-default" href="${new URL(canonicalRoute.path,site).href}" /><meta property="og:type" content="website" /><meta property="og:locale" content="${{fr:'fr_FR',en:'en_GB',nl:'nl_NL'}[locale]}" /><meta property="og:site_name" content="Tom Buzon" /><meta property="og:title" content="${escape(title)}" /><meta property="og:description" content="${escape(description)}" /><meta property="og:url" content="${canonical}" /><meta property="og:image" content="${image}" /><meta name="twitter:card" content="summary_large_image" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />${!project?'<link rel="preload" as="image" href="/images/attic-studio.webp" />':''}<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script></head><body data-page="whoami" data-locale="${locale}" data-project="${route.project}" data-anchor="${route.anchor}"><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`);
}
console.log('Prepared personal portfolio entries and project URLs in three languages.');
