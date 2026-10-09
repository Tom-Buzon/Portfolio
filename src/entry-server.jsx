import { renderToString } from 'react-dom/server';
import App from './App.jsx';
export function render(_page,locale='fr',project='',anchor='') { return renderToString(<App locale={locale} project={project} anchor={anchor} />); }
