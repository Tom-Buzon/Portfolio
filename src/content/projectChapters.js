import { L, localize } from './copy.js';

// One chapter owns prose, media and a physical destination in the same room.
export function projectChapters(project, locale) {
  const l=value=>localize(value,locale), p=project, images=p.groups.flatMap(group=>group.media);
  const chapter=(title,body,items,screen,extra={})=>({title:l(title),body:body.filter(Boolean),items,screen,...extra});
  const text=(fr,en,nl)=>l(L(fr,en,nl));
  switch(p.id) {
    case 'mnememind': return p.groups.map((group,i)=>chapter(group.name,[
      [p.story[0],text('Une même note peut se lire par ses balises, son contexte ou ses connexions.','The same note can be read through its metadata, context or connections.','Dezelfde notitie is via metadata, context of verbanden te lezen.')],
      [p.story[1]],
      [text('Dessiner, relier un diagramme et une transcription, ou explorer la voix : plusieurs formes pour poursuivre la même réflexion.','Draw, connect a diagram and a transcript, or explore voice: different forms for the same train of thought.','Tekenen, diagrammen en transcriptie verbinden of stem verkennen: verschillende vormen voor dezelfde gedachtegang.')],
      [text('Le RAG local utilise Ollama pour les embeddings et le modèle. Les captures rendent visibles le contexte utilisé et la réponse produite.','Local RAG uses Ollama for embeddings and the model. These screenshots expose the context used and the generated response.','Lokale RAG gebruikt Ollama voor embeddings en het model. De beelden tonen de gebruikte context en het gegenereerde antwoord.'),p.story[3]],
    ][i],group.media,['main','calendar','formats','terminal'][i]));
    case 'atticagentwatcher': return [
      chapter(L('Lire l’activité','Read the activity','Activiteit lezen'),[p.story[0]],[images[0]],'main'),
      chapter(L('Comprendre la consommation','Understand usage','Verbruik begrijpen'),[text('Tokens, cache et évolution sur sept jours : rapprocher la consommation de l’activité réelle. Les montants affichés sont des équivalents API estimés.','Tokens, cache and seven-day trends: connect usage to actual activity. Displayed amounts are estimated API equivalents.','Tokens, cache en trends over zeven dagen: verbruik aan activiteit verbinden. Bedragen zijn geschatte API-equivalenten.')],images.slice(1,3),'usage'),
      chapter(L('Rendre le système visible','Make the system visible','Het systeem zichtbaar maken'),[p.story[2]],[images[3]],'factory'),
      chapter(L('Du POC à la collecte fiable','From POC to reliable collection','Van POC naar betrouwbare verzameling'),[p.story[1],p.story[3]],[images[4]],'config'),
    ];
    case 'clipgenerator': return [
      chapter(L('Deux productions','Two outputs','Twee resultaten'),[p.story[0],p.note],p.videos,'clip-one'),
      chapter(L('De l’audio aux scènes','From audio to scenes','Van audio naar scènes'),[p.story[1]],images.slice(0,2),'main'),
      chapter(L('Animer et raconter','Animate and narrate','Animeren en vertellen'),[text('Les cartes de scènes restent ajustables. L’animation et la narration constituent deux étapes distinctes, avec une narration facultative.','Scene cards remain editable. Animation and narration are distinct stages, with narration optional.','Scènekaarten blijven aanpasbaar. Animatie en optionele vertelling zijn afzonderlijke stappen.')],images.slice(2,4),'storyboard'),
      chapter(L('Assembler et vérifier','Assemble and review','Samenstellen en controleren'),[p.story[2],p.story[3]],images.slice(4,6),'edit'),
    ];
    case 'sft': return [
      chapter(L('Cadrer un projet IA','Frame an AI project','Een AI-project afbakenen'),[text('Peut-on spécialiser un petit modèle en local pour classer des cas de triage médical ? Mon travail relie cadrage, audit des données, entraînement, évaluation et démonstration déployable.','Can a small local model be specialised to classify medical-triage cases? My work connects problem framing, a data audit, training, evaluation and a deployable demonstration.','Kan een klein lokaal model medische triagegevallen classificeren? Mijn werk verbindt probleemdefinitie, data-audit, training, evaluatie en een inzetbare demo.')],[],'main',{graphic:'sft-scope',evidence:[0]}),
      chapter(L('Auditer avant d’entraîner','Audit before training','Auditen vóór trainen'),[],[],'main',{graphic:'sft-data',evidence:[1]}),
      chapter(L('Réaliser le SFT, puis le DPO','Run SFT, then DPO','SFT en daarna DPO uitvoeren'),[],[],'training',{graphic:'sft-training',evidence:[2]}),
      chapter(L('Comparer au modèle de base','Compare with the base model','Met het basismodel vergelijken'),[],[],'results',{graphic:'sft-results',evidence:[3]}),
      chapter(L('Arbitrer le format du modèle','Choose the model format','Het modelformaat kiezen'),[],[],'results',{graphic:'sft-packaging',evidence:[4]}),
      chapter(L('Du prototype à la démonstration','From prototype to demo','Van prototype naar demo'),[text('La démonstration expose le modèle avec vLLM, une API compatible OpenAI, Streamlit et Nginx, dans Docker. Le dépôt public documente ce déploiement CPU.','The demo serves the model with vLLM, an OpenAI-compatible API, Streamlit and Nginx in Docker. The public repository documents this CPU deployment.','De demo gebruikt vLLM, een OpenAI-compatibele API, Streamlit en Nginx in Docker. De openbare repository documenteert deze CPU-deployment.')],[],'report',{graphic:'sft-deployment',evidence:[5]}),
      chapter(L('Construire une trajectoire de projet','Plan the next project stages','De volgende projectfasen plannen'),[],[],'report',{graphic:'sft-plan',evidence:[6]}),
      chapter(L('Décider sur les preuves','Let evidence guide the decision','Op bewijs beslissen'),[],[],'main',{graphic:'sft-decision',evidence:[7,8]}),
    ];
    case 'car-ai': return [
      chapter(L('Voir, comprendre, agir','See, understand, act','Zien, begrijpen, handelen'),[p.story[0],p.story[1]],[],'main',{graphic:'car-vision'}),
      chapter(L('Un robot avec qui échanger','A robot you can talk to','Een robot om mee te praten'),[p.story[2],p.story[3]],[],'main',{graphic:'car-voice'}),
    ];
    case 'vesper': return [
      chapter(L('Le point de départ','The starting point','Het begin'),[p.lead,p.story[0]],[],'intent',{graphic:'vesper'}),
      chapter(L('Écouter pour se repérer','Navigate by listening','Oriënteren door te luisteren'),[p.story[1]],p.videos,'vesper',{transcript:true}),
      chapter(L('Derrière l’expérience','Behind the experience','Achter de ervaring'),[p.videos[0].description],images,'main'),
      chapter(L('Une intention ne suffit pas','An intention is not enough','Een intentie is niet genoeg'),[p.story[2],p.story[3]],[],'intent',{graphic:'vesper-lesson'}),
    ];
    case 'hoplites': return [
      chapter(L('Le prototype en mouvement','The prototype in motion','Het prototype in beweging'),[p.story[0],p.videos[0].description],p.videos,'hoplites'),
      chapter(L('Des centaines de combattants','Hundreds of fighters','Honderden strijders'),[text('Le jeu utilise le renderer Compatibility de Godot. Pour faire apparaître des centaines de personnages, nous avons créé nos propres niveaux de détail (LOD). Le coût des modèles doit suivre ce qui est réellement visible à l’écran.','The game uses Godot’s Compatibility renderer. To spawn hundreds of characters, we built our own levels of detail (LOD). Model cost needs to match what is actually visible on screen.','Het spel gebruikt Godots Compatibility-renderer. Om honderden personages te tonen, bouwden we eigen detailniveaus (LOD). Modelkosten moeten passen bij wat echt zichtbaar is.')],[],'process',{graphic:'hoplites-lod'}),
      chapter(L('Faire combattre un groupe','Make a group fight together','Een groep samen laten vechten'),[text('Nous avons développé nos IA et étudié le fonctionnement d’une phalange. L’objectif est de reproduire un comportement collectif dans les groupes adverses : une formation doit agir comme un ensemble, et pas seulement comme des unités juxtaposées.','We developed our own AI and studied how a phalanx works. The aim is to reproduce collective behaviour in enemy groups: a formation should act as a whole, not just as adjacent individual units.','We ontwikkelden eigen AI en bestudeerden de werking van een falanx. Vijandelijke formaties moeten collectief handelen, niet alleen als losse eenheden naast elkaar.')],[],'process',{graphic:'hoplites-ai'}),
      chapter(L('Fabriquer les personnages en local','Build characters locally','Personages lokaal maken'),[text('Les images générées servent de point de départ. Nous modélisons les meshes, les nettoyons, puis préparons les rigs et les animations dans une chaîne locale avant l’intégration dans Godot. Chaque passage doit produire un asset exploitable par le jeu.','Generated images provide the starting point. We model and clean up the meshes, then prepare rigs and animations in a local pipeline before integrating them into Godot. Each stage must produce a game-ready asset.','Gegenereerde beelden zijn het vertrekpunt. We modelleren en schonen meshes op en maken lokaal rigs en animaties vóór integratie in Godot. Iedere stap moet bruikbare game-assets opleveren.')],[],'process',{graphic:'hoplites'}),
      chapter(L('Un monde pour créer des mondes','A world for building worlds','Een wereld om werelden te bouwen'),[text('Le jeu possède son propre éditeur de niveaux. Nous avons construit un environnement dans lequel créer les mondes du jeu : l’outil de création fait partie du projet, au même titre que les personnages, les IA et le combat.','The game has its own level editor. We built an environment in which to create the game’s worlds: the authoring tool is part of the project, alongside characters, AI and combat.','Het spel heeft een eigen leveleditor. We bouwden een omgeving om spelwerelden te maken: het ontwerpgereedschap hoort bij het project, net als personages, AI en gevechten.')],[],'process',{graphic:'hoplites-editor'}),
    ];
    default:return [];
  }
}

export const roomNames={
  mnememind:L('La bibliothèque','The library','De bibliotheek'),
  atticagentwatcher:L('La console de supervision','The observatory console','De toezichtconsole'),
  clipgenerator:L('L’atelier de montage','The editing room','De montageruimte'),
  sft:L('Le laboratoire local','The local lab','Het lokale lab'),
  'car-ai':L('Le banc d’essai','The test bench','De testbank'),
  vesper:L('Le salon d’écoute','The listening nook','De luisterhoek'),
  hoplites:L('La salle de projection','The screening room','De projectieruimte'),
};
