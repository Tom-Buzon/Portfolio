import PropTypes from 'prop-types';
import { useLocale } from '../i18n/Locale';
import { L,localize } from '../content/copy';
import { roomNames } from '../content/projectChapters';
import { plainClick } from '../lib/navigation';
import { Capture } from './ProjectMedia';
import media from '../content/media.json';
import { publicUrl } from '../lib/publicUrl';

export default function ProjectStage({project,number,onOpen}) {
  const {locale,url}=useLocale(), l=value=>localize(value,locale);
  const images=project.groups.flatMap(group=>group.media), cover=images.find(item=>item.id===project.defaultMedia)||images[0];
  const video=project.videos?.[0];
  return <article id={project.id} className={'room-threshold threshold-'+project.id} style={{'--project-color':project.color}} data-scene-stop={project.station} data-scene-hold data-scene-view>
    <div className="threshold-copy">
      <p className="overline"><span>{String(number).padStart(2,'0')} / 07</span> {l(roomNames[project.id])}</p>
      <p className="threshold-name">{project.name}</p>
      <h2>{project.title}</h2>
      <p className="threshold-lead">{project.lead}</p>
      <span className="project-status"><i />{project.status}</span>
      <a className="button button-light room-enter" href={url(`/work/${project.id}/`)} onClick={event=>{if(plainClick(event)){event.preventDefault();onOpen(event);}}}>{l(L('Voir les détails du projet','See project details','Bekijk projectdetails'))}<span>↗</span></a>
      <p className="threshold-direction">{l(L('Continuer la visite en défilant','Scroll to continue the tour','Scroll om de rondleiding te vervolgen'))} ↓</p>
    </div>
    <div className="threshold-fallback" aria-hidden="true">{cover?<Capture item={cover}/>:video?<img src={publicUrl(media[video.id].poster)} alt="" loading="lazy"/>:<span>{project.id==='sft'?'TEXT → QWEN3 → TRIAGE':'CAMERA → INTERPRETATION → MOVEMENT'}</span>}</div>
    <div className="room-floor-label" aria-hidden="true"><span>{String(number).padStart(2,'0')}</span><p>{l(roomNames[project.id])}<small>{project.category}</small></p></div>
  </article>;
}
ProjectStage.propTypes={project:PropTypes.object.isRequired,number:PropTypes.number.isRequired,onOpen:PropTypes.func.isRequired};
