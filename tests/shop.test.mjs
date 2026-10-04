import assert from "node:assert/strict";
import { endRunBonus } from "../app/src/main/assets/meta.js";
import {
  COSMETIC_CATALOG,
  JOKER_CATALOG,
  UPGRADE_CATALOG,
  comboCoinMultiplier,
  dailyRewardMultiplier,
  defaultShopState,
  jokerCapacity,
  jokerPrice,
  moveCoinReward,
  normalizeShopState,
} from "../app/src/main/assets/shop.js";

const shop = defaultShopState();
assert.deepEqual(JOKER_CATALOG.map((item) => item.basePrice), [100, 180, 250, 300, 500]);
assert.equal(jokerCapacity(shop), 2);
assert.equal(jokerPrice("undo", shop), 100);

shop.upgrades.capacity = 2;
shop.upgrades.dailyBonus = 2;
shop.upgrades.comboCoins = 2;
shop.upgrades.jokerDiscount = 2;
assert.equal(jokerCapacity(shop), 4);
assert.equal(dailyRewardMultiplier(shop), 1.3);
assert.equal(comboCoinMultiplier(shop), 1.2);
assert.equal(jokerPrice("freeMerge", shop), 450);

const normalized = normalizeShopState({
  ownedCosmetics: ["tile-neon", "inconnu"],
  equipped: { tile: "tile-neon", pot: "inconnu" },
  upgrades: { capacity: 99, dailyBonus: -3 },
});
assert.equal(normalized.upgrades.capacity, 2);
assert.equal(normalized.upgrades.dailyBonus, 0);
assert.equal(normalized.equipped.tile, "tile-neon");
assert.equal(normalized.equipped.pot, "pot-classic");
assert.ok(COSMETIC_CATALOG.some((item) => item.category === "decor" && item.name === "Serre japonaise"));
assert.equal(UPGRADE_CATALOG.length, 4);

const baseShop = defaultShopState();
const smallMoveCoins = 18 * moveCoinReward({ mergeCount: 1, combo: 1, mergedLevels: [2] }, baseShop)
  + 4 * moveCoinReward({ mergeCount: 2, combo: 2, mergedLevels: [3, 4] }, baseShop);
const smallEnd = endRunBonus({ score: 2000, merges: 26, bestCombo: 2, maxLevel: 6 }).coins;
const smallTotal = smallMoveCoins + smallEnd;
assert.ok(smallTotal >= 30 && smallTotal <= 60, `Petite partie mal équilibrée: ${smallTotal}`);

const goodMoveCoins = 55 * moveCoinReward({ mergeCount: 1, combo: 1, mergedLevels: [3] }, baseShop)
  + 10 * moveCoinReward({ mergeCount: 2, combo: 3, mergedLevels: [6, 7] }, baseShop);
const goodEnd = endRunBonus({ score: 9000, merges: 75, bestCombo: 4, maxLevel: 9 }).coins;
const goodTotal = goodMoveCoins + goodEnd;
assert.ok(goodTotal >= 100 && goodTotal <= 180, `Bonne partie mal équilibrée: ${goodTotal}`);

const excellentMoveCoins = 100 * moveCoinReward({ mergeCount: 1, combo: 1, mergedLevels: [4] }, baseShop)
  + 20 * moveCoinReward({ mergeCount: 3, combo: 4, mergedLevels: [7, 8, 9] }, baseShop);
const excellentEnd = endRunBonus({ score: 30000, merges: 160, bestCombo: 6, maxLevel: 12 }).coins;
const excellentTotal = excellentMoveCoins + excellentEnd;
assert.ok(excellentTotal >= 250, `Excellente partie pas assez récompensée: ${excellentTotal}`);

console.log("BEUHBEUH48 Grow Shop: prix, capacité, cosmétiques et économie validés.");
