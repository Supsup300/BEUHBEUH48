import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const root = "app/src/main/assets/";
const html = readFileSync(root + "index.html", "utf8");
const app = readFileSync(root + "app.js", "utf8");
const css = readFileSync(root + "styles.css", "utf8");
const worker = readFileSync(root + "sw.js", "utf8");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "Les identifiants HTML doivent être uniques.");

const queriedIds = [...app.matchAll(/\$\("#([A-Za-z0-9_-]+)"\)/g)].map((match) => match[1]);
queriedIds.forEach((id) => assert.ok(ids.includes(id), `Élément HTML manquant pour #${id}`));

["joker-undo", "joker-remove", "joker-shuffle", "joker-sprout", "joker-free-merge"].forEach((id) => {
  assert.ok(ids.includes(id), `Joker manquant: ${id}`);
});
["shop-modal", "shop-jokers", "shop-cosmetics", "shop-upgrades", "claim-chest", "claim-chest-ad"].forEach((id) => {
  assert.ok(ids.includes(id), `Élément Grow Shop manquant: ${id}`);
});

assert.match(css, /grid-template-columns: repeat\(5, 1fr\)/);
assert.match(css, /data-tile-skin="neon"/);
assert.match(css, /data-decor="japanese"/);
assert.match(worker, /shop\.js/);

for (const asset of ["index.html", "styles.css", "app.js", "engine.js", "meta.js", "shop.js", "assets/grow-room.webp", "assets/plants-atlas.webp", "assets/ultimate-plants.webp"]) {
  assert.ok(existsSync(root + asset), `Fichier Web manquant: ${asset}`);
}

console.log("BEUHBEUH48 source: DOM, Grow Shop, cosmétiques et cache hors ligne validés.");
