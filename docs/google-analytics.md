# Google Analytics du portfolio

Flux installé : **G-WWE69VZ1KD**. L’intégration est faite dans le code ; aucune balise supplémentaire à coller, aucun conteneur Tag Manager nécessaire. Les réglages ci-dessous se font dans ta propriété GA4 après publication du site.

## 1. Éviter les mesures en double

**Administration → Collecte et modification des données → Flux de données → ton flux Web → Mesure améliorée : désactiver.**

Le site émet lui-même les pages vues, clics et événements de lecture. Il distingue une visite générale et chaque projet ouvert, y compris par URL directe et avec les boutons précédent/suivant du navigateur. Les scènes restent des événements, pour ne pas gonfler artificiellement le nombre de pages vues.

Si tu souhaites conserver une partie de la mesure améliorée, désactive au minimum « Modifications de page basées sur les événements de l’historique du navigateur » dans les réglages avancés des pages vues. Le réglage `send_page_view: false` dans le code ne désactive pas à lui seul cette option. [Documentation Google sur les pages vues manuelles](https://developers.google.com/analytics/devguides/collection/ga4/views).

## 2. Créer les dimensions personnalisées

**Administration → Affichage des données → Définitions personnalisées → Créer une dimension personnalisée**. Portée : **Événement**. Saisir exactement le paramètre indiqué ; le nom d’affichage est libre.

| Nom conseillé | Paramètre | Utilité |
| --- | --- | --- |
| Projet | `project_id` | Comparer MnemeMind, SFT, etc. |
| Scène | `scene_id` | Accueil, méthode, compétences, salles, contact |
| Phase de la salle | `scene_phase` | `title` puis `invitation` : nom du projet, puis sa carte |
| Type de page | `page_kind` | `tour` ou `project` |
| Chapitre du projet | `chapter_id` | Regrouper les étapes d’un même chapitre |
| Étape | `step_index` | Ordre de lecture dans les projets et la méthode |
| Média | `media_id` | Capture, vidéo ou schéma consulté |
| Progression | `percent` | Seuils 25 / 50 / 75 / 100 |
| Langue du site | `site_language` | FR / EN / NL, regroupement indépendant des titres |
| Contact | `contact_method` | `email` ou `linkedin` |
| Ressource | `resource_type` | `sft_report` ou `github` |
| Compétence | `skill_name` | Station sélectionnée dans la carte |
| Famille de compétences | `skill_family` | Une des quatre familles |
| Destination du sommaire | `destination` | Raccourcis utilisés |
| Mode de retour | `return_method` | Bouton ou scroll |
| Exploration | `exploration_name` | Entrées du carnet ouvertes |

Puis, dans **Métriques personnalisées**, créer :

| Nom conseillé | Paramètre | Unité |
| --- | --- | --- |
| Temps actif du contenu | `active_seconds` | Secondes |
| Vidéo effectivement regardée | `watched_seconds` | Secondes |
| Nombre de scènes consultées | `scenes_viewed` | Standard |

Les nouvelles dimensions ne retraitent pas l’historique. Les données personnalisées peuvent mettre **24 à 48 heures** à apparaître dans les rapports ; DebugView permet la vérification immédiate. [Guide Google des dimensions d’événement](https://support.google.com/analytics/answer/14239696?hl=en).

## 3. Événements envoyés

| Événement | Déclenchement |
| --- | --- |
| `page_view` | Arrivée sur le site, ouverture d’un projet, retour à la visite |
| `scene_view` | Scène générale stabilisée au moins 600 ms ; passages de caméra exclus |
| `project_open` / `project_close` | Entrée / sortie d’un projet |
| `project_step_view` | Nouvelle étape stabilisée dans un projet, avec média et chapitre |
| `content_engagement` | Temps actif, envoyé par tranches de 15 s, au changement de scène et à la sortie/masquage |
| `tour_progress` | Profondeur atteinte : 25 %, 50 %, 75 %, 100 % |
| `site_bottom` | Arrivée stabilisée à la scène Contact, en bas de la visite |
| `project_progress` / `project_complete` | Progression du projet et fin atteinte après la dernière étape |
| `project_return` | Retour explicite au parcours, via bouton ou scroll |
| `media_expand` | Ouverture d’une capture en grand |
| `video_start` / `video_resume` / `video_pause` | Actions sur les lecteurs vidéo locaux |
| `video_progress` | 25 %, 50 %, 75 % de durée effectivement lue ; un saut dans la vidéo ne compte pas comme lecture |
| `video_complete` | Fin de lecture, avec les secondes effectivement regardées |
| `resource_click` | Rapport SFT ou dépôt GitHub |
| `contact_click` | Clic sur le mail ou LinkedIn ; aucun envoi de message n’est supposé |
| `skill_select` | Sélection dans la carte, souris ou tactile |
| `contents_select` | Navigation depuis le sommaire |
| `background_open` | Ouverture de la frise professionnelle |
| `exploration_toggle` | Ouverture / fermeture d’une exploration |
| `language_change` | Changement de langue |
| `outbound_click` | Autre lien externe |

Le temps actif exclut les onglets masqués, la perte de focus, les déplacements de caméra et les périodes sans interaction de plus de 60 secondes. La lecture vidéo en cours maintient l’activité tant que l’onglet est visible et au premier plan. `active_seconds` est **incrémental** : additionner les valeurs de `content_engagement`, ne pas additionner des durées cumulées.

« Fin atteinte » mesure une position, pas une preuve que chaque texte a été lu. Le sommaire autorise les raccourcis ; `scenes_viewed` et les événements d’étape permettent de les distinguer d’un parcours complet. Les temps interrompus brutalement par la fermeture d’un navigateur mobile peuvent perdre leur dernière tranche.

## 4. Les rapports à créer

Dans **Explorer → Exploration libre** :

- **Projets les plus ouverts** : lignes = Projet ; valeurs = Nombre d’événements, Nombre total d’utilisateurs ; filtre = nom de l’événement `project_open`.
- **Temps passé par projet** : lignes = Projet, Chapitre du projet ; valeurs = Temps actif du contenu, Nombre total d’utilisateurs ; filtre = `content_engagement`. Le temps total / utilisateurs donne un temps actif moyen par visiteur sur le périmètre choisi.
- **Où la lecture s’arrête** : lignes = Projet puis Étape / Média ; valeurs = Nombre total d’utilisateurs ; filtre = `project_step_view`.
- **Actions utiles** : comparer `resource_click`, `media_expand`, `video_start`, `contact_click`, `site_bottom` et `project_complete`.

Dans **Explorer → Exploration de l’entonnoir**, créer un entonnoir **ouvert** : `scene_view` → `project_open` → `project_step_view` → `project_complete` → `contact_click`. Les projets peuvent être ouverts directement, sans passage préalable par la landing page. Faire un second entonnoir plus simple pour la visite générale : Accueil (`scene_view`, `scene_id=top`) → Portfolio → `site_bottom`.

Ventiler par **Catégorie d’appareil**, **Source/support de la session**, **Langue du site** et Projet. Pour un premier tableau, commencer avec seulement Projet et Catégorie d’appareil : les petites audiences donnent vite des tableaux clairsemés.

## 5. Événements clés

Dans **Administration → Affichage des données → Événements**, marquer **`contact_click`** comme événement clé. Facultativement `project_complete` et `resource_click` si tu veux mesurer ces signaux d’intérêt. Ne pas marquer chaque scroll ou chaque vue comme événement clé. Un clic mail indique une intention de contact, pas la réception d’un e-mail.

## 6. Vérifier une fois le site publié

1. Ouvrir une URL du site avec **`?analytics_debug=1`**, avant le fragment éventuel : par exemple `https://tom-buzon.github.io/Portfolio/?analytics_debug=1#work`.
2. Accepter la mesure d’audience. Le choix peut être rouvert dans le pied de page.
3. Ouvrir **Administration → Affichage des données → DebugView** dans Analytics.
4. Vérifier un seul `page_view` par ouverture de projet, les `project_step_view`, un agrandissement d’image, une vidéo, le retour et un clic sur le rapport SFT.
5. Laisser une étape visible 15 s : vérifier `content_engagement`. Passer dans un autre onglet : le temps actif doit cesser de monter.
6. Refuser ensuite la mesure : les nouveaux événements doivent s’arrêter. Revenir sans le paramètre de debug pour une visite normale.

En local, la balise Google n’est jamais chargée, même après acceptation : les diagnostics accessibles dans le pied de page avec `?analytics_debug=1` permettent de tester les événements sans polluer la propriété. Aucune réception réelle dans GA4 n’a donc été vérifiée pendant les tests locaux ; elle doit être confirmée après publication.

## 7. LinkedIn, conservation et données détaillées

- Utiliser dans le lien de profil LinkedIn : `https://tom-buzon.github.io/Portfolio/?utm_source=linkedin&utm_medium=social&utm_campaign=profile`. Pour un post, remplacer la campagne par un libellé de campagne, sans nom ou donnée personnelle.
- **Administration → Collecte et modification des données → Conservation des données** : choisir 14 mois pour permettre des comparaisons dans les explorations, si cette durée correspond à ton besoin. Ajuster aussi la durée de conservation au moment de définir ta politique de confidentialité.
- Si tu souhaites analyser les événements bruts et les séquences avec SQL : **Administration → Associations de produits → Associations BigQuery**. C’est facultatif ; l’export concerne les nouvelles données après activation et le stockage/interrogation peut être facturé selon l’usage. [Schéma officiel d’export](https://support.google.com/analytics/answer/7029846?hl=en).
- Tu peux définir ton trafic interne dans le flux et commencer par un filtre en mode **Test** avant de l’activer. Évite d’exclure une IP dynamique sans vérifier qu’elle est toujours la tienne.

Le site utilise le consentement de base : aucun chargement de Google Analytics avant accord, paramètres publicitaires refusés, choix mémorisé 180 jours et retrait accessible. Il n’y a ni identification nominative, ni enregistrement de session, ni capture des frappes. Analytics ne permet pas de savoir quel membre LinkedIn précis a visité le site. Les bloqueurs et refus de consentement entraînent une audience mesurée inférieure à l’audience réelle. [Mode de consentement Google](https://developers.google.com/tag-platform/security/guides/consent).

Sources Google consultées le 10 octobre 2026. Les intitulés de menus peuvent varier avec la langue de l’interface et les droits du compte.
