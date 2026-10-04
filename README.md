# BEUHBEUH48 V2.1 — Grow Shop

BEUHBEUH48 V2 fait évoluer le jeu 2048 V1 sans changer son identité : même grille
4 × 4, même univers de serre, sauvegarde V1 migrée automatiquement, et une boucle
de progression complète.

## Contenu de la V2

- 20 évolutions illustrées et Herbier permanent ;
- combos, XP, niveaux, pièces et récompenses équilibrées par profil de partie ;
- trois objectifs simultanés et défi quotidien déterministe ;
- Grow Shop avec cinq jokers stockables : Annuler, Supprimer, Mélanger, Pousse et Fusion libre ;
- pots, skins, décors, effets et animations cosmétiques équipables ;
- quatre améliorations permanentes limitées à deux niveaux ;
- coffre quotidien gratuit ou amélioré par publicité récompensée ;
- une seule seconde chance par partie, via publicité récompensée ou 300 pièces ;
- doublement volontaire des pièces en fin de partie ;
- sept décors de progression et cinq décors achetables ;
- Graine dorée, Double XP et Fusion parfaite ;
- statistiques, tutoriel, sons, musique et vibrations ;
- sauvegarde automatique locale et cache Web hors connexion ;
- AdMob Android réel avec IDs de test officiels ;
- interstitielle limitée à une pause naturelle toutes les trois à quatre parties.

## Architecture

- app/src/main/assets/ : version Web complète, utilisée telle quelle dans la WebView ;
- app/src/main/java/.../MainActivity.java : pont Android, vibrations et AdMob ;
- tests/ : moteur, progression et garde-fous Android ;
- .github/workflows/build-play-aab.yml : AAB signé à partir de la clé V1.

## Vérification rapide

    npm test

Le jeu Android reste jouable hors connexion. Les publicités ont naturellement
besoin du réseau et échouent proprement si aucune annonce n'est disponible.

## Build Google Play

Voir README_GOOGLE_PLAY.txt. La clé d'upload V1 est obligatoire pour que Google
Play accepte le bundle comme mise à jour de com.beuhbeuh48.game.
