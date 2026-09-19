BEUHBEUH48 — Projet Android prêt à compiler pour Google Play

Ce projet encapsule le fichier HTML original dans une WebView Android locale.
Le jeu fonctionne hors ligne et conserve localStorage grâce au DOM Storage de WebView.

CONFIGURATION
- Application ID : com.beuhbeuh48.game
- Version : 1.0.0 (versionCode 1)
- minSdk : 24
- targetSdk / compileSdk : 36 (Android 16)
- Orientation : portrait
- Nom affiché : BEUHBEUH48

POUR PRODUIRE LE .AAB DANS ANDROID STUDIO
1. Installer Android Studio récent et Android SDK 36.
2. Ouvrir le dossier BEUHBEUH48_Android_Project.
3. Laisser Gradle synchroniser le projet.
4. Tester sur un téléphone ou émulateur.
5. Build > Generate Signed App Bundle or APK.
6. Choisir Android App Bundle.
7. Créer un nouveau keystore si c'est la première publication, puis le conserver précieusement.
8. Choisir release et générer.
9. Le fichier app-release.aab obtenu est celui à envoyer dans Play Console.

IMPORTANT
- Ne perdez jamais le keystore / mot de passe de signature.
- Avant publication, testez le jeu sur plusieurs tailles d'écran Android.
- Google Play demande aussi une fiche Store, une icône 512x512, des captures d'écran,
  une classification du contenu et les déclarations de sécurité des données.
