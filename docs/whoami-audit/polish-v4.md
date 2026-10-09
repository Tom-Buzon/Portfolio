# Retouches V4 — 10 octobre 2026

- Fonds des textes à 60 % d’opacité, flou réduit à 4 px. Suppression des dégradés sombres sous les cartes qui cumulaient leur opacité.
- Méthode : 1,6 hauteur d’écran de progression au lieu de 3,5 ; décélération de la caméra à l’arrivée, léger amortissement visuel de l’ancrage, carré actif plus explicite et progression continue dans chaque carré et dans le bandeau.
- Sortie des projets au scroll : panneau de fin explicite, indicateur « Retour dans la pièce », effacement progressif du média et recul de la caméra avant fermeture. L’approche reste réversible. Le texte de la salle réapparaît par un fondu.
- Langues : sauvegarde ponctuelle de la section réelle ou de l’étape du projet et de la position relative dans celle-ci, puis restauration après traduction. Les différences de hauteur du texte sont prises en compte ; les rubriques dépliées sont conservées. La sauvegarde est consommée une seule fois pour le document de destination.

## Vérification

- Build de production et lint réussis ; 35 tests réussis, dont trois nouveaux contrôles sur la cadence de la méthode, l’amortissement de la caméra et le retour progressif.
- Navigateur : transparence mesurée à 0,6 ; progression au scroll de la méthode ; retour Car AI progressif, réversible puis complet.
- Changement de langue : étape 3 de la méthode FR → EN (position relative identique), salle MnemeMind EN → NL (écart inférieur à 1 px), capture 8 NL → FR, puis FR → EN sur mobile 390 × 844. Aucune erreur de console observée.
- Captures : `previews/polish-v4-home.png` et `previews/polish-v4-method.png`.

Prévisualisation : http://127.0.0.1:4173/M-IA/
