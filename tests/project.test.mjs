import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const gradle = readFileSync("app/build.gradle", "utf8");
const manifest = readFileSync("app/src/main/AndroidManifest.xml", "utf8");
const workflow = readFileSync(".github/workflows/build-play-aab.yml", "utf8");
const app = readFileSync("app/src/main/assets/app.js", "utf8");

assert.match(gradle, /applicationId 'com\.beuhbeuh48\.game'/);
assert.match(gradle, /versionCode 4/);
assert.match(gradle, /versionName '2\.1\.1'/);
assert.match(gradle, /targetSdk 36/);
assert.match(gradle, /play-services-ads:25\.5\.0/);
assert.match(manifest, /android:screenOrientation="portrait"/);
assert.match(manifest, /\$\{admobAppId\}/);
assert.doesNotMatch(workflow, /keytool -genkeypair/, "Le workflow V2 ne doit jamais recréer la clé V1.");
assert.match(workflow, /BEUHBEUH48_KEYSTORE_BASE64/);
assert.match(workflow, /jarsigner -verify/);
assert.doesNotMatch(workflow, /keytool -list \+/);
assert.ok(existsSync("app/src/main/assets/assets/ultimate-plants.webp"));
assert.ok(existsSync("app/src/main/assets/sw.js"));
assert.ok(existsSync("app/src/main/assets/shop.js"));
assert.match(app, /Floraison Infinie/);
assert.match(app, /SAVE_KEY_V2/);
assert.match(app, /openShop/);
assert.match(app, /doubleRunCoins/);
assert.match(workflow, /BEUHBEUH48-v2\.1\.1-code4\.aab/);

console.log("BEUHBEUH48 Android: identité, version, AdMob et signature validés.");

const activity = readFileSync("app/src/main/java/com/beuhbeuh48/game/MainActivity.java", "utf8");
assert.match(activity, /WebViewAssetLoader/);
assert.match(activity, /https:\/\/appassets\.androidplatform\.net\/assets\/index\.html/);
assert.doesNotMatch(activity, /file:\/\/\/android_asset\/index\.html/);
