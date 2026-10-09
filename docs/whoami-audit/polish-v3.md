# WHOAMI — retouches V3

Réalisées le 10 octobre 2026, à partir des retours de Tom. Le nom est affiché une seule fois dans la ligne d’identité.

## Parcours

- Accueil : loader lié au démarrage de la scène, lumières moins éblouissantes, nouvelle accroche et cartes de lecture. Navigation directe avec effet de décodage du texte au survol et au changement de section.
- Méthode : sur ordinateur, la caméra reste devant le bureau pendant cinq étapes pilotées par le scroll ; elle reprend ensuite sa trajectoire derrière la bibliothèque. Sur mobile ou avec mouvement réduit, la lecture reste native.
- Compétences : contenu et logos de la carte d’origine préservés dans une adaptation séparée. Une seule hauteur d’écran, sans défilement interne. Sur petit écran, un sélecteur et deux panneaux donnent accès aux capacités et aux outils ; les titres redondants sont retirés lorsque la hauteur manque.
- Salles : une traversée amorcée se termine en douceur vers la salle suivante ou précédente. Pas de repositionnement automatique pendant la lecture d’un dossier.
- Dossiers : lecture continue au scroll, compteur d’étapes, choix direct d’une étape, retour permanent à la visite. Les images prennent place sur les supports de la scène ; sur mobile elles suivent directement leur texte. Les vidéos restent déclenchées volontairement.

## Projets

- MnemeMind : cadrage décalé vers la droite, supports physiques corrigés, introduction enrichie et douze captures accompagnées d’explications spécifiques.
- AtticAgentWatcher : écran déplacé de la chaise sur un support dédié et cycle complet de lecture.
- ClipGenerator : huit arrêts de lecture, deux vidéos murales et lecture exclusive d’une vidéo à la fois.
- SFT : huit étapes, du cadrage à la décision, avec données, entraînement, résultats et déploiement. Rapport et dépôt de déploiement accessibles en permanence. Distinction explicite entre réalisation, simulation et proposition.
- Car AI : Raspberry Pi 4, caméra, contrôle par LLM distant, STT/TTS et détection du noir ; maquette explicative enrichie.
- Vesper : formulation « un ami ».
- Hoplites : cinq étapes couvrant gameplay, LOD et performances, IA de phalange, pipeline local de création et éditeur de niveaux. Les schémas sont présentés comme des illustrations, pas comme des captures du jeu.

## Vérification

- Build de production réussi, 33 documents générés ; avertissement de taille du bundle Three.js existant.
- Lint réussi ; 32 tests réussis, dont les nouvelles vérifications des transitions dans les deux directions et du parcours de tous les médias.
- Contrôles navigateur : accueil, cinq étapes de méthode, traversées avant/arrière, lecture et retour des dossiers, lecture exclusive des vidéos, liens SFT, mode mouvement réduit.
- Contrôles visuels en 1265 × 720, 1856 × 1060, 390 × 844 et 390 × 667. Les vingt compétences et leurs outils ont été parcourus, sans débordement interne des panneaux mobiles.
- Les 35 fichiers de référence ont été vérifiés par SHA-256 et conservés inchangés. La carte adaptée est produite par `scripts/adapt-skill-atlas.py`, séparément de la source originale.
- Captures : `previews/polish-home.png`, `previews/polish-method.png`, `previews/polish-atlas-mobile.png`, `previews/polish-atlas-small.png` et `previews/polish-sft.png`.

Prévisualisation locale : http://127.0.0.1:4173/M-IA/
