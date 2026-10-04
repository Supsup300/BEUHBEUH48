# Rapport de validation — BEUHBEUH48 V2.1

Date : 30 septembre 2026

## Tests automatisés

- déplacements et fusions dans les quatre directions ;
- règle « une seule fusion par tuile et par mouvement » ;
- détection Game Over ;
- fusion Graine dorée ;
- mélange avec conservation de toutes les valeurs et identifiants ;
- seconde chance : trois cases libérées sans supprimer la meilleure évolution ;
- courbe XP progressive ;
- objectifs et récompenses ;
- défi quotidien stable pour une date et renouvelé le lendemain ;
- décors débloqués par niveau ;
- prix des cinq jokers et réductions permanentes ;
- capacité de stock 2 → 3 → 4 ;
- normalisation d'une ancienne sauvegarde V2 sans Grow Shop ;
- trois profils économiques : petite partie 30–60, bonne partie 100–180, excellente partie 250+ pièces ;
- présence des cinq familles cosmétiques et cache hors connexion du Grow Shop ;
- applicationId, versionCode, targetSdk, orientation et dépendance AdMob ;
- workflow de signature : aucune génération de nouvelle clé, vérification du AAB.

## Vérifications navigateur et publication

La base V2 avait déjà été contrôlée dans un navigateur sur les points suivants :

- premier lancement et tutoriel ;
- déplacement clavier équivalent à un swipe ;
- fusion et apparition rapide d'une nouvelle tuile ;
- enchaînement rapide de 12 commandes sans blocage ;
- progression XP et pièces ;
- découverte animée ;
- Herbier avec exactement 20 évolutions et silhouettes ;
- Supprimer, Mélanger et Annuler ;
- défi quotidien et compteur de mouvements ;
- réglages Son, Musique et Vibrations ;
- statistiques ;
- sauvegarde et restauration après rechargement ;
- aucune erreur JavaScript provenant du domaine du jeu.

Pour la V2.1 Grow Shop :

- un scénario Playwright couvre l'achat d'un joker, le débit exact, Pousse,
  Fusion libre, les deux secondes chances, la sauvegarde et un écran 320 × 568 ;
- l'exécution Playwright locale nécessite un binaire Chromium, absent de
  l'environnement de livraison ; le scénario reste inclus dans `tests/ui.test.mjs` ;
- la version publiée répond en HTTPS et sert bien `app.js`, `shop.js`,
  `styles.css` ainsi que l'accueil V2.1 avec le Grow Shop ;
- les tests Node valident toute la logique pure de la boutique, des prix, des
  capacités, des améliorations et de l'équilibrage des gains.

## Validation Android restante sur appareil

Le workflow produit l'AAB signé dès que les trois secrets de la clé V1 sont
présents. Avant la mise en production, valider sur au moins un téléphone API 24,
un téléphone API 36 et un petit écran portrait :

- gestes tactiles rapides et absence de scroll ;
- retour haptique réel ;
- publicité récompensée de test, fermeture anticipée et absence de réseau ;
- coffre quotidien normal et amélioré ;
- doublement des pièces après la partie ;
- seconde chance par publicité et par 300 pièces ;
- interstitielle uniquement à une pause naturelle toutes les trois à quatre parties ;
- fermeture forcée puis restauration ;
- installation de mise à jour au-dessus de la V1 interne.
