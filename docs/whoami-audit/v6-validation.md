# Validation V6 — 10 octobre 2026

## Ajustements livrés

- Carte des compétences : quatre orbites croisées autour d'un centre commun, vingt stations réparties sur les trajectoires. Libellés au-dessus des arcs, colorés selon leur domaine. La sélection accentue l'arc et atténue les autres domaines, avec une transition de contraste.
- Mobile : quatre domaines sélectionnables, cinq stations tactiles par domaine, compétences et outils complets dans deux onglets. Hauteur du cadre adaptée au contenu pour éviter un défilement imbriqué.
- Sommaire : ligne verticale, nœuds de scènes cliquables, progression et repère mobiles ; noms au survol et au focus clavier. Panneau détaillé redessiné.
- Méthode : déplacement entre cartes en 260 ms ; réduction de la carte sortante pendant la première moitié de la progression, agrandissement de la suivante pendant la seconde moitié.
- AtticAgentWatcher : titre sur une ligne sur ordinateur et mobile.

## Vérification

- 42 tests réussis, dont la synchronisation de l'échelle des cartes avec la progression ; lint réussi.
- Build de production avec base `/Portfolio/` réussi : 33 documents pré-rendus. Avertissement existant sur la taille du module Three.js.
- `git diff --check` réussi (avertissements de conversion LF/CRLF seulement).
- Carte sur ordinateur à 1400 × 900 CSS : vingt libellés, aucune intersection entre leurs rectangles. Sélection Agentic Systems : arc actif à 100 % d'opacité, autres arcs à 10 %, stations des autres domaines à 17 %. Couleurs des libellés contrôlées.
- À 390 × 844 CSS : quatre domaines et leurs stations sélectionnables, détails et logos accessibles, aucun débordement horizontal de la carte. Hauteur du cadre ajustée à son contenu. Couleur des cinq libellés du domaine sélectionné vérifiée.
- Sommaire mobile : treize destinations, navigation vers AtticAgentWatcher et fermeture du panneau.
- Méthode mobile : un geste avance d'une carte puis libère le verrou de déplacement.
- Titre AtticAgentWatcher : hauteur d'une seule ligne et largeur de contenu égale à la largeur disponible, sur ordinateur et mobile.

Les vérifications mobiles utilisent le viewport du navigateur ; pas de test sur appareil physique ni dans le navigateur LinkedIn. Le zoom utilisateur a été conservé et la taille temporaire restaurée. Aucun déploiement effectué.

## Captures

- [Carte complète](previews/v6-skills-desktop.png)
- [Domaine sélectionné](previews/v6-skills-focus.png)
- [Carte mobile](previews/v6-skills-mobile.png)
