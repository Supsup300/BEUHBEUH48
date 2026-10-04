import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const playwrightPath = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + "/playwright"
  : "playwright";
const { chromium } = require(playwrightPath);

const baseUrl = process.env.BB48_TEST_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true });
const page = await context.newPage();

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.waitForFunction(() => Boolean(window.__BEUHBEUH48__));
assert.equal(await page.locator("#tutorial-modal").isVisible(), true, "Le tutoriel doit apparaître au premier lancement.");
await page.click("#skip-tutorial");

await page.evaluate(() => window.__BEUHBEUH48__.setResourcesForTest({ coins: 1000, inventory: { undo: 0 } }));
await page.click("#home-logo");
await page.click("#home-shop");
assert.equal(await page.locator("#shop-jokers .shop-item").count(), 5, "Le Grow Shop doit proposer cinq jokers.");
const shopCoinsBefore = (await page.evaluate(() => window.__BEUHBEUH48__.getState())).meta.coins;
await page.locator("#shop-jokers .shop-buy").first().click();
const afterShopPurchase = await page.evaluate(() => window.__BEUHBEUH48__.getState());
assert.equal(afterShopPurchase.meta.inventory.undo, 1, "Un joker acheté doit rejoindre le stock.");
assert.equal(afterShopPurchase.meta.coins, shopCoinsBefore - 100, "Le Grow Shop doit débiter le prix exact.");
await page.click("#shop-modal [data-close]");

const fitsViewport = await page.evaluate(() => ({
  scrollHeight: document.scrollingElement.scrollHeight,
  innerHeight: window.innerHeight,
  board: document.querySelector("#board").getBoundingClientRect().toJSON(),
  nav: document.querySelector(".bottom-nav").getBoundingClientRect().toJSON(),
}));
assert.ok(fitsViewport.scrollHeight <= fitsViewport.innerHeight + 1, "La page ne doit pas scroller.");
assert.ok(fitsViewport.board.top >= 0 && fitsViewport.board.bottom <= fitsViewport.innerHeight);
assert.ok(fitsViewport.nav.bottom <= fitsViewport.innerHeight + 1);

await page.evaluate(() => window.__BEUHBEUH48__.setGridForTest([
  [0, 0, null, null],
  [1, 1, null, null],
  [null, null, null, null],
  [null, null, null, null],
]));
const beforeMove = await page.evaluate(() => window.__BEUHBEUH48__.getState());
assert.equal(await page.evaluate(() => window.__BEUHBEUH48__.move("left")), true);
await page.waitForTimeout(250);
const afterMove = await page.evaluate(() => window.__BEUHBEUH48__.getState());
assert.ok(afterMove.score > beforeMove.score);

await page.click("#joker-undo");
await page.waitForTimeout(80);
const afterUndo = await page.evaluate(() => window.__BEUHBEUH48__.getState());
assert.equal(afterUndo.score, beforeMove.score, "Annuler doit restaurer le score exact.");
assert.deepEqual(
  afterUndo.grid.map((row) => row.map((tile) => tile && tile.level)),
  [[0, 0, null, null], [1, 1, null, null], [null, null, null, null], [null, null, null, null]],
);

const valuesBeforeShuffle = (await page.evaluate(() => window.__BEUHBEUH48__.getState())).grid.flat().filter(Boolean).map((tile) => tile.level).sort();
await page.click("#joker-shuffle");
await page.waitForTimeout(80);
const valuesAfterShuffle = (await page.evaluate(() => window.__BEUHBEUH48__.getState())).grid.flat().filter(Boolean).map((tile) => tile.level).sort();
assert.deepEqual(valuesAfterShuffle, valuesBeforeShuffle, "Mélanger doit conserver toutes les valeurs.");

const tileCountBeforeRemove = await page.locator(".tile").count();
await page.click("#joker-remove");
await page.locator(".tile").first().click();
await page.waitForTimeout(80);
assert.equal(await page.locator(".tile").count(), tileCountBeforeRemove - 1, "Supprimer doit retirer exactement une tuile.");

await page.evaluate(() => {
  window.__BEUHBEUH48__.setGridForTest([
    [0, 2, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ]);
  window.__BEUHBEUH48__.setResourcesForTest({ inventory: { sprout: 1, freeMerge: 1 } });
});
await page.click("#joker-sprout");
await page.waitForTimeout(80);
assert.equal(await page.locator(".tile").count(), 3, "Le joker Pousse doit ajouter exactement une petite plante.");
await page.click("#joker-free-merge");
await page.locator(".tile").nth(0).click();
await page.locator(".tile").nth(1).click();
await page.waitForTimeout(100);
assert.equal(await page.locator(".tile").count(), 2, "La Fusion libre doit remplacer deux tuiles par une seule.");
if (await page.locator("#discovery-modal").isVisible()) await page.click("#discovery-continue");

await page.click("#nav-herbarium");
assert.equal(await page.locator(".herb-card").count(), 20, "L’Herbier doit contenir 20 évolutions.");
await page.click("#herbarium-modal [data-close]");

await page.click("#nav-daily");
assert.equal(await page.locator("#daily-modal").isVisible(), true);
assert.ok((await page.locator("#daily-rule").textContent()).length > 10);
await page.click("#daily-modal [data-close]");

const persistedScore = (await page.evaluate(() => window.__BEUHBEUH48__.getState())).score;
await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() => Boolean(window.__BEUHBEUH48__));
assert.equal((await page.evaluate(() => window.__BEUHBEUH48__.getState())).score, persistedScore, "La partie doit survivre à une réouverture.");

await page.evaluate(() => window.__BEUHBEUH48__.setGridForTest([
  [0, 1, 0, 1], [1, 0, 1, 0], [0, 1, 0, 1], [1, 0, 1, 0],
]));
await page.waitForTimeout(80);
assert.equal(await page.locator("#game-over-modal").isVisible(), true);
assert.equal(await page.locator("#second-chance").isVisible(), true);
assert.equal(await page.locator("#second-chance-coins").isVisible(), true, "La seconde chance doit aussi être achetable avec 300 pièces.");
await page.click("#second-chance");
await page.waitForTimeout(1500);
await page.click("#ad-close");
await page.waitForTimeout(100);
const continued = await page.evaluate(() => window.__BEUHBEUH48__.getState());
assert.equal(continued.gameOver, false, "La seconde chance doit reprendre la partie.");
assert.ok(continued.grid.flat().filter(Boolean).length <= 13, "La seconde chance doit libérer plusieurs cases.");

await page.setViewportSize({ width: 320, height: 568 });
await page.waitForTimeout(100);
const small = await page.evaluate(() => ({
  scrollHeight: document.scrollingElement.scrollHeight,
  innerHeight: window.innerHeight,
  bodyWidth: document.body.scrollWidth,
  innerWidth: window.innerWidth,
}));
assert.ok(small.scrollHeight <= small.innerHeight + 1, "Le petit écran ne doit pas scroller verticalement.");
assert.ok(small.bodyWidth <= small.innerWidth + 1, "Le petit écran ne doit pas déborder horizontalement.");

await browser.close();
console.log("BEUHBEUH48 UI: tactile, jokers, sauvegarde, Herbier, défi et seconde chance validés.");
