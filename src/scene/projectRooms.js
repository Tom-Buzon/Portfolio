import * as THREE from 'three';

// Each room has its own furniture silhouette, materials, lighting and media supports.
export function buildProjectRooms({scene,box,cylinder,beam,label,light,glow,add,materials,sources,frame,imageFor}) {
  const {oak,steel,copper,black,paper,textile,terracotta,leaves,ceramic,darkWood}=materials;
  const v=(...xyz)=>new THREE.Vector3(...xyz);
  function caption(text,x,y,z,width=4,color='#e2c29b'){const object=label(text,width,color);object.position.set(x,y,z);return object;}
  function lamp(x,z,height=3.4){cylinder(.32,.07,x,.05,z,steel);beam(v(x,.1,z),v(x,height,z),.035,copper);const shade=add(new THREE.ConeGeometry(.48,.5,24,1,true),paper);shade.position.set(x,height,z);glow(x,height-.23,z,0xffc78a,1.5);light(x,height-.25,z,0xffc78a,22,9);}
  function plant(x,y,z,scale=1){const group=new THREE.Group();group.position.set(x,y,z);group.scale.setScalar(scale);scene.add(group);const pot=add(new THREE.CylinderGeometry(.25,.19,.43,20),terracotta,group);pot.position.y=.22;for(let i=0;i<9;i++){const a=i*2.4,tip=v(Math.cos(a)*.33,.62+(i%4)*.22,Math.sin(a)*.33);beam(v(0,.4,0),tip,.014,leaves,group);const leaf=add(new THREE.SphereGeometry(.17,8,6),leaves,group);leaf.position.copy(tip);leaf.scale.set(.5,1.7,.26);leaf.rotation.set(.4,a,.5);}return group;}
  function shelf(x,z,width=3.2,height=4.1,rotation=0){const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rotation;scene.add(group);box(width,height,.15,0,height/2,-.48,darkWood,group);for(const xx of [-width/2,width/2])box(.09,height,.85,xx,height/2,0,oak,group);for(let row=0;row<4;row++){const y=.45+row*.94;box(width,.09,.9,0,y,0,oak,group);for(let i=0;i<10;i++){const h=.43+(i%3)*.13,x=-width/2+.28+i*(width-.4)/10;box(.13,h,.48,x,y+.055+h/2,-.07,[paper,steel,copper,leaves][(i+row)%4],group);box(.1,.02,.012,x,y+.25,.18,copper,group);}}return group;}
  function table(x,z,width=4,depth=1.8,height=1.4,mat=oak){const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);box(width,.16,depth,0,height,0,mat,group);for(const xx of [-width/2+.25,width/2-.25])for(const zz of [-depth/2+.2,depth/2-.2])box(.075,height,.075,xx,height/2,zz,steel,group);return group;}
  function rug(x,z,w,d){box(w,.025,d,x,.014,z,textile);for(const dx of [-w/2+.1,w/2-.1])box(.025,.009,d-.2,x+dx,.03,z,copper);}
  function monitorFoot(x,y,z){cylinder(.05,.65,x,y-.2,z,steel);box(.75,.04,.44,x,y-.5,z,steel);}
  function easel(x,y,z,width){for(const dx of [-width*.36,width*.36])beam(v(x+dx,.08,z+.2),v(x+dx,y+.5,z-.12),.055,oak);beam(v(x,.08,z-.65),v(x,y+.3,z-.16),.045,oak);}
  function sofa(x,z,width=3.3,rotation=0){const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rotation;scene.add(group);box(width,.4,1.25,0,.48,0,oak,group);box(width,.95,.26,0,1,-.58,textile,group);for(const xx of [-width/2+.12,width/2-.12])box(.23,.58,1.35,xx,.82,0,textile,group);for(let i=0;i<3;i++){box((width-.5)/3,.22,1,-(width-.5)/3+i*(width-.5)/3,.77,0,textile,group);}return group;}

  // The welcome desk now sits in a lived-in room: shelves, reading light, textiles.
  shelf(1.3,-6.5,4.8,4.1);shelf(5.2,-6.4,2.4,3.1,-.15);
  sofa(-4.2,-3.3,3.3,.42);rug(-3.8,-1.8,3.8,3.5);lamp(-5.6,-4.6,3.3);
  const coffee=table(-3.6,-1.6,1.5,.9,.65);box(.5,.05,.4,0,.77,0,paper,coffee);cylinder(.12,.18,.42,.82,.1,ceramic,coffee);
  plant(4.8,0,-3.3,1.65);plant(-2.2,3.4,-6.4,.75);
  for(let i=0;i<7;i++)box(.075,2.45,.1,6.2+i*.18,1.23,-5.8,oak);
  const folded=box(.72,.08,.7,-3.8,.93,-3,textile);folded.rotation.y=.4;
  caption('UNDERSTAND / BUILD / TEST / LEARN / ITERATE',2,4.6,-6.3,6.4);
  light(1,3.5,-5.4,0xeec494,27,12);

  // 01 — Library: books wrap around several different ways of reading a note.
  rug(1.8,-18,9.1,6.3);shelf(-2,-20.5,2.8,4.2);shelf(4.8,-20.5,3.1,4.2);shelf(6.8,-18.2,3.4,3.7,-Math.PI/2);
  table(1.4,-19.3,4.8,2.1);table(4.9,-17.8,2.2,1.2,1.15);
  frame('mnememind-main','mnememind',4,'MNEMEMIND',imageFor('mneme-explore'),1.91,4.05,1.4,3.05,-19.8,0,'monitor');monitorFoot(1.4,1.92,-19.8);
  frame('mnememind-calendar','mnememind',4,'TIME',imageFor('mneme-week'),1.91,2.8,5.25,3.05,-18.4,-.48,'wood');
  easel(5.25,3.05,-18.65,2.8);
  frame('mnememind-formats','mnememind',4,'FORMATS',imageFor('mneme-drawing'),1.91,2.5,-1.7,2.45,-17.9,.4,'paper');
  easel(-1.7,2.45,-18.13,2.5);table(1.7,-17.4,2.9,1.15,1.05);monitorFoot(1.7,1.55,-17.4);
  frame('mnememind-terminal','mnememind',4,'LOCAL CONTEXT',imageFor('mneme-embeddings'),1.91,2.7,1.7,2.2,-17.4,-.12,'monitor');
  for(let i=0;i<4;i++){const sheet=box(.5,.035,.4,.1+i*.53,1.51,-18.7,i===2?copper:paper);sheet.rotation.y=(i-1)*.09;}
  lamp(-3.7,-19.8);plant(4.8,1.3,-17.4,.65);caption('01 / MNEMEMIND',1.5,4.7,-20.4,4.3);light(1.4,4.1,-17.2,0xe4c99e,28,10);

  // 02 — U-shaped supervision console in the former agency wing.
  sources.studioBench.visible=false;sources.planning.visible=false;sources.planningSign.visible=false;
  const rack=sources.rack; rack.position.set(-21.4,0,-10.5);
  rug(-17.4,-8.2,8.6,6);table(-17.3,-9.7,5.8,1.85);const side=table(-20.25,-8.4,2.8,1.6);side.rotation.y=.65;table(-14.1,-8.8,2.5,1.4,1.2);
  frame('atticagentwatcher-main','atticagentwatcher',6,'ACTIVITY',imageFor('watcher-today'),1059/898,2.7,-17.3,3.05,-10.15,0,'monitor');monitorFoot(-17.3,1.92,-10.15);
  frame('atticagentwatcher-usage','atticagentwatcher',6,'USAGE',imageFor('watcher-tokens'),1059/898,2.6,-20.2,2.95,-9.15,.34,'monitor');
  frame('atticagentwatcher-factory','atticagentwatcher',6,'MYFACTORY',imageFor('watcher-factory'),1046/914,2.55,-14.25,3.4,-9.8,-.3,'wood');
  frame('atticagentwatcher-config','atticagentwatcher',6,'HARNESS',imageFor('watcher-config'),1059/898,2,-14.1,2.45,-8.45,-.1,'monitor');
  monitorFoot(-14.1,1.7,-8.45);monitorFoot(-20.2,1.94,-9.15);
  caption('02 / ATTIC AGENT WATCHER',-17,4.95,-11.2,6);plant(-12.6,0,-8.7,1.25);lamp(-21.8,-8.9);light(-17,4.3,-8.2,0xb5b9e8,18,8);
  for(let i=0;i<3;i++)beam(v(-20.7,.08,-9.5+i*.12),v(-17,.08,-9.5+i*.12),.022,copper);

  // 03 — Editing room: two portrait films, a low console and a storyboard wall.
  rug(17.5,-21.8,10,6.8);table(14.6,-21.4,3.6,1.7,1.3);
  for(let i=0;i<19;i++)box(.28,4.65,.16,16.5+i*.33,2.33,-24.4,i%2?textile:black);
  frame('clipgenerator-clip-one','clipgenerator',9,'PRODUCTION 01',imageFor('clip-one'),478/850,1.8,17.65,3.1,-23.7,0,'projection');
  frame('clipgenerator-clip-two','clipgenerator',9,'PRODUCTION 02',imageFor('clip-two'),478/850,1.8,20.1,3.1,-23.7,0,'projection');
  frame('clipgenerator-main','clipgenerator',9,'AUDIO / SCENES',imageFor('clip-audio'),1.87,3.3,14.6,2.7,-21.7,.32,'monitor');
  frame('clipgenerator-storyboard','clipgenerator',9,'ANIMATION',imageFor('clip-animation'),1.87,3,22,3.1,-22.4,-.7,'paper');
  frame('clipgenerator-edit','clipgenerator',9,'EDIT / EXPORT',imageFor('clip-edit'),1.87,3.1,13.7,2.7,-24.7,.3,'monitor');
  for(const x of [16.1,21.6]){box(.55,1.45,.5,x,.77,-23.4,black);for(const y of [.5,1.05]){const speaker=add(new THREE.TorusGeometry(.16,.025,8,24),copper);speaker.position.set(x,y,-23.12);}}
  beam(v(16.4,4.98,-23.7),v(21.3,4.98,-23.7),.065,copper);caption('03 / CLIPGENERATOR',18.8,5.25,-23.65,4.5);
  lamp(12.3,-22.4,3.3);light(19,4,-21.3,0xe5b4d4,24,10);

  // 04 — A local-computing lab, with a triage task board and report lectern.
  rug(1.2,-34.6,9.1,5.4);table(1.5,-35.1,5.5,1.65,1.38,paper);table(4.5,-33.8,2,1.3,1.2,paper);
  box(6.9,3.65,.16,1.1,2.25,-36.1,paper);caption('LOCAL FINE-TUNING / MEDICAL TRIAGE',1.1,4.6,-36,6.4,'#cbdce9');
  frame('sft-main','sft',11,'TEXT / QWEN3 / TRIAGE','',1.8,4.5,1.2,3.05,-35.95,0,'paper');
  frame('sft-training','sft',11,'LoRA / SFT / DPO','',1.8,2.65,4.5,2.55,-33.9,-.32,'monitor');
  frame('sft-results','sft',11,'BASE 35.7 / SFT 53.6 / DPO 60.7','',1.8,3.2,-2.65,3.05,-34.8,.32,'wood');
  frame('sft-report','sft',11,'API / DOCKER / REPORT','',1.8,2.4,1.75,2.2,-32.6,-.16,'paper');
  box(.65,1.15,.85,4.9,.64,-34.8,black);for(let i=0;i<8;i++)box(.49,.035,.02,4.9,.3+i*.1,-34.36,steel);
  for(let i=0;i<3;i++){box(.85,.035,.52,-.1+i*1.04,1.5,-34.7,[leaves,copper,terracotta][i]);caption(['LOW','MEDIUM','EMERGENCY'][i],-.1+i*1.04,1.82,-34.6,.9);}
  beam(v(1.75,0,-32.6),v(1.75,1.6,-32.6),.065,copper);light(1,4.5,-33.3,0xd2e5ee,28,9);lamp(-3.7,-35.3);

  // 05 — A compact maker's bench. The car is an explanatory maquette.
  table(1,-43.5,3.6,1.7,1.25);box(4.1,2.2,.12,1,2.5,-44.35,oak);
  for(let row=0;row<4;row++)for(let col=0;col<10;col++)box(.03,.03,.012,-.8+col*.4,1.7+row*.45,-44.275,steel);
  frame('car-ai-main','car-ai',12,'PERCEPTION / ACTION','',1.8,3.4,1,3.15,-44.25,0,'paper');
  box(1.32,.1,.82,1,1.5,-43,copper);
  for(const x of [.55,1.45])for(const z of [-43.48,-42.52]){const wheel=cylinder(.23,.16,x,1.49,z,black);wheel.rotation.x=Math.PI/2;const hub=cylinder(.11,.17,x,1.49,z,steel);hub.rotation.x=Math.PI/2;}
  for(const x of [.55,1.45])for(const z of [-43.3,-42.7])cylinder(.025,.19,x,1.62,z,steel);
  box(.92,.045,.62,1,1.72,-43,leaves);box(.2,.065,.19,.94,1.78,-43,black);
  for(let i=0;i<12;i++)for(const z of [-43.21,-43.14])box(.017,.075,.017,.61+i*.035,1.79,z,copper);
  for(const x of [1.14,1.37])box(.14,.14,.2,x,1.8,-42.79,steel);
  beam(v(1.45,1.73,-43),v(1.5,2.07,-43),.023,steel);
  box(.08,.25,.3,1.5,2.08,-43,leaves);const lens=cylinder(.09,.14,1.58,2.1,-43,black);lens.rotation.z=Math.PI/2;
  for(const z of [-43.18,-42.82])box(.17,.045,.13,1.73,1.53,z,black);
  const speaker=add(new THREE.TorusGeometry(.12,.025,8,20),steel);speaker.position.set(.62,1.82,-42.93);speaker.rotation.x=-Math.PI/2;
  for(let i=0;i<4;i++)beam(v(.67+i*.04,1.82,-43.15),v(1.37,1.85+i*.035,-43.2),.009,i%2?copper:paper);
  box(.45,.055,.25,-.18,1.37,-42.95,black);caption('RASPBERRY PI 4 / VISION / VOICE',1,1.16,-42.62,2.7);
  caption('05 / CAR AI — CONCEPT MODEL',1,4.3,-44.2,4.2);lamp(-1.8,-43.7,3.2);

  // 06 — Listening nook: a chair, soft circular rug, acoustic slats and headphones.
  const roundRug=cylinder(3.7,.025,1.7,.015,-51.9,textile);roundRug.scale.z=.8;
  sofa(1.8,-51,2,.12);table(4.2,-50.8,1.1,.8,.8);plant(-2.4,0,-53.1,1.7);
  for(let i=0;i<16;i++)box(.12,3.8,.18,-1.8+i*.42,1.9,-54.5,i%3===0?darkWood:oak);
  frame('vesper-intent','vesper',13,'VESPER / FIELD NOTES','',1.5,2.6,-1.2,2.9,-53.3,.26,'paper');
  frame('vesper-vesper','vesper',13,'LISTEN',imageFor('vesper'),1096/756,3.3,2,3,-54.1,0,'wood');
  frame('vesper-main','vesper',13,'DEVELOPER MAP','/images/vesper.webp',1100/760,2.5,5,2.8,-53.3,-.5,'paper');
  const headphones=sources.headphones.clone(true);headphones.visible=true;headphones.position.set(4.15,1.35,-50.8);headphones.rotation.set(0,0,0);scene.add(headphones);beam(v(4.15,.85,-50.8),v(4.15,1.6,-50.8),.025,copper);
  lamp(-.1,-52.4,3.7);caption('06 / VESPER — LISTENING ROOM',1.7,4.5,-54.2,5);light(2,3.7,-51.8,0xf1bf92,23,9);

  // 07 — Screening room: a broad fabric screen, low seating and process frieze.
  rug(18,-47,10.2,7.8);box(7.6,4.4,.12,18,2.5,-50.3,textile);
  frame('hoplites-hoplites','hoplites',15,'HOPLITES',imageFor('hoplites'),1274/710,6.5,18,3.4,-50.1,0,'projection');
  frame('hoplites-process','hoplites',15,'CONCEPT TO GAMEPLAY','',1.8,3.4,22,2.9,-47.4,-.5,'paper');
  for(const x of [16,18,20])sofa(x,-44.8,1.6);
  table(14.3,-47.8,2,1.4,.75);for(let i=0;i<7;i++)box(.22,.13+(i%3)*.12,.2,13.65+(i%3)*.46,.91,-48.15+Math.floor(i/3)*.35,oak);
  caption('07 / HOPLITES',18,5.5,-50.1,5);beam(v(14.55,5.2,-50.2),v(21.45,5.2,-50.2),.065,copper);
  lamp(13.6,-49.3,3.3);light(18,4.3,-46.8,0xe7c6a0,22,10);
}
