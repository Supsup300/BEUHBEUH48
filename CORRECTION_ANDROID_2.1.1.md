# BEUHBEUH48 2.1.1 — correctif Android

Correctif du blocage observé dans la V2 Android : l'interface HTML/CSS s'affichait mais le JavaScript modulaire ne démarrait pas correctement depuis `file:///android_asset/`.

## Correctifs
- chargement des assets via `WebViewAssetLoader` et l'origine HTTPS locale `https://appassets.androidplatform.net/assets/` ;
- conservation des modules ES (`app.js`, `engine.js`, `meta.js`, `shop.js`) sans modifier le gameplay ;
- service worker désactivé dans le conteneur Android natif (inutile pour les assets embarqués) ;
- AdMob reste indépendant du démarrage du jeu ;
- `versionCode 4`, `versionName 2.1.1` ;
- ajout/restauration de `app/build.gradle` avec SDK 36, AdMob et AndroidX WebKit ;
- workflow GitHub mis à jour pour produire `BEUHBEUH48-v2.1.1-code4.aab`.

## Validation
`npm test` : tous les tests moteur, progression, Grow Shop, sources et configuration Android passent.
Le build Android final doit être exécuté par le workflow GitHub, qui possède Gradle et les secrets de signature V1.
