import PropTypes from 'prop-types';
import { useLocale } from '../i18n/Locale';
import { L,localize } from '../content/copy';
import { publicUrl } from '../lib/publicUrl';

const practices={
  mnememind:[L('Conception produit','Product design','Productontwerp'),'RAG',L('Architecture logicielle','Software architecture','Softwarearchitectuur')],
  atticagentwatcher:[L('Observabilité des agents','Agent observability','Agentobservatie'),L('Architecture événementielle','Event architecture','Eventarchitectuur'),'POC → Production'],
  clipgenerator:[L('Pipeline multimédia','Media pipeline','Mediapipeline'),L('Orchestration','Orchestration','Orchestratie'),L('Prototypage','Prototyping','Prototyping')],
  sft:['SFT / DPO',L('Évaluation','Evaluation','Evaluatie'),L('Cadrage IA','AI project framing','AI-projectafbakening')],
  'car-ai':[L('Intégration physique','Physical integration','Fysieke integratie'),'Vision','STT / TTS'],
  vesper:[L('Conception d’expérience','Experience design','Ervaringsontwerp'),L('Guidage sonore','Audio guidance','Audiobegeleiding'),L('Prototypage','Prototyping','Prototyping')],
  hoplites:['IA / LOD',L('Pipeline 3D','3D pipeline','3D-pipeline'),L('Éditeur de niveaux','Level editor','Leveleditor')],
};
const logos={Python:'python--python-original',Electron:'electron--electron-original',Markdown:'markdown--markdown-original',Docker:'docker--docker-original',Godot:'godot--godot-original',Tauri:'tauri--tauri-original',PyTorch:'pytorch--pytorch-original','Raspberry Pi 4':'raspberrypi--raspberrypi-original'};
export default function ProjectSkills({project,compact=false}){
  const {locale}=useLocale(),l=value=>localize(value,locale);
  return <div className={'project-skill-cards'+(compact?' compact':'')}><div><p>{l(L('Compétences mobilisées','Skills in practice','Toegepaste vaardigheden'))}</p><div className="project-skill-tags">{(practices[project.id]||[]).map(item=><span key={l(item)}>{l(item)}</span>)}</div></div><div><p>{l(L('Outils du projet','Project toolkit','Projecttools'))}</p><div className="project-tool-tags">{project.tags.map(tag=><span key={tag}>{logos[tag]?<img src={publicUrl('/atlas/logos/'+logos[tag]+'.svg')} alt="" width="21" height="21"/>:<i aria-hidden="true">{tag.slice(0,2).toUpperCase()}</i>}{tag}</span>)}</div></div></div>;
}
ProjectSkills.propTypes={project:PropTypes.object.isRequired,compact:PropTypes.bool};
