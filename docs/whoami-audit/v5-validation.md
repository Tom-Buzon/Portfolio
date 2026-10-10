# Validation V5 — 10 octobre 2026

## Parcours livré

- Navigation à arrêts définis, courbe d'accélération/décélération commune ; gestes supplémentaires ignorés pendant les déplacements. Une section longue conserve des arrêts de lecture.
- Chaque salle : titre du **projet**, puis carte de présentation, puis salle suivante. Ces deux phases partagent la même position de caméra. La restauration entre langues distingue également titre et carte.
- Méthode : cinq étapes, changement en 380 ms, carte active agrandie. Sur mobile suffisamment haut, une carte visible à la fois ; sur écran court, lecture naturelle des cartes.
- « Mon parcours » reste un bouton discret dans la méthode. La chronologie s'ouvre horizontalement dans une boîte de dialogue ; balayage latéral et dates de navigation sur mobile.
- Sommaire nommé pour la visite générale et les étapes de chaque projet, cartes de compétences/outils, CTA animé et cartes de lecture opaques dans les projets.
- Bureau élargi sous la lampe, bloc de profil redondant retiré, carte de compétences dérivée de la source conservée avec ses vingt stations et logos locaux.
- GA4 G-WWE69VZ1KD après accord, événements de parcours et temps actif, diagnostic local sans chargement de Google. Configuration : [guide Google Analytics](../google-analytics.md).

## Contrôles effectués

- Build de production avec base `/Portfolio/` : 33 documents pré-rendus.
- Lint réussi ; 41 tests réussis, dont navigation, progression, consentement, filtrage des URL et mesure du temps actif.
- `git diff --check` réussi.
- Les destinations explicites des liens et du sommaire prennent la priorité sur un repositionnement provoqué par le focus clavier ; le verrou reste appliqué aux gestes de scroll pendant le trajet.
- Navigateur local, dimensions CSS 390 × 844 et 300 × 649, puis 1400 × 900. Les dimensions CSS ont été mesurées, le zoom existant du navigateur n'a pas été modifié.
- MnemeMind : titre à l'arrivée, carte au geste suivant, ouverture des détails. Navigation jusqu'au deuxième média, puis changement FR → EN : même média, même étape, sans débordement horizontal.
- Méthode sur mobile : un geste avance d'une carte, puis libère le verrou de déplacement ; ouverture et fermeture de la chronologie horizontale.
- SFT sur mobile : ressources Rapport/GitHub accessibles dans la barre, navigation par sommaire, texte opaque et sans débordement horizontal.
- Carte sur ordinateur : vingt libellés, aucune intersection entre leurs rectangles ; inspecteur « Frontend engineering & UX » entièrement visible, sans défilement interne.
- Les quatre orbites colorées restent derrière les libellés. Les fichiers de l'adaptation portent une version pour invalider le cache des anciennes feuilles de style.
- Car AI : lecture de la dernière étape, panneau de sortie, retour par scroll dans la salle Car AI (position du titre à moins d'un pixel du haut attendu).
- Diagnostics : ouverture, vues d'étapes, progression, temps actif, fin de projet, retour par scroll, fermeture et reprise de la visite constatés. Aucun script Google sur localhost.

## Limites de la vérification

La réception dans la propriété Google n'est pas testée depuis localhost. Elle reste à contrôler après publication via DebugView, selon le guide. Les tests mobiles utilisent un viewport de navigateur ; pas de test matériel dans le navigateur intégré LinkedIn sur iOS/Android.

Le build conserve l'avertissement existant sur la taille du module Three.js. Aucun déploiement ni publication effectué.

## Captures

- [Chronologie mobile](previews/v5-mobile-background.png)
- [Détails MnemeMind sur mobile](previews/v5-mobile-mnememind.png)
- [Arrivée dans la salle MnemeMind](previews/v5-mnememind-arrival.png)
- [Carte de compétences sur ordinateur](previews/v5-skills-desktop.png)
