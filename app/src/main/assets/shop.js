export const JOKER_CATALOG = Object.freeze([
  { id: "undo", name: "Annuler le dernier coup", shortName: "ANNULER", icon: "↩", basePrice: 100 },
  { id: "remove", name: "Supprimer une tuile", shortName: "SUPPRIMER", icon: "✂", basePrice: 180 },
  { id: "shuffle", name: "Mélanger la grille", shortName: "MÉLANGER", icon: "↝", basePrice: 250 },
  { id: "sprout", name: "Faire apparaître une petite plante", shortName: "POUSSE", icon: "🌱", basePrice: 300 },
  { id: "freeMerge", name: "Fusion libre de 2 tuiles", shortName: "FUSION", icon: "🧬", basePrice: 500 },
]);

export const COSMETIC_CATALOG = Object.freeze([
  { id: "pot-classic", category: "pot", name: "Pot classique", value: "classic", price: 0 },
  { id: "pot-terracotta", category: "pot", name: "Terre cuite", value: "terracotta", price: 450 },
  { id: "pot-ceramic", category: "pot", name: "Céramique ivoire", value: "ceramic", price: 750 },
  { id: "pot-chrome", category: "pot", name: "Chrome botanique", value: "chrome", price: 1100 },
  { id: "tile-classic", category: "tile", name: "Tuile classique", value: "classic", price: 0 },
  { id: "tile-ivory", category: "tile", name: "Herbier ivoire", value: "ivory", price: 650 },
  { id: "tile-neon", category: "tile", name: "Contour néon", value: "neon", price: 950 },
  { id: "tile-obsidian", category: "tile", name: "Obsidienne", value: "obsidian", price: 1400 },
  { id: "decor-retro", category: "decor", name: "Serre rétro", value: "retro", price: 900 },
  { id: "decor-neon", category: "decor", name: "Grow room néon", value: "neon", price: 1200 },
  { id: "decor-california", category: "decor", name: "Jardin californien", value: "california", price: 1500 },
  { id: "decor-botanic", category: "decor", name: "Laboratoire botanique", value: "botanic", price: 1800 },
  { id: "decor-japanese", category: "decor", name: "Serre japonaise", value: "japanese", price: 2200 },
  { id: "effect-pollen", category: "effect", name: "Pollen doré", value: "pollen", price: 0 },
  { id: "effect-sparks", category: "effect", name: "Étincelles néon", value: "sparks", price: 800 },
  { id: "effect-prism", category: "effect", name: "Prisme cosmique", value: "prism", price: 1300 },
  { id: "animation-bounce", category: "animation", name: "Rebond express", value: "bounce", price: 0 },
  { id: "animation-pulse", category: "animation", name: "Pulsation végétale", value: "pulse", price: 700 },
  { id: "animation-flare", category: "animation", name: "Éclosion lumineuse", value: "flare", price: 1200 },
]);

export const UPGRADE_CATALOG = Object.freeze([
  {
    id: "capacity",
    name: "Étagère à jokers",
    description: "Capacité de chaque joker : 2 → 3 → 4.",
    costs: [700, 1500],
  },
  {
    id: "dailyBonus",
    name: "Coffre quotidien +",
    description: "Récompenses quotidiennes : +15 %, puis +30 %.",
    costs: [900, 1800],
  },
  {
    id: "comboCoins",
    name: "Culture en chaîne",
    description: "Pièces des combos ×3 et plus : +10 %, puis +20 %.",
    costs: [1200, 2400],
  },
  {
    id: "jokerDiscount",
    name: "Carte du Grow Shop",
    description: "Prix des jokers : −5 %, puis −10 %.",
    costs: [1600, 3200],
  },
]);

const DEFAULT_OWNED = ["pot-classic", "tile-classic", "effect-pollen", "animation-bounce"];
const DEFAULT_EQUIPPED = {
  pot: "pot-classic",
  tile: "tile-classic",
  effect: "effect-pollen",
  animation: "animation-bounce",
};

export function defaultShopState() {
  return {
    ownedCosmetics: [...DEFAULT_OWNED],
    equipped: { ...DEFAULT_EQUIPPED },
    upgrades: { capacity: 0, dailyBonus: 0, comboCoins: 0, jokerDiscount: 0 },
    dailyChestDate: "",
    purchases: 0,
  };
}

export function normalizeShopState(raw) {
  const defaults = defaultShopState();
  const knownCosmetics = new Set(COSMETIC_CATALOG.map((item) => item.id));
  const owned = Array.isArray(raw && raw.ownedCosmetics)
    ? raw.ownedCosmetics.filter((id) => knownCosmetics.has(id))
    : [];
  DEFAULT_OWNED.forEach((id) => owned.push(id));
  const ownedCosmetics = [...new Set(owned)];
  const upgrades = {};
  UPGRADE_CATALOG.forEach((item) => {
    const level = Number(raw && raw.upgrades && raw.upgrades[item.id]);
    upgrades[item.id] = Math.min(item.costs.length, Math.max(0, Number.isFinite(level) ? Math.floor(level) : 0));
  });
  const equipped = { ...DEFAULT_EQUIPPED };
  Object.keys(equipped).forEach((category) => {
    const candidate = raw && raw.equipped && raw.equipped[category];
    const item = COSMETIC_CATALOG.find((entry) => entry.id === candidate && entry.category === category);
    if (item && ownedCosmetics.includes(item.id)) equipped[category] = item.id;
  });
  return {
    ...defaults,
    ...(raw || {}),
    ownedCosmetics,
    equipped,
    upgrades,
    dailyChestDate: String(raw && raw.dailyChestDate || ""),
    purchases: Math.max(0, Number(raw && raw.purchases) || 0),
  };
}

export function jokerDefinition(id) {
  return JOKER_CATALOG.find((item) => item.id === id) || null;
}

export function cosmeticDefinition(id) {
  return COSMETIC_CATALOG.find((item) => item.id === id) || null;
}

export function upgradeDefinition(id) {
  return UPGRADE_CATALOG.find((item) => item.id === id) || null;
}

export function jokerCapacity(shop) {
  return 2 + Math.min(2, Math.max(0, Number(shop && shop.upgrades && shop.upgrades.capacity) || 0));
}

export function jokerPrice(id, shop) {
  const item = jokerDefinition(id);
  if (!item) return 0;
  const level = Math.min(2, Math.max(0, Number(shop && shop.upgrades && shop.upgrades.jokerDiscount) || 0));
  return Math.round(item.basePrice * (1 - level * .05));
}

export function dailyRewardMultiplier(shop) {
  const level = Math.min(2, Math.max(0, Number(shop && shop.upgrades && shop.upgrades.dailyBonus) || 0));
  return 1 + level * .15;
}

export function comboCoinMultiplier(shop) {
  const level = Math.min(2, Math.max(0, Number(shop && shop.upgrades && shop.upgrades.comboCoins) || 0));
  return 1 + level * .1;
}

export function ownedShopDecorIds(shop) {
  const owned = new Set(shop && shop.ownedCosmetics || []);
  return COSMETIC_CATALOG
    .filter((item) => item.category === "decor" && owned.has(item.id))
    .map((item) => item.value);
}

export function cosmeticItemForValue(category, value) {
  return COSMETIC_CATALOG.find((item) => item.category === category && item.value === value) || null;
}

export function moveCoinReward({ mergeCount, combo, mergedLevels = [] }, shop) {
  const merges = Math.max(0, Number(mergeCount) || 0);
  if (!merges) return 0;
  const safeCombo = Math.max(1, Number(combo) || 1);
  const rarityBonus = mergedLevels.reduce((total, level) => total + Math.max(0, Math.floor((Number(level) - 5) / 3)), 0);
  const base = merges * (1 + Math.max(0, safeCombo - 1) * .38) + rarityBonus;
  const multiplier = safeCombo >= 3 ? comboCoinMultiplier(shop) : 1;
  return Math.max(1, Math.round(base * multiplier));
}
