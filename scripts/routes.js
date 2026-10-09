import { projects } from '../src/content/projects.js';
export const languages=['fr','en','nl'];
export const routes=[
  {page:'whoami',path:'',project:'',anchor:''},
  ...projects.map(project=>({page:'whoami',path:`work/${project.id}/`,project:project.id,anchor:''})),
  {page:'whoami',path:'work/blender/',project:'',anchor:'explorations'},
  {page:'whoami',path:'agence/',project:'',anchor:'profile'},
  {page:'whoami',path:'portfolio/',project:'',anchor:'work'},
];
export const directory=(locale,route)=>(locale==='fr'?'':locale+'/')+route.path;
