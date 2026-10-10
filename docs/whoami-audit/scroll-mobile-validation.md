# Scroll et fin de parcours — 10 octobre 2026

## Corrections

- Fusion des arrêts qui tombent au même point après limitation à la hauteur réelle de la page. Cela débloque le retour depuis le pied de page sur grand écran.
- Lecture du pied de page jusqu'à son extrémité lorsqu'il dépasse la hauteur de l'écran ; la touche Fin vise également cette extrémité.
- Sommaire calculé avec les positions réellement accessibles : Contact et 13 / 13 sont maintenant atteints même si le début théorique de Contact dépasse la limite de scroll.
- Transitions mobiles plus courtes : environ 750 ms pour un écran dans la visite, 660 ms dans un projet, 220 ms entre cartes de méthode. Départ plus réactif, courbe progressive, verrou conservé pendant chaque trajet. Seuil tactile ramené de 36 à 24 px.
- Pendant les déplacements mobiles, suppression de la limite à environ 30 images/s et de la seconde interpolation de caméra. Cible de rendu de 60 images/s en mouvement, rythme réduit au repos.
- Résolution du canvas mobile plafonnée à 1 pixel de rendu par pixel CSS, anti-crénelage multisample désactivé à la création mobile ; moins de charge graphique. Les médias HTML et les textes conservent leur résolution native.
- Suppression des mesures de projection des médias desktop sur mobile ; positions du sommaire mises en cache et recalculées lors des changements de taille ; méthode inactive hors écran. Les gestes tactiles ne déclenchent plus le parallaxe de souris.

## Vérification

- 46 tests réussis, lint réussi, build `/Portfolio/` réussi ; avertissement Three.js existant sur la taille du module.
- Blocage reproduit avant correction : Contact et footer limités au même point, le geste vers le haut ne déplaçait plus la page.
- Grand viewport : bas atteint, geste inverse fonctionnel ; sommaire Contact, 13 / 13, progression 1.
- Écran 390 × 420 CSS : pied de page de 500 px, dernière position de scroll exactement égale au maximum de 18 704 px ; bord inférieur du footer à 419,6 px dans une fenêtre de 420 px.
- Écran 390 × 844 CSS : canvas 390 × 844, méthode 0 → 1 en un geste, arrivée sur la carte MnemeMind puis ouverture des détails, lecture par scroll et libération du verrou, aucun débordement horizontal. Aucune erreur console sur l'aperçu vérifié.
- Taille temporaire du navigateur restaurée après vérification.

Le téléphone signalé est un Samsung, probablement avec Chrome. La vérification ci-dessus utilise le viewport du navigateur de bureau : elle ne mesure pas les performances du GPU de ce téléphone. La cible de 60 images/s n'est donc pas une garantie matérielle ; le ressenti final reste à confirmer sur l'appareil et éventuellement dans le navigateur LinkedIn.

Capture : [fin du parcours et sommaire](previews/footer-progress-fixed.png).
