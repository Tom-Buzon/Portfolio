::id [7db74171-5f0d-48ed-b4c5-a2c332f26b0a]


# Spécialiser un petit LLM : de la preuve de concept à la décision IT::link [ OPCL/OPCLPortfolioProject/OPCLPortfolioProject] ::tag [  technicalRepportSFT ]



```excalidraw
excalidraw-09496d19-9e6c-4555-a7c9-036a005a10d4
```


**Rapport de conduite de projet AI Engineering · Cas d’étude CHSA**  
**Scénario organisationnel fictif · Expérimentation technique réelle · Mars–juillet 2026**

> **35,7 % → 60,7 % d’exactitude** sur un benchmark interne exploratoire  après SFT puis DPO : **+25 points observés**. Un gain mesuré sur cet échantillon, pas une validation clinique ni une preuve de généralisation.

## Synthèse exécutive

**La commande simulée.** Le CHSA, établissement hospitalier fictif, souhaite savoir si ses futures données métier pourraient servir à spécialiser des modèles compacts plutôt que de dépendre exclusivement de modèles généralistes. La direction IT demande une **preuve de faisabilité technique** et des **options d’action**, non une application opérationnelle ni un choix d’architecture définitif.

**La réponse du POC réel.** Une chaîne de préparation des données, fine-tuning supervisé (SFT/LoRA), optimisation par préférences (DPO), comparaison et packaging Docker a été mise en œuvre sur un corpus médical de recherche. Une amélioration de classification est observée sur 28 cas. L’audit a également imposé un pivot vers des données comportant une cible native de triage.

**La recommandation.** Autoriser, si le CHSA le souhaite, une **phase de qualification des données et d’évaluation élargie**, avec points d’arrêt explicites. Ni le déploiement clinique, ni l’architecture finale ne sont recommandés sur la seule base de ce POC.

**Convention de lecture.** Les encadrés **[SIMULATION]** concernent le commanditaire, son brief, ses décisions et le cadre de pilotage pédagogique. Les éléments **[RÉALISÉ]** reprennent le travail technique et les résultats effectivement documentés. Les éléments **[PROPOSITION]** sont des méthodes ou actions non encore exécutées.

## 1. Recueil des besoins et cadrage de la mission

### 1.1 Brief du commanditaire — [SIMULATION]

Le CHSA explore une stratégie d’IA maîtrisable localement, soucieuse de protection des données, de réversibilité et de coût d’exploitation. Il ne demande pas de construire un logiciel médical. Son attente : « Démontrer si un petit LLM peut progresser sur une tâche métier grâce à un corpus spécialisé ; documenter les limites et proposer la suite à instruire par notre équipe IT. »

**Méthode de recueil reconstituée pour le cas d’étude.** Analyse du brief simulé, cartographie des parties prenantes, distinction entre objectifs, exigences et hypothèses, puis traduction en tests techniques observables. Il ne s’agit **pas d’entretiens réellement menés**. Les parties prenantes envisagées sont : sponsor IT (décision de poursuivre), ingénieurs data/ML (faisabilité), métier clinique (qualité du besoin et des labels), DPO/juridique (licéité), RSSI (sécurité), exploitation (maintenabilité).

| Besoin du commanditaire | Critère d’acceptation pour le POC | Hors périmètre |
|---|---|---|
| Vérifier la capacité de spécialisation | Mesurer une variante entraînée contre le modèle de base sur le même benchmark | Certification, robustesse clinique |
| Maîtriser une expérimentation locale | Décrire modèle, ressources, données, entraînement et artefact exécutable | Infrastructure hospitalière réelle |
| Décider en connaissance de cause | Présenter gains, limites, risques, scénarios et portes de décision | Choix imposé du fournisseur ou de l’architecture |
| Préparer une utilisation future de données internes | Définir les contrôles de qualification et de conformité requis | Affirmer que les données CHSA ont été utilisées |

**Critères de succès de la mission.** Un pipeline fonctionnel, au moins une comparaison chiffrée à une baseline, un diagnostic data ayant une conséquence explicite, un artefact démontrable et un avis de poursuite argumenté. Les critères de *produit médical* (sécurité de triage, bénéfice clinique, performances en situation) ne sont pas des critères de réussite de cette mission.

### 1.2 Cas métier servant de banc d’essai — [RÉALISÉ]

La classification textuelle de situations médicales en `LOW`, `MEDIUM`, `EMERGENCY` est utilisée comme **tâche expérimentale mesurable**. Elle est volontairement distincte d’un vrai parcours de triage à l’hôpital : le modèle n’interagit pas avec des patients et ne décide pas de leur prise en charge.

## 2. Audit des données : décider avant d’entraîner — [RÉALISÉ]

**Méthode appliquée.** Inventorier volume et langues ; vérifier l’existence d’une cible alignée avec la tâche ; mesurer la distribution des classes ; contrôler les transformations réalisées ; identifier les risques de fuite, de biais, de confidentialité et de représentativité. Les contrôles non chiffrés restent explicitement **non démontrés**.

| Critère d’audit | Première piste : corpus Q/R FR–EN | Deuxième piste : FedMML | Conséquence |
|---|---|---|---|
| Volume et structure | 2 432 exemples : 1 431 FR / 1 001 EN | 87 234 lignes, 28 colonnes dans le fichier brut | Inventaire disponible |
| Label natif adapté | Aucun label de triage natif | `esi_level` présent | **Pivot vers FedMML** |
| Répartition utile | Labels reconstruits : 865 urgences, 97 moyens, **0 faibles** | Jeux v6 : 6 500 cas ; v6_2 : 6 400 cas | Première piste écartée |
| Limites | Q/R médicales ≠ décision de triage | ESI 4 exclu ; représentativité locale inconnue | Ne pas généraliser au triage réel |

Pour le POC, la conversion retenue est **ESI 1–2 → EMERGENCY ; ESI 3 → MEDIUM ; ESI 5 → LOW ; ESI 4 exclu**. Cette réduction simplifie la cible expérimentale mais ne reproduit pas l’échelle ESI complète. La qualité des labels, les doublons, les données manquantes et l’indépendance stricte des partitions ne sont pas suffisamment établis dans le dossier de synthèse pour être déclarés contrôlés.

**Décision de conduite de projet :** arrêter l’optimisation sur le premier jeu et reprendre la préparation à partir d’une cible de triage existante. **Leçon transférable aux données internes :** une source disponible n’est pas nécessairement une source adaptée ; chaque jeu doit faire l’objet d’une fiche de provenance, licence, finalité, qualité des labels, représentativité et restrictions d’usage.

## 3. Identifier, évaluer et prioriser les usages

### 3.1 Catalogue et grille de priorisation — [SIMULATION ANALYTIQUE]

Pour la mise en situation, les cas d’usage sont classés **avant tout choix d’architecture**. Grille illustrative sur 5 : valeur pour la mission (30 %), faisabilité data/technique (35 %), mesurabilité du résultat (25 %), sécurité du périmètre d’essai (10 %). Note élevée = option plus adaptée à un **premier POC**, et non valeur clinique supérieure. Ces scores sont **construits pour le cas d’étude**, pas issus d’un comité CHSA réel.

| Cas d’usage | Acteur et résultat attendu | Valeur | Faisabilité | Mesure | Sécurité POC | Score /5 | Décision pédagogique |
|---|---|---:|---:|---:|---:|---:|---|
| **UC1 — Classification sur dossiers hors production** | Ingénieur ML : prédire 3 classes et comparer à une référence | 4 | 4 | 5 | 4 | **4,25** | **POC retenu** |
| UC2 — Questions de collecte ciblées | Patient / soignant : dossier initial plus complet | 5 | 2 | 3 | 2 | **3,15** | Étude métier ultérieure |
| UC3 — Exploitation de constantes | Soignant : alerte ou estimation à partir de valeurs structurées | 4 | 3 | 4 | 2 | **3,45** | Baseline ML à instruire |
| UC4 — Assistance au triage réel | Professionnel : suggestion soumise à validation humaine | 5 | 1 | 2 | 1 | **2,45** | Exclu du POC actuel |

**Description de l’usage retenu.**
*Déclencheur* : lancement d’une campagne d’évaluation par l’ingénieur. *
Entrée* : cas textuel pré-étiqueté, sans flux patient réel.
*Traitement* : inférence du modèle de base et des variantes spécialisées. *
Sortie* : classe, conformité du format, mesures comparatives. 
*Exception* : classe invalide, résultat non exploitable ou échec technique → erreur journalisée et cas non comptabilisé comme succès. *Critère de sortie* : rapport comparatif reproductible. **Aucune décision médicale n’est automatisée.**

Le choix de UC1 est donc **méthodologique** : hypothèse falsifiable, données disponibles, périmètre maîtrisable et comparaison simple. Les trois autres cas ne sont ni développés ni validés ; ils constituent une **liste d’options**.

## 4. POC technique : architecture, entraînement et mesures — [RÉALISÉ]

**Socle.** `Qwen/Qwen3-1.7B-Base`, expérimenté sur **RTX 4070 8 Go**. Stratégie principale : quantification NF4 4 bits, SFT avec LoRA, puis étape DPO orientée vers les préférences de réponse et le format. Configuration documentée : 768 tokens max, 2 époques, learning rate `1e-4`, LoRA rank 16 / alpha 32, dropout 0,1, batch 2 avec accumulation 8, `paged_adamw_8bit`.

**Chaîne réalisée :** corpus préparé → SFT/LoRA → fusion → DPO → fusion FP16 → API / interface de démonstration Docker. La comparaison porte sur les variantes disponibles ; elle n’établit pas la supériorité globale de cette famille de modèles.

| État du modèle | Exactitude — benchmark interne de 28 cas |
|---|---:|
| Base | **35,7 %** |
| Après SFT | **53,6 %** |
| Après DPO | **60,7 %** |

**Lecture du gain.** L’augmentation observée est de **25 points de pourcentage** entre le modèle initial et la variante finale. Sur 28 cas seulement, ce résultat ne permet pas d’établir une robustesse statistique suffisante, une sécurité clinique ni une généralisation. La séparation complète train/test, la sensibilité par classe, la calibration et les intervalles de confiance restent à vérifier.

| Packaging comparé | Exactitude | Format strict | Latence moyenne | Débit |
|---|---:|---:|---:|---:|
| Adaptateur NF4 | 64,3 % | 32,1 % | 3,81 s | 10,79 tok/s |
| Adaptateur FP16 | 60,7 % | 89,3 % | 2,25 s | 16,55 tok/s |
| **Fusionné FP16** | **60,7 %** | **89,3 %** | **1,21 s** | **30,56 tok/s** |

**Arbitrage réellement pris pour la démonstration :** retenir la variante fusionnée FP16, plus rapide et plus stable en format strict que l’adaptateur NF4 sur cette campagne, sans choisir de solution de production. Les conditions exhaustives de reproductibilité doivent être confirmées dans le dépôt technique (versions, graines, empreintes de données).

## 5. Pilotage : jalons, écarts, coûts et livrables

### 5.1 Chronologie effective du POC — [RÉALISÉ]

| Période | Résultat documenté | Décision / contrôle |
|---|---|---|
| Mars 2026 | Pipeline bilingue, traitement et anonymisation | Premier corpus candidat |
| Avril | Préparation, essais SFT/LoRA | Labels reconstruits inadaptés |
| Fin avril–mai | Audit, pivot vers FedMML | **Réorientation du périmètre data** |
| Mai–juillet | SFT, variantes, DPO | Mesures comparatives |
| Juillet | Benchmark, fusion, API, Docker | Artefact de démonstration |

**Livrables réalisés :** scripts de préparation, datasets versionnés, scripts SFT/LoRA, préférences DPO, modèle fusionné, benchmarks, API/interface et conteneur Docker. **Écart majeur :** la première stratégie de labels ne permettait pas la démonstration ; le plan technique a été ajusté. Les délais exacts d’impact et le coût de ce pivot ne sont pas connus.

### 5.2 Cadre de pilotage du scénario — [SIMULATION]

Pour rendre la mission gouvernable dans l’étude de cas, le CHSA aurait pu utiliser **cinq jalons de validation** :
J1 brief approuvé ; 
J2 audit de données accepté ;
J3 pipeline fonctionnel ; 
J4 benchmark et démonstrateur ;
J5 remise d’options et GO/NO-GO pour l’étude suivante. 
Le tableau précédent présente **la réalité des activités** ; ces cinq jalons sont un **cadre pédagogique ajouté**, et non un planning historique prouvé.


### 5.3 Planification financière et scénarios de montée en charge — [SIMULATION]

Le POC initial a été développé principalement sur une infrastructure locale, avec une exposition du démonstrateur via une API hébergée sur AWS. Le projet ayant validé une amélioration expérimentale sur un modèle de 1,7 milliard de paramètres, l'étape suivante consiste à estimer les ressources nécessaires pour étendre les expérimentations.

Trois scénarios progressifs sont proposés au CHSA. Ils constituent des **hypothèses de planification**, et non des décisions d'investissement.

#### 1. Scénarios techniques et financiers

|                -      | A — POC étendu     | B — Pilote avancé                     | C — Préindustrialisation             |
| -------------------- | ------------------ | ------------------------------------- | ------------------------------------ |
| Modèle étudié        | 1,7–3B             | 7–8B                                  | 14–32B                               |
| Durée indicative     | 3 mois             | 6 mois                                | 9 mois                               |
| Objectif             | Validation élargie | Comparaison de modèles et intégration | Préparation d'un système exploitable |
| Entraînement         | LoRA / QLoRA       | QLoRA + évaluations comparatives      | Fine-tuning distribué si nécessaire  |
| Inférence            | GPU à la demande   | Service GPU dédié                     | Service GPU redondant à évaluer      |
| Budget global estimé | **45 k€**          | **175 k€**                            | **455 k€**                           |

Budgets indicatifs incluant personnel, infrastructure et une provision de 15 %, arrondis. Ils ne constituent ni des devis fournisseurs ni une estimation de conformité clinique achevée.

#### 2. Ressources humaines et compétences nécessaires

Le dimensionnement repose sur les tarifs journaliers hypothétiques suivants : Data Engineer 600 €, ML Engineer 700 €, MLOps 700 €, référent clinique 900 €, sécurité/conformité 800 € et chef de projet 650 €.

| Profil                 | A — Jours    | B — Jours     | C — Jours     |
| ---------------------- | ------------ | ------------- | ------------- |
| Data Engineer          | 12           | 35            | 80            |
| ML / AI Engineer       | 20           | 65            | 140           |
| MLOps / Cloud Engineer | 8            | 35            | 100           |
| Référent clinique      | 5            | 25            | 65            |
| Sécurité / conformité  | 3            | 12            | 45            |
| Chef de projet IT      | 5            | 20            | 55            |
| **Coût RH total**      | **36 950 €** | **136 100 €** | **346 250 €** |

Les charges représentent des jours-personnes répartis sur les différentes phases. Elles ne supposent pas que chaque profil soit mobilisé à temps plein.

#### 3. Coûts d'infrastructure

Les postes ci-dessous couvrent l'expérimentation GPU, les services d'inférence et les coûts complémentaires de stockage, d'observabilité et d'intégration.

| Poste                                                    | A           | B            | C            |
| -------------------------------------------------------- | ----------- | ------------ | ------------ |
| Entraînement / expérimentation GPU                       | 300 €       | 2 500 €      | 10 000 €     |
| Hébergement et inférence                                 | 900 €       | 9 000 €      | 26 000 €     |
| Stockage, monitoring, réseau et services complémentaires | 500 €       | 3 500 €      | 15 000 €     |
| **Total infrastructure**                                 | **1 700 €** | **15 000 €** | **51 000 €** |

**Hypothèse de calcul :** infrastructure cloud européenne, machines GPU facturées à l'utilisation et capacité d'inférence croissante. Les montants doivent être recalculés selon la taille du modèle, sa quantification, les exigences de disponibilité, la région d'hébergement et la charge réelle.

Pour l'inférence, le coût unitaire devra être mesuré pendant le pilote :

**Coût par interaction = coût total mensuel d'inférence / nombre d'interactions traitées.**

Il faudra également mesurer le débit, la latence p95, le taux d'utilisation GPU et les besoins de concurrence. Une instance GPU continuellement allumée représente un coût fixe important, même lorsque le volume de requêtes est faible.

#### 4. Synthèse budgétaire

| Poste                           | A            | B             | C             |
| ------------------------------- | ------------ | ------------- | ------------- |
| Équipe projet                   | 36 950 €     | 136 100 €     | 346 250 €     |
| Infrastructure                  | 1 700 €      | 15 000 €      | 51 000 €      |
| Sous-total                      | 38 650 €     | 151 100 €     | 397 250 €     |
| Provision risques (15 %)        | 5 798 €      | 22 665 €      | 59 588 €      |
| **Budget prévisionnel arrondi** | **45 000 €** | **175 000 €** | **455 000 €** |

Ces estimations couvrent la durée de chaque scénario, sans constituer un coût annuel récurrent. Les coûts d'exploitation après projet devront être budgétés séparément.

#### 5. Recommandation à la direction IT

La montée en taille du modèle ne garantit pas une amélioration proportionnelle de la performance. Avant d'investir dans une architecture plus coûteuse, le CHSA devrait :

1. Qualifier les données métiers, leurs droits d'utilisation et leur représentativité.
2. Comparer plusieurs modèles sur un benchmark indépendant et identique.
3. Évaluer les compromis entre qualité, coût d'entraînement, coût d'inférence et contraintes de sécurité.
4. Conditionner chaque investissement supplémentaire à des résultats mesurables et à une validation métier.

**La recommandation n'est donc pas de choisir immédiatement le modèle le plus puissant, mais de financer une progression expérimentale dont chaque étape apporte les preuves nécessaires à la décision suivante.**


## 6. Conseil technique : options de MOE sans préjuger de la décision — [PROPOSITION]

**Constat :** le fine-tuning peut modifier la performance d’un petit modèle sur une tâche ciblée. **Il ne prouve pas** que le fine-tuning est le meilleur choix pour le CHSA, ni qu’une architecture multi-modèles sera préférable.

| Scénario | Atouts potentiels | Risques ou vérifications nécessaires |
|---|---|---|
| Modèle compact affiné localement | Contrôle de l’exécution, spécialisation, réversibilité | Maintenance, généralisation, coûts de réentraînement |
| Modèle général via API | Simplicité initiale, large couverture fonctionnelle | Données, coûts d’usage, dépendance fournisseur |
| ML classique / règles | Baseline interprétable sur variables structurées | Qualité des variables, besoin de validation métier |
| Architecture modulaire (dialogue / constantes / triage supervisé) | Composants testables et remplaçables | Intégration, latence, responsabilité et risques cliniques |

**Leviers de maîtrise d’œuvre envisageables.**
*Data-centric AI* (labels revus avec experts, provenance et couverture) ; baselines gelées ; 
évaluation par sous-population ; 
LoRA/QLoRA ou autres adaptations à coût maîtrisé ;
comparaison contrôlée avec RAG, règles et ML tabulaire selon l’usage ;
versionnement et traçabilité ;
gates avant fusion/déploiement ;
instrumentation, monitoring, rollback. **
Ce sont des pistes à tester**, non des recommandations de tout déployer simultanément.

**Plan d’action pour l’équipe IT — [PROPOSITION]**

1. **Cadrer** : qualifier les usages prioritaires avec les métiers, préciser les données et les critères de succès. *Décision : pertinence du cas d’usage.*
2. **Auditer** : réaliser le data-readiness des données internes : finalité, licéité, représentativité, labels et fuites. *Décision : données utilisables ou non.*
3. **Comparer** : définir test indépendant, baselines règles/ML/LLM et protocole identique. *Décision : poursuite ou abandon de l’approche SFT.*
4. **Sécuriser** : validation clinique et juridique des usages sensibles, tests d’urgence, supervision, abstention. *Décision : autorisation éventuelle d’une observation sans impact patient.*
5. **Arbitrer** : présenter coûts complets, performance, risques, alternatives et responsabilités au comité. *Décision CHSA : GO/NO-GO, budget et architecture.*

## 7. Risques, réglementation et posture de conseil

**Le prototype réel ne constitue pas un dispositif clinique validé.** Dans le scénario, avant traitement de données de santé identifiables : analyser le **RGPD** (article 6 et condition de l’article 9, finalité, minimisation, sécurité, droits, sous-traitants et éventuelle AIPD). Avant un usage médical : évaluer la finalité prévue et la possible qualification comme **logiciel dispositif médical** au titre du règlement **MDR** et des lignes directrices **MDCG 2019-11 rev.1**. Examiner également la classification et les échéances pertinentes de l’**AI Act**. Ces obligations ne sont pas réputées satisfaites par le seul POC.

| Risque | Conséquence | Mesure préalable proposée |
|---|---|---|
| Sous-triage ou mauvaise priorisation | Impact potentiellement critique sur les patients | Tests ciblés, abstention, supervision médicale et escalade |
| Dataset ou labels impropres | Résultats trompeurs | Qualification des sources, revue experte, test indépendant |
| Données de santé / droits de réutilisation | Risque juridique et de confidentialité | Analyse RGPD, licences, habilitations, minimisation |
| Dégradation, latence et coûts | Exploitabilité insuffisante | Benchmarks comparables, budgets, monitoring et rollback |

**Posture professionnelle :** distinguer faits, hypothèses du cas fictif et options ; chiffrer ce qui est réellement mesuré ; expliciter ce qui reste inconnu ; éclairer sans se substituer au décideur. Aucun entretien ou accord réel du CHSA n’est revendiqué.

## 8. Conclusion — décision proposée, pas décision imposée

**La mission remplit son objectif expérimental restreint :** une amélioration est **observée** sur un petit benchmark après spécialisation d’un modèle compact ; le travail démontre une chaîne d’AI Engineering fonctionnelle, un audit ayant changé la trajectoire et une comparaison des choix de packaging.

**L’étape suivante relève de l’organisation :** vérifier les données internes, mesurer sur un benchmark indépendant substantiel, comparer des alternatives plus simples et apprécier la faisabilité juridique et clinique avant toute décision d’exploitation.

> **Recommandation au CHSA fictif : GO conditionnel pour une étude de faisabilité approfondie ; NO-GO pour un déploiement clinique sur la base des preuves actuelles.** Ce n’est pas une décision adoptée par une direction réelle.

**Traçabilité.** Les chiffres et étapes techniques sont repris du rapport de projet transmis. Les acteurs, contraintes institutionnelles, scores de priorisation et jalons de gouvernance sont des éléments **simulés explicitement**. Documents réglementaires : règlement (UE) 2016/679 ; règlement (UE) 2017/745 ; MDCG 2019-11 rev.1 (2025) ; règlement (UE) 2024/1689 tel que modifié. **Projet technique complet :** dépôt / dossier technique à relier depuis le portfolio.

---

*Annexe — Lecture de la grille de compétences : besoins et méthode (§1) ; audit (§2) ; identification/priorisation et compatibilité (§3–4) ; conseil, posture et conformité (§6–7) ; suivi, coûts, performance (§4–5).* 
