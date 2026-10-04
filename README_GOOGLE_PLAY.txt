BEUHBEUH48 V2.1 — Livraison Google Play

IDENTITÉ ANDROID CONSERVÉE
- applicationId : com.beuhbeuh48.game
- versionCode : 3
- versionName : 2.1.0
- minSdk : 24
- targetSdk / compileSdk : 36
- orientation : portrait

BUILD RECOMMANDÉ : GITHUB ACTIONS
Le workflow .github/workflows/build-play-aab.yml compile, signe, vérifie puis publie
l'artefact BEUHBEUH48-V2-Google-Play-AAB.

La clé d'upload V1 doit impérativement être réutilisée. Le workflow V1 l'avait publiée
dans l'artefact GitHub « BEUHBEUH48-KEYSTORE-A-CONSERVER » sous le nom
BEUHBEUH48-upload.jks. Ne générez jamais une nouvelle clé pour cette mise à jour.

Secrets GitHub à configurer :
- BEUHBEUH48_KEYSTORE_BASE64 : contenu Base64 du fichier BEUHBEUH48-upload.jks
- BEUHBEUH48_KEYSTORE_PASSWORD : mot de passe du keystore V1
- BEUHBEUH48_KEY_PASSWORD : mot de passe de la clé V1

Commande Linux pour créer la valeur Base64 :
  base64 -w 0 BEUHBEUH48-upload.jks

Sur macOS :
  base64 < BEUHBEUH48-upload.jks | tr -d '\n'

ADMOB
La V2 utilise uniquement les identifiants de test officiels Google pendant le
développement :
- App ID test : ca-app-pub-3940256099942544~3347511713
- Rewarded test : ca-app-pub-3940256099942544/5224354917
- Interstitial test : ca-app-pub-3940256099942544/1033173712

Avant production :
1. Remplacer ces trois IDs par ceux de l'application AdMob BEUHBEUH48.
2. Configurer le consentement utilisateurs requis dans l'EEE/Royaume-Uni.
3. Vérifier la section Sécurité des données et la politique de confidentialité.
4. Lancer le workflow, télécharger BEUHBEUH48-v2.1.0-code3.aab et l'envoyer en test interne.
5. Ne jamais committer le keystore ni les mots de passe.
