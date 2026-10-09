import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import { languages, routes, directory } from './scripts/routes.js';
const input={};
for(const locale of languages)for(const route of routes){
  input[locale+'-'+(route.project||route.anchor||'home')]=fileURLToPath(new URL('./'+directory(locale,route)+'index.html',import.meta.url));
}
export default defineConfig({
  base:process.env.SITE_BASE || '/',plugins:[react()],
  build:{rollupOptions:{input}},
  server:{proxy:{'/api':'http://127.0.0.1:3001'}},
  preview:{proxy:{'/api':'http://127.0.0.1:3001'}},
});
