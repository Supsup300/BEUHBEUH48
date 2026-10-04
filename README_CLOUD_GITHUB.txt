BEUHBEUH48 V2.1 — COMPILATION GOOGLE PLAY SANS ANDROID STUDIO

Ce projet contient un workflow GitHub Actions qui teste le jeu, compile le bundle,
le signe avec la clé V1, vérifie la signature puis publie l'AAB téléchargeable.

IMPORTANT : la V2 ne crée jamais une nouvelle clé. Récupérer le fichier
BEUHBEUH48-upload.jks de l'artefact V1 « BEUHBEUH48-KEYSTORE-A-CONSERVER »,
puis configurer les trois secrets décrits dans README_GOOGLE_PLAY.txt.

Package Android : com.beuhbeuh48.game
Version : 2.1.0 (versionCode 3)
Workflow : .github/workflows/build-play-aab.yml
