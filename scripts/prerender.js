import { createServer } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import { languages, routes, directory } from './routes.js';
const vite=await createServer({mode:'production',server:{middlewareMode:true},appType:'custom'});
try{
  const {render}=await vite.ssrLoadModule('/src/entry-server.jsx');
  for(const locale of languages)for(const route of routes){
    const path='dist/'+directory(locale,route)+'index.html';
    const html=await readFile(path,'utf8');
    await writeFile(path,html.replace('<div id="root"></div>','<div id="root">'+render(route.page,locale,route.project,route.anchor)+'</div>'));
  }
  await writeFile('dist/.nojekyll','');
  console.log(`Pre-rendered ${languages.length*routes.length} documents, including direct project URLs.`);
}finally{await vite.close();}
