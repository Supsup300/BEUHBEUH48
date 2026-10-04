# Checklist Google Play — BEUHBEUH48 V2.1

## Bundle

- applicationId inchangé : com.beuhbeuh48.game
- versionCode : 3, supérieur à la V1 code 1 et au code 2 réservé à la première livraison V2
- versionName : 2.1.0
- targetSdk et compileSdk : 36
- AAB signé avec BEUHBEUH48-upload.jks de la V1
- test d'installation comme mise à jour de la V1 interne

## Publicités

- les IDs présents dans le code sont les IDs de test officiels Google ;
- ajouter les trois secrets AdMob de production avant le build de production ;
- déclarer que l'application contient des publicités ;
- configurer le consentement EEE/Royaume-Uni dans AdMob ;
- publier un app-ads.txt après création de l'application AdMob.

## Fiche et conformité

- renseigner la politique de confidentialité ;
- compléter Sécurité des données en tenant compte du SDK Google Mobile Ads ;
- compléter la classification du contenu et le questionnaire sur les thèmes du jeu ;
- fournir l'icône 512 × 512, la bannière 1024 × 500 et des captures smartphone ;
- vérifier l'adresse e-mail d'assistance et les coordonnées développeur ;
- tester d'abord la V2 sur la piste de test interne.

## Test de recette Android

- portrait verrouillé et safe areas sur écran avec encoche ;
- swipes rapides sans scroll ni geste système parasite ;
- son, musique et vibrations après retour d'arrière-plan ;
- sauvegarde après arrêt forcé ;
- fonctionnement hors connexion hors publicités ;
- rewarded test : récompense seulement après visionnage complet ;
- Grow Shop : achats, stock, cosmétiques et améliorations conservés après redémarrage ;
- vérifier les cinq jokers pendant une partie longue ;
- vérifier le doublement des pièces et les deux options de seconde chance ;
- interstitielle test : jamais pendant une partie et pas après chaque Game Over.
