import { L } from './copy.js';
export const skillGroups = [
  { id:'ai',name:'AI Engineering',color:'#c2de9d',items:[
    ['LLM specialization',L('Adapter un modèle compact et choisir ses compromis d’inférence.','Adapt a compact model and choose inference trade-offs.','Een compact model aanpassen en afwegingen voor inferentie maken.'),'Qwen · Hugging Face · PyTorch · PEFT · vLLM','sft'],
    ['Retrieval & RAG',L('Retrouver un contexte utile et relier une réponse à ses sources.','Retrieve useful context and connect an answer to its sources.','Bruikbare context ophalen en antwoorden aan bronnen verbinden.'),'Qdrant · FAISS · LangChain · Ollama','mnememind'],
    ['Model evaluation',L('Comparer à une baseline, auditer les labels et analyser les erreurs.','Compare with a baseline, audit labels and analyse errors.','Met een baseline vergelijken, labels controleren en fouten analyseren.'),'Python · Pandas · scikit-learn · MLflow','sft'],
    ['Data & ML',L('Préparer les données et structurer une expérimentation.','Prepare data and structure an experiment.','Data voorbereiden en een experiment structureren.'),'Python · Pandas · TensorFlow · Airflow','explorations'],
    ['Deployment',L('Passer du modèle à une démonstration utilisable.','Turn a model into a usable demonstration.','Van een model naar een bruikbare demonstratie.'),'Docker · FastAPI · AWS · EC2','sft'],
  ]},
  {id:'agents',name:'Agentic Systems',color:'#8ed8d0',items:[
    ['Agent architecture',L('Définir les rôles, les outils et les limites de délégation.','Define roles, tools and delegation boundaries.','Rollen, tools en grenzen van delegatie bepalen.'),'LangGraph · LangChain · Codex','explorations'],
    ['Harness & runtimes',L('Comprendre les sessions, les hooks et les particularités de chaque outil.','Understand sessions, hooks and tool-specific behaviour.','Sessies, hooks en de kenmerken van elke tool begrijpen.'),'Codex · Hooks · AppServer concepts','atticagentwatcher'],
    ['Knowledge workspaces',L('Structurer notes, relations, contexte et mémoire de travail.','Structure notes, connections, context and working memory.','Notities, verbanden, context en werkgeheugen structureren.'),'Markdown · Electron · Qdrant · Node.js','mnememind'],
    ['Agent observability',L('Rendre l’activité visible et construire une collecte événementielle.','Make activity visible and build event-based collection.','Activiteit zichtbaar maken en gebeurtenissen verzamelen.'),'Codex · OpenTelemetry · SQLite','atticagentwatcher'],
    ['Tool integrations',L('Relier des services et concevoir des interfaces d’outils explicites.','Connect services and design explicit tool interfaces.','Services verbinden en duidelijke toolinterfaces ontwerpen.'),'REST · FastAPI · Node.js · MCP concepts','clipgenerator'],
  ]},
  {id:'creative',name:'Creative Interfaces',color:'#e6b69a',items:[
    ['Audio & voice',L('Explorer le guidage sonore, la transcription et les interfaces vocales.','Explore sound guidance, transcription and voice interfaces.','Geluidsbegeleiding, transcriptie en spraakinterfaces verkennen.'),'Godot · STT · TTS','vesper'],
    ['Video systems',L('Relier analyse audio, storyboard, animation et montage.','Connect audio analysis, storyboards, animation and editing.','Audioanalyse, storyboard, animatie en montage verbinden.'),'Wan2GP · ComfyUI · Tauri · Python','clipgenerator'],
    ['Spatial interaction',L('Passer de la création d’un personnage à son intégration dans un espace.','Take a character from creation to integration into a space.','Van personagecreatie naar integratie in een ruimte.'),'Godot · Blender · Three.js','hoplites'],
    ['Frontend engineering & UX',L('Construire des parcours, des interfaces et des interactions lisibles.','Build clear journeys, interfaces and interactions.','Duidelijke gebruikersreizen, interfaces en interacties bouwen.'),'JavaScript · TypeScript · Angular · React · WebGL','mnememind'],
    ['Physical prototypes',L('Explorer une boucle entre perception et mouvement.','Explore a loop between perception and movement.','Een lus tussen waarneming en beweging verkennen.'),'Raspberry Pi · Python · Vision','car-ai'],
  ]},
  {id:'product',name:'Product & Strategy',color:'#b7abed',items:[
    ['Problem framing',L('Traduire une situation ambiguë en besoin et en premier périmètre.','Translate ambiguity into a need and an initial scope.','Onduidelijkheid vertalen naar een behoefte en een eerste scope.'),'Discovery · Process maps · Requirements','background'],
    ['Feasibility & POC',L('Formuler une hypothèse, préparer un essai et décider de la suite.','Form a hypothesis, design an experiment and decide what comes next.','Een hypothese formuleren, een proef ontwerpen en het vervolg bepalen.'),'Python · Docker · Notebooks · Git','sft'],
    ['Technical strategy',L('Comparer les architectures et savoir changer d’approche.','Compare architectures and know when to change direction.','Architecturen vergelijken en weten wanneer de aanpak moet veranderen.'),'Architecture · Roadmaps · Trade-offs','atticagentwatcher'],
    ['Full-stack delivery',L('Relier conception, développement et usage réel.','Connect design, development and real use.','Ontwerp, ontwikkeling en echt gebruik verbinden.'),'Electron · Tauri · Angular · Node.js','background'],
    ['Operations & costs',L('Planifier, suivre et transmettre ; distinguer coût observé et estimation.','Plan, track and hand over; distinguish observed cost from estimates.','Plannen, opvolgen en overdragen; gemeten kosten van schattingen onderscheiden.'),'Project control · Reporting · Docker · AWS','background'],
  ]},
];
export const explorations = [
  ['Chess Agent','LangGraph · Angular',L('Relier la conversation à des outils spécialisés pour explorer un coach d’échecs.','Connect conversation with specialised tools to explore a chess coach.','Gesprekken verbinden met gespecialiseerde tools voor een schaakcoach.')],
  ['ML Delivery','MLflow · FastAPI · Airflow',L('Travailler le passage du notebook à une chaîne de livraison ML.','Work on moving from a notebook to an ML delivery pipeline.','De stap van een notebook naar een ML-deliverypipeline verkennen.')],
  ['UseYourFridge','Angular · Ionic · TypeScript',L('Relier ingrédients disponibles, recettes et liste de courses.','Connect available ingredients, recipes and shopping lists.','Beschikbare ingrediënten, recepten en boodschappenlijsten verbinden.')],
  ['PropertyValuation','JavaScript · CSV · Highcharts',L('Explorer et visualiser des données immobilières publiques françaises.','Explore and visualise public French property data.','Openbare Franse vastgoedgegevens verkennen en visualiseren.')],
  ['MosaicGenerator','Python · Image processing',L('Recomposer une image à partir d’une bibliothèque d’images.','Rebuild an image using an image library.','Een afbeelding opbouwen uit een beeldenbibliotheek.')],
  ['TeachMeAnything','Python · n8n · JavaScript',L('Assembler voix, texte et vidéo dans un prototype pédagogique.','Combine voice, text and video in an educational prototype.','Spraak, tekst en video combineren in een educatief prototype.')],
  ['TradeBroFamily','JavaScript · TradingView',L('Explorer des interfaces de données et graphiques de marché.','Explore interfaces for market data and charts.','Interfaces voor marktgegevens en grafieken verkennen.')],
  ['LocalRag','LangChain · FAISS · Ollama',L('Expérimenter la recherche documentaire et les modèles en local.','Experiment with local retrieval and models.','Experimenteren met lokale documentzoekopdrachten en modellen.')],
  ['Vision','Python · VGG16',L('Explorer classification textile et vision semi-supervisée.','Explore textile classification and semi-supervised vision.','Textielclassificatie en semi-gesuperviseerde vision verkennen.')],
  ['Reinforcement Learning','Python · LunarLander',L('Apprendre par l’expérimentation dans un environnement de contrôle.','Learn through experiments in a control environment.','Leren door experimenten in een besturingsomgeving.')],
];
