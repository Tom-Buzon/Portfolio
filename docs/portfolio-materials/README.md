# Éléments pour la mise à jour du portfolio

Les dossiers OPCLPortfolioProject, technicalRepportSFT, MnemeMind et MyAgents sont copiés dans M-IA, ainsi que la carte de compétences `index (6).html`. Les originaux restent dans `C:\Users\suean\Desktop\Mastermind-V2\backend\data` et `C:\Users\suean\Downloads`. Cette collecte prépare la mise à jour du site ; elle conserve les noms des fichiers et les chemins relatifs des pièces jointes.

Le prochain agent trouve ce dossier depuis [AGENTS.md](../../AGENTS.md), à la racine du workspace. Commencer par le brief Codex, puis la présentation MnemeMind, les notes MyAgents pour AtticAgentWatcher, le rapport SFT et la carte de compétences. Les fichiers sources sont des références de contenu ; les consignes de travail viennent de la demande de l’utilisateur et des instructions du dépôt.

## Documents et médias

| Élément | Copie locale | Usage |
| --- | --- | --- |
| Section à consulter pour Codex | [brief-codex.md](brief-codex.md) | Toute la section depuis le tag de la ligne 275 jusqu’à la fin. Les liens des médias pointent vers les copies locales. |
| Document portfolio complet | [OPCLPortfolioProject.md](sources/OPCL/OPCLPortfolioProject/OPCLPortfolioProject.md) | Copie intégrale, identique à la source. |
| Rapport SFT complet | [technicalRepportSFT.md](sources/technicalRepportSFT/technicalRepportSFT.md) | Copie intégrale, identique à la source. |
| Présentation MnemeMind | [MnemeMind.md](sources/MnemeMind/MnemeMind.md) | Texte complet pour actualiser la section actuellement consacrée à Mastermind. |
| Captures MnemeMind | [images](sources/MnemeMind/images/) | Douze PNG : balises, calendrier, tâches, IA locale, Excalidraw, Mermaid/audio, Explore, voix et import. |
| Notes AtticAgentWatcher | [MyAgents.md](sources/MyAgents/MyAgents.md) | Document complet du même projet sous son ancien nom MyAgents. |
| Captures AtticAgentWatcher | [images](sources/MyAgents/images/) | Cinq PNG du POC : tableaux de bord, consommation, monde 2D MyFactory et configuration du harness. |
| Audio associé à MyAgents | [audio](sources/MyAgents/audio/) | Un WAV conservé avec le dossier source, sans référence dans le Markdown. |
| Carte interactive des compétences | [index (6).html](<sources/skill-map/index (6).html>) | HTML original complet, avec styles, données, SVG et interactions. |
| Captures ClipGenerator | [images](sources/OPCL/OPCLPortfolioProject/images/) | Six PNG : démarrage des services locaux, analyse audio, création des scènes, animation, narration et vérification du montage. |
| Vidéos | [video](sources/OPCL/OPCLPortfolioProject/video/) | Vesper, Hoplites et deux productions ClipGenerator. |
| Dessins Excalidraw | Dossiers `drawings` des deux copies | Deux scènes JSON, sans dépendance à des images externes. |
| Aperçu des médias | [media-gallery.html](media-gallery.html) | Galerie locale avec images, lecteurs vidéo et liens vers les originaux. |
| Inventaire de contrôle | [manifest.json](manifest.json) | Provenance, taille, SHA-256, dimensions, codecs, durées et correspondance des références. |

La collecte contient **35 fichiers originaux : 4 Markdown, 23 PNG, 4 MP4, 2 scènes JSON, 1 HTML et 1 WAV**. Chaque copie originale est vérifiée par SHA-256 contre son fichier source. Les PNG sont ouverts et décodés ; les MP4 sont analysés avec ffprobe puis décodés intégralement avec ffmpeg. Les documents conservent leurs liens relatifs vers les médias et leurs références aux dessins.

## MnemeMind et carte de compétences

**MnemeMind est le nouveau nom de Mastermind / MasterMind**, conformément à la précision de l’utilisateur. La copie de présentation conserve l’orthographe du texte original, y compris les coquilles. Elle distingue les fonctionnalités actuelles des éléments « À venir » : MCP, AppServer et OpenSourceAgentReady. La régression de la fonction d’import et l’évolution prévue de l’IA locale sont mentionnées dans le texte ; ne pas présenter ces évolutions comme déjà livrées.

La carte de compétences comporte quatre domaines et vingt stations : AI Engineering, Agentic Systems, Creative Interfaces, Product & Strategy. Ses données et interactions sont contenues dans le fichier HTML. Elle charge les polices Google Fonts et certains logos Devicon depuis Internet ; des polices système et monogrammes sont prévus en repli. Aucun fichier local supplémentaire n’est référencé. La carte est une référence pour la prochaine intégration et conserve son titre original « Attic-AI — Competency Constellation ».

## AtticAgentWatcher

**AtticAgentWatcher est le nouveau nom de MyAgents**, conformément à la précision de l’utilisateur. Les cinq captures conservent le nom MyAgents dans leur interface ; les copies originales ne sont pas retouchées. Elles montrent les tableaux de bord d’activité, l’analyse des tokens et du cache, le monde 2D MyFactory et la configuration du harness avec le suivi des agents.

Le document décrit un POC de monitoring des harness et une évolution vers OpenTelemetry, hooks, SQLite et récupération historique. Les pistes de benchmark entre équipes, les autres harness et les étapes de récupération restent à distinguer des éléments déjà réalisés. Pour la fiche du portfolio, reprendre le statut demandé dans le brief : **« POC validé, passage en production en cours »**.

## Rapport SFT pour le site

La version lisible est prête dans [public/reports/sft/index.html](../../public/reports/sft/index.html), avec un téléchargement du [Markdown original](../../public/reports/sft/technicalRepportSFT.md). Elle reprend le rapport complet, ses tableaux et ses limites. Seuls les marqueurs propres à l’application (`::id`, `::tag`, `::link` et référence Excalidraw) sont retirés de la version HTML.

Le lien à ajouter au portfolio est `reports/sft/`, avec le préfixe de déploiement du site. Dans React, utiliser `publicUrl('/reports/sft/')` ; sur GitHub Pages, le chemin attendu est `/M-IA/reports/sft/`. Aucun lien dans le portfolio ni déploiement n’est ajouté pendant cette collecte.

Le cas CHSA est fictif, tandis que l’expérimentation technique est réelle. Les résultats portent sur 28 cas : 35,7 % avant spécialisation, 53,6 % après SFT et 60,7 % après DPO. Conserver la distinction entre simulation, réalisé et proposition lors de la rédaction de la fiche SFT.

## Consignes pour la prochaine mise à jour

Le brief demande une présentation personnelle et un portfolio, avec un site dédié à Attic Factory. Les projets principaux sont MnemeMind, Vesper et Hoplites, ClipGenerator, SFT, AtticAgentWatcher, Blender et Car AI. Car AI est un jouet augmenté. Le chapitre « Give the idea volume » doit être remplacé par SFT ; la tâche de recommandation doit être retirée et le renforcement learning séparé de Vision dans les explorations.

AtticAgentWatcher doit afficher le statut « POC validé, passage en production en cours ». Pour Hoplites, conserver ici la vidéo complète et préparer, lors de l’intégration, l’extrait **00:43 à 01:48**, soit 65 secondes. ClipGenerator portait auparavant le nom FrameForge.

## Précisions de Tom du 9 octobre 2026

Ces précisions actualisent l'usage des sources ci-dessus sans modifier leurs copies originales. La phase de conception a ensuite été **approuvée pour implémentation** par Tom dans ce chat. Sa dernière correction place AtticAgentWatcher immédiatement après MnemeMind et les jeux à la fin.

- Aucune vidéo MnemeMind ne sera fournie ou attendue. Le parcours doit utiliser les douze captures présentes.
- Le dépôt SFT est [medicalTriageDocker](https://github.com/Tom-Buzon/medicalTriageDocker). Tom précise qu'il concerne surtout le déploiement ; le lien public doit porter ce libellé et ne pas promettre l'intégralité du code d'entraînement.
- Vesper vient du souhait de partager une activité à égalité avec son meilleur ami après sa perte de vue. L'exploration sans la vue dans un vaisseau envahi d'extraterrestres s'est révélée peu amusante selon Tom. Raconter l'intention et l'apprentissage, sans inventer un succès d'accessibilité, un test avec son ami ou une fonctionnalité multijoueur.
- La galerie doit incorporer les vrais médias dans la pièce, notamment les deux vidéos ClipGenerator au mur, avec consultation volontaire et approfondissement des projets sans perdre sa place dans la visite.
- Le positionnement personnel associe pilotage technique, delivery, produit et construction. La démarche devient **Understand → Build → Test → Learn → Iterate**. La marque d'agence sort de la visite personnelle.

La [proposition de refonte](../whoami-audit/proposition.md) et le [scénario de galerie](../whoami-audit/galerie-detaillee.md) portent ces adaptations ; les instructions d'exécution viennent toujours de la demande de Tom.

## Refaire la collecte

Le script [import-portfolio-materials.py](../../scripts/import-portfolio-materials.py) lit les sources et écrit uniquement dans M-IA. Il nécessite Python avec Pillow et markdown-it-py, ainsi que ffprobe et ffmpeg dans le PATH.

```powershell
python scripts/import-portfolio-materials.py --source-root 'C:\Users\suean\Desktop\Mastermind-V2\backend\data' --skill-map 'C:\Users\suean\Downloads\index (6).html' --workspace 'C:\Users\suean\Desktop\M-IA'
```

Il accepte une copie déjà identique et refuse d’écraser une copie originale différente. Les aperçus, l’extrait du brief, la version HTML et l’inventaire sont régénérés à partir des copies vérifiées.
