import {
  GRID_SIZE,
  computeMove,
  emptyCells,
  gridFromLevels,
  isGameOver,
  makeEmptyGrid,
  secondChanceGrid,
  shuffledGrid,
  tileValue,
} from "./engine.js";
import {
  DECORS,
  PLANT_COUNT,
  SAVE_KEY_V1,
  SAVE_KEY_V2,
  createObjective,
  dailyChallengeFor,
  endRunBonus,
  localDateKey,
  objectiveProgress,
  progressFromXp,
  unlockedDecorIds,
} from "./meta.js";
import {
  COSMETIC_CATALOG,
  JOKER_CATALOG,
  UPGRADE_CATALOG,
  cosmeticDefinition,
  dailyRewardMultiplier,
  defaultShopState,
  jokerCapacity,
  jokerPrice,
  moveCoinReward,
  normalizeShopState,
  ownedShopDecorIds,
} from "./shop.js";

const MOVE_MS = 112;
const numberFormat = new Intl.NumberFormat("fr-FR");
const SECOND_CHANCE_PRICE = 300;
const COSMETIC_CATEGORY_LABELS = {
  pot: "POTS",
  tile: "SKINS DE TUILES",
  decor: "DÉCORS",
  effect: "EFFETS DE FUSION",
  animation: "ANIMATIONS",
};
const COSMETIC_SWATCHES = {
  pot: "#df8a59",
  tile: "#8ed85d",
  decor: "#6fdad0",
  effect: "#f2b553",
  animation: "#b67aef",
};

const LEVELS = [
  { name: "Mâle", rarity: "COMMUNE", color: "#77b94a", scale: .88, description: "Fin, discret, mais persuadé d’être indispensable." },
  { name: "Femelle", rarity: "COMMUNE", color: "#8fd451", scale: .92, description: "Plus fournie, plus sûre d’elle, déjà très demandée." },
  { name: "Northern Spark", rarity: "COMMUNE", color: "#66bd63", scale: .95, description: "Une hybride qui a lu la notice après le montage." },
  { name: "Purple Mist", rarity: "ATYPIQUE", color: "#a86be5", scale: .98, description: "Violette, dense et légèrement trop mystérieuse." },
  { name: "Lemon Rocket", rarity: "ATYPIQUE", color: "#b9df45", scale: 1, description: "Acidulée dans l’attitude, orbitale dans l’ambition." },
  { name: "Blue Dreamer", rarity: "RARE", color: "#4fc6c8", scale: 1.01, description: "Elle plane surtout au-dessus de sa propre réputation." },
  { name: "Gorilla King", rarity: "RARE", color: "#7f9f58", scale: 1.02, description: "Un buisson qui prend deux sièges dans le métro." },
  { name: "White Widow XXL", rarity: "RARE", color: "#dfe9d8", scale: 1.03, description: "Givrée, massive, impossible à présenter aux voisins." },
  { name: "Amnesia Titan", rarity: "ÉPIQUE", color: "#c7ad6a", scale: 1.04, description: "On oublie pourquoi on est venu, jamais sa silhouette." },
  { name: "OG Colossus", rarity: "ÉPIQUE", color: "#8eae58", scale: 1.05, description: "À ce stade, le pot paie probablement un loyer." },
  { name: "Purple God", rarity: "ÉPIQUE", color: "#c067ef", scale: 1.05, description: "Une aura divine et zéro sens de la discrétion." },
  { name: "BEUHBEUH48", rarity: "LÉGENDAIRE", color: "#5fe38c", scale: 1.06, description: "La légende a poussé. Le plafond, lui, a démissionné." },
  { name: "Nebula Kush", rarity: "LÉGENDAIRE", color: "#5ed5ff", scale: 1.06, description: "Cultivée quelque part entre deux constellations." },
  { name: "Cristal Ancien", rarity: "LÉGENDAIRE", color: "#9bcfff", scale: 1.07, description: "Rare, brillante, et probablement plus vieille que le Wi-Fi." },
  { name: "Soleil Vert", rarity: "MYTHIQUE", color: "#ff9a3c", scale: 1.07, description: "Un petit astre avec de très gros besoins en arrosage." },
  { name: "Couronne Cosmique", rarity: "MYTHIQUE", color: "#ef72e5", scale: 1.08, description: "La botanique vient officiellement de perdre le contrôle." },
  { name: "Cathédrale Émeraude", rarity: "MYTHIQUE", color: "#62ef9f", scale: .95, description: "Chaque feuille ressemble à un vitrail vivant." },
  { name: "Canopée Astrale", rarity: "TRANSCENDANTE", color: "#57cbff", scale: .95, description: "Ses branches semblent soutenir leur propre galaxie." },
  { name: "Éden Quantique", rarity: "TRANSCENDANTE", color: "#f461e9", scale: .96, description: "Elle pousse dans plusieurs réalités à la fois." },
  { name: "Floraison Infinie", rarity: "ULTIME", color: "#ffe69a", scale: .97, description: "La dernière évolution. La serre vient de toucher l’infini." },
];

const RARITY_COLORS = {
  COMMUNE: "#91d455",
  ATYPIQUE: "#62d4d0",
  RARE: "#68a9ff",
  "ÉPIQUE": "#b86bf3",
  "LÉGENDAIRE": "#f5b74c",
  MYTHIQUE: "#ff718f",
  TRANSCENDANTE: "#65eddf",
  ULTIME: "#fff0a9",
};

const COMBO_TEXT = {
  2: "COMBO ×2",
  3: "COMBO ×3",
  4: "COMBO ×4",
  5: "MEGA FUSION ×5",
};

const TUTORIAL = [
  { title: "GLISSE POUR JOUER", copy: "Fais glisser ton doigt dans une direction. La page reste fixe, seules les plantes bougent.", icon: "☝" },
  { title: "FUSIONNE LES DOUBLES", copy: "Deux plantes identiques se réunissent pour créer l’évolution suivante.", icon: "2 + 2" },
  { title: "ENCHAÎNE LES COMBOS", copy: "Plusieurs fusions dans un mouvement ou une série efficace augmentent tes récompenses.", icon: "×4" },
  { title: "COMPLÈTE L’HERBIER", copy: "Découvre les 20 évolutions, débloque les décors et fais pousser la légende.", icon: "20" },
];

const $ = (selector) => document.querySelector(selector);
const elements = {
  board: $("#board"),
  tileLayer: $("#tile-layer"),
  combo: $("#combo-banner"),
  event: $("#event-banner"),
  removeHint: $("#remove-hint"),
  score: $("#score"),
  best: $("#best-score"),
  scoreDelta: $("#score-delta"),
  level: $("#player-level"),
  xpCopy: $("#xp-copy"),
  xpFill: $("#xp-fill"),
  coins: $("#coins"),
  coinGain: $("#coin-gain"),
  objectivePreview: $("#objective-preview"),
  objectiveKicker: $("#objective-kicker"),
  objectiveLabel: $("#objective-label"),
  objectiveFill: $("#objective-fill"),
  modeLabel: $("#mode-label"),
  movesLabel: $("#moves-label"),
  runBonus: $("#run-bonus"),
  doubleXpMoves: $("#double-xp-moves"),
  removeStock: $("#remove-stock"),
  shuffleStock: $("#shuffle-stock"),
  undoStock: $("#undo-stock"),
  sproutStock: $("#sprout-stock"),
  freeMergeStock: $("#free-merge-stock"),
  dailyDot: $("#daily-dot"),
  toast: $("#toast-region"),
  srStatus: $("#sr-status"),
};

let state;
let inputLocked = false;
let pointerStart = null;
let removeMode = false;
let freeMergeMode = false;
let freeMergeSelection = [];
let idSequence = 0;
let comboTimer = 0;
let eventTimer = 0;
let coinTimer = 0;
let resizeFrame = 0;
let discoveryQueue = [];
let pendingEndScreen = false;
let tutorialIndex = 0;
let lastFocus = null;
let activeSince = Date.now();
let pendingAd = null;
let activeShopTab = "jokers";
const tileElements = new Map();

function createId() {
  idSequence += 1;
  return "plant-" + Date.now().toString(36) + "-" + idSequence.toString(36);
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultStats() {
  return {
    games: 0,
    gamesCompleted: 0,
    totalMerges: 0,
    totalMoves: 0,
    maxLevel: 1,
    maxCombo: 1,
    levelBest: { 0: 0, 1: 0 },
    dailyCompleted: 0,
    playTimeMs: 0,
    jokersUsed: 0,
    shopPurchases: 0,
    coinsSpent: 0,
    rewardedAds: 0,
  };
}

function defaultRun(mode = "normal") {
  return {
    mode,
    grid: makeEmptyGrid(),
    score: 0,
    moves: 0,
    merges: 0,
    maxLevel: 1,
    bestCombo: 1,
    comboStreak: 0,
    comboEvents: 0,
    bigMerges: 0,
    xpEarned: 0,
    coinsEarned: 0,
    discoveries: 0,
    objectivesCompleted: 0,
    doubleXpMoves: 0,
    secondChanceUsed: false,
    gameOver: false,
    dailyWon: false,
    coinsDoubled: false,
    recordBonusGranted: false,
    startingBest: 0,
    endReason: "",
    finalized: false,
    startedAt: Date.now(),
  };
}

function defaultMeta() {
  return {
    totalXp: 0,
    coins: 120,
    discovered: [0, 1],
    stats: defaultStats(),
    objectives: [createObjective(0), createObjective(1), createObjective(2)],
    nextObjectiveIndex: 3,
    inventory: { remove: 1, shuffle: 1, undo: 1, sprout: 0, freeMerge: 0 },
    shop: defaultShopState(),
    settings: { sound: true, music: true, vibration: true },
    selectedDecor: "urban",
    tutorialDone: false,
    daily: { completedDate: "", lastPlayedDate: "" },
    gamesSinceInterstitial: 0,
    interstitialTarget: 4,
  };
}

function defaultState() {
  return {
    version: 2,
    best: 0,
    meta: defaultMeta(),
    run: defaultRun(),
    undo: null,
    normalRunBackup: null,
  };
}

function normalizeGrid(rawGrid) {
  if (!Array.isArray(rawGrid) || rawGrid.length !== GRID_SIZE) return null;
  const grid = makeEmptyGrid();
  const ids = new Set();
  for (let row = 0; row < GRID_SIZE; row += 1) {
    if (!Array.isArray(rawGrid[row]) || rawGrid[row].length !== GRID_SIZE) return null;
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const raw = rawGrid[row][col];
      if (raw === null) continue;
      const level = Number(raw && raw.level);
      if (!Number.isInteger(level) || level < 0 || level > 99) return null;
      let id = typeof raw.id === "string" && raw.id ? raw.id : createId();
      if (ids.has(id)) id = createId();
      ids.add(id);
      grid[row][col] = {
        id,
        level,
        row,
        col,
        ...(raw.special === "golden" ? { special: "golden" } : {}),
      };
    }
  }
  return grid;
}

function normalizeRun(raw, fallbackMode = "normal") {
  const base = defaultRun(raw && raw.mode === "daily" ? "daily" : fallbackMode);
  const grid = normalizeGrid(raw && raw.grid);
  if (!grid) return null;
  const run = { ...base, ...raw, grid };
  const numberKeys = [
    "score", "moves", "merges", "maxLevel", "bestCombo", "comboStreak",
    "comboEvents", "bigMerges", "xpEarned", "coinsEarned", "discoveries",
    "objectivesCompleted", "doubleXpMoves",
  ];
  numberKeys.forEach((key) => { run[key] = Math.max(0, Number(run[key]) || 0); });
  run.mode = raw && raw.mode === "daily" ? "daily" : "normal";
  run.secondChanceUsed = Boolean(run.secondChanceUsed);
  run.gameOver = Boolean(run.gameOver);
  run.dailyWon = Boolean(run.dailyWon);
  run.coinsDoubled = Boolean(run.coinsDoubled);
  run.recordBonusGranted = Boolean(run.recordBonusGranted);
  run.startingBest = Math.max(0, Number(run.startingBest) || 0);
  run.finalized = Boolean(run.finalized);
  run.endReason = typeof run.endReason === "string" ? run.endReason : "";
  return run;
}

function normalizeObjectives(raw) {
  if (!Array.isArray(raw) || raw.length !== 3) {
    return [createObjective(0), createObjective(1), createObjective(2)];
  }
  return raw.map((objective, index) => {
    const fallback = createObjective(index);
    return {
      ...fallback,
      ...objective,
      progress: Math.max(0, Number(objective.progress) || 0),
      complete: Boolean(objective.complete),
    };
  });
}

function normalizeState(raw) {
  if (!raw || typeof raw !== "object") return null;
  const run = normalizeRun(raw.run);
  if (!run) return null;
  const defaults = defaultMeta();
  const rawMeta = raw.meta || {};
  const shop = normalizeShopState(rawMeta.shop);
  const capacity = jokerCapacity(shop);
  const stats = { ...defaultStats(), ...(rawMeta.stats || {}) };
  stats.levelBest = { ...(rawMeta.stats && rawMeta.stats.levelBest ? rawMeta.stats.levelBest : { 0: 0, 1: 0 }) };
  const discovered = Array.isArray(rawMeta.discovered)
    ? [...new Set(rawMeta.discovered.filter((level) => Number.isInteger(level) && level >= 0 && level < PLANT_COUNT))]
    : [0, 1];
  if (!discovered.includes(0)) discovered.push(0);
  if (!discovered.includes(1)) discovered.push(1);
  const progress = progressFromXp(rawMeta.totalXp);
  const unlocked = [...new Set([...unlockedDecorIds(progress.level), ...ownedShopDecorIds(shop)])];
  const selectedDecor = unlocked.includes(rawMeta.selectedDecor) ? rawMeta.selectedDecor : "urban";
  const normalRunBackup = raw.normalRunBackup ? normalizeRun(raw.normalRunBackup, "normal") : null;
  return {
    version: 2,
    best: Math.max(0, Number(raw.best) || 0, Number(run.score) || 0),
    meta: {
      ...defaults,
      ...rawMeta,
      totalXp: Math.max(0, Number(rawMeta.totalXp) || 0),
      coins: Math.max(0, Number(rawMeta.coins) || 0),
      discovered,
      stats,
      objectives: normalizeObjectives(rawMeta.objectives),
      nextObjectiveIndex: Math.max(3, Number(rawMeta.nextObjectiveIndex) || 3),
      inventory: {
        remove: Math.min(capacity, Math.max(0, Number(rawMeta.inventory && rawMeta.inventory.remove) || 0)),
        shuffle: Math.min(capacity, Math.max(0, Number(rawMeta.inventory && rawMeta.inventory.shuffle) || 0)),
        undo: Math.min(capacity, Math.max(0, Number(rawMeta.inventory && rawMeta.inventory.undo) || 0)),
        sprout: Math.min(capacity, Math.max(0, Number(rawMeta.inventory && rawMeta.inventory.sprout) || 0)),
        freeMerge: Math.min(capacity, Math.max(0, Number(rawMeta.inventory && rawMeta.inventory.freeMerge) || 0)),
      },
      shop,
      settings: {
        sound: rawMeta.settings ? rawMeta.settings.sound !== false : true,
        music: rawMeta.settings ? rawMeta.settings.music !== false : true,
        vibration: rawMeta.settings ? rawMeta.settings.vibration !== false : true,
      },
      selectedDecor,
      tutorialDone: Boolean(rawMeta.tutorialDone),
      daily: {
        completedDate: String(rawMeta.daily && rawMeta.daily.completedDate || ""),
        lastPlayedDate: String(rawMeta.daily && rawMeta.daily.lastPlayedDate || ""),
      },
      gamesSinceInterstitial: Math.max(0, Number(rawMeta.gamesSinceInterstitial) || 0),
      interstitialTarget: [3, 4].includes(Number(rawMeta.interstitialTarget)) ? Number(rawMeta.interstitialTarget) : 4,
    },
    run,
    undo: raw.undo && raw.undo.run ? raw.undo : null,
    normalRunBackup,
  };
}

function migrateV1(raw) {
  const grid = normalizeGrid(raw && raw.grid);
  if (!grid) return null;
  const migrated = defaultState();
  migrated.best = Math.max(0, Number(raw.best) || 0, Number(raw.score) || 0);
  migrated.run = {
    ...defaultRun(),
    grid,
    score: Math.max(0, Number(raw.score) || 0),
    maxLevel: highestLevel(grid),
    gameOver: isGameOver(grid),
  };
  const oldDiscovered = Array.isArray(raw.discovered) ? raw.discovered : [0, 1];
  migrated.meta.discovered = [...new Set(oldDiscovered.filter((level) => Number.isInteger(level) && level >= 0 && level < PLANT_COUNT))];
  if (!migrated.meta.discovered.includes(0)) migrated.meta.discovered.push(0);
  if (!migrated.meta.discovered.includes(1)) migrated.meta.discovered.push(1);
  migrated.meta.stats = {
    ...defaultStats(),
    ...(raw.stats || {}),
    levelBest: { ...(raw.stats && raw.stats.levelBest ? raw.stats.levelBest : { 0: 0, 1: 0 }) },
  };
  migrated.meta.tutorialDone = true;
  return migrated;
}

function loadState() {
  try {
    const v2 = localStorage.getItem(SAVE_KEY_V2);
    if (v2) {
      const loaded = normalizeState(JSON.parse(v2));
      if (loaded) return { state: loaded, fresh: false };
    }
    const v1 = localStorage.getItem(SAVE_KEY_V1);
    if (v1) {
      const migrated = migrateV1(JSON.parse(v1));
      if (migrated) return { state: migrated, fresh: false, migrated: true };
    }
  } catch {
    // A damaged save never prevents the game from starting.
  }
  return { state: defaultState(), fresh: true };
}

function trackPlayTime() {
  const now = Date.now();
  if (!document.hidden && state) {
    state.meta.stats.playTimeMs += Math.max(0, now - activeSince);
  }
  activeSince = now;
}

function saveState() {
  try {
    trackPlayTime();
    localStorage.setItem(SAVE_KEY_V2, JSON.stringify(state));
  } catch {
    // The current run remains playable when storage is unavailable.
  }
}

function highestLevel(grid = state.run.grid) {
  let highest = 0;
  for (const row of grid) {
    for (const tile of row) if (tile) highest = Math.max(highest, tile.level);
  }
  return highest;
}

function levelInfo(level) {
  if (level < LEVELS.length) return LEVELS[level];
  return {
    name: "Multivers " + (level - LEVELS.length + 2),
    rarity: "ULTIME",
    color: "hsl(" + ((level * 47) % 360) + " 80% 68%)",
    scale: .97,
    description: "Même la physique demande maintenant une pause.",
  };
}

function spriteVariables(element, level) {
  const core = level < 16;
  const index = core ? Math.max(0, level) : Math.min(3, level - 16);
  const divisor = core ? 3 : 1;
  const col = index % (core ? 4 : 2);
  const row = Math.floor(index / (core ? 4 : 2));
  element.style.setProperty("--sprite-image", core ? 'url("./assets/plants-atlas.webp")' : 'url("./assets/ultimate-plants.webp")');
  element.style.setProperty("--sprite-size", core ? "400% 400%" : "200% 200%");
  element.style.setProperty("--sprite-x", ((col / divisor) * 100) + "%");
  element.style.setProperty("--sprite-y", ((row / divisor) * 100) + "%");
}

function snapshotForUndo() {
  return {
    run: deepClone(state.run),
    meta: deepClone(state.meta),
  };
}

function restoreUndoSnapshot(snapshot) {
  const normalizedRun = normalizeRun(snapshot && snapshot.run);
  if (!normalizedRun || !snapshot.meta) return false;
  const preservedBest = state.best;
  const normalized = normalizeState({
    version: 2,
    best: preservedBest,
    run: normalizedRun,
    meta: snapshot.meta,
    undo: null,
    normalRunBackup: state.normalRunBackup,
  });
  if (!normalized) return false;
  state.run = normalized.run;
  state.meta = normalized.meta;
  state.best = Math.max(preservedBest, state.run.score);
  state.undo = null;
  return true;
}

function spawnRandomTile(grid, options = {}) {
  const cells = emptyCells(grid);
  if (!cells.length) return null;
  const random = options.random || Math.random;
  const cell = cells[Math.floor(random() * cells.length)];
  const hasGolden = grid.some((row) => row.some((tile) => tile && tile.special === "golden"));
  const goldenAllowed = options.allowGolden !== false && state && state.run.moves > 8 && !hasGolden;
  const golden = goldenAllowed && random() < .014;
  const tile = {
    id: createId(),
    level: random() < .11 ? 1 : 0,
    row: cell[0],
    col: cell[1],
    ...(golden ? { special: "golden" } : {}),
  };
  grid[cell[0]][cell[1]] = tile;
  return tile;
}

function startNewGame(options = {}) {
  const animate = options.animate !== false;
  if (state.run.mode === "daily" && state.normalRunBackup) {
    state.run = normalizeRun(state.normalRunBackup, "normal") || defaultRun();
    state.normalRunBackup = null;
  }
  const run = defaultRun("normal");
  run.startingBest = state.best;
  state.run = run;
  state.undo = null;
  state.meta.stats.games += 1;
  const first = spawnRandomTile(run.grid, { allowGolden: false });
  const second = spawnRandomTile(run.grid, { allowGolden: false });
  run.maxLevel = highestLevel(run.grid);
  closeAllModals();
  cancelJokerModes();
  inputLocked = false;
  saveState();
  renderAll(animate ? new Set([first && first.id, second && second.id].filter(Boolean)) : new Set());
  if (animate) {
    audio.spawn();
    vibrate(9);
  }
  announce("Nouvelle partie. Deux plantes dans la serre.");
}

function startDailyChallenge() {
  const date = localDateKey();
  if (state.meta.daily.completedDate === date) {
    showToast("DÉFI DÉJÀ TERMINÉ · reviens demain");
    return;
  }
  if (state.run.mode !== "daily") state.normalRunBackup = deepClone(state.run);
  const run = defaultRun("daily");
  run.startingBest = state.best;
  state.run = run;
  state.undo = null;
  state.meta.daily.lastPlayedDate = date;
  state.meta.stats.games += 1;
  const first = spawnRandomTile(run.grid, { allowGolden: false });
  const second = spawnRandomTile(run.grid, { allowGolden: false });
  const third = spawnRandomTile(run.grid, { allowGolden: false });
  run.maxLevel = highestLevel(run.grid);
  closeAllModals();
  cancelJokerModes();
  saveState();
  renderAll(new Set([first && first.id, second && second.id, third && third.id].filter(Boolean)));
  showEvent("DÉFI DU JOUR · C’EST PARTI");
  audio.discovery();
  announce("Défi du jour commencé.");
}

function restoreNormalRun() {
  if (state.run.mode === "daily" && state.normalRunBackup) {
    state.run = normalizeRun(state.normalRunBackup, "normal") || defaultRun();
    state.normalRunBackup = null;
    state.undo = null;
    saveState();
    renderAll();
  }
}

function metrics() {
  const style = getComputedStyle(document.documentElement);
  const gap = Number.parseFloat(style.getPropertyValue("--gap")) || 8;
  const width = elements.tileLayer.clientWidth;
  const tileSize = (width - gap * (GRID_SIZE - 1)) / GRID_SIZE;
  return { gap, tileSize };
}

function positionTile(element, row, col, animate = true) {
  const values = metrics();
  element.style.width = values.tileSize + "px";
  element.style.height = values.tileSize + "px";
  if (!animate) element.style.transition = "none";
  element.style.transform = "translate3d(" + (col * (values.tileSize + values.gap)) + "px," + (row * (values.tileSize + values.gap)) + "px,0)";
  if (!animate) requestAnimationFrame(() => { element.style.transition = ""; });
}

function createTileElement(tile, effect = "") {
  const info = levelInfo(tile.level);
  const element = document.createElement("div");
  element.className = "tile" + (tile.level >= 8 ? " level-high" : "") + (tile.special === "golden" ? " golden" : "") + (effect ? " " + effect : "");
  element.dataset.tileId = tile.id;
  element.setAttribute("role", "img");
  element.setAttribute("aria-label", "Évolution " + (tile.level + 1) + ", " + info.name + (tile.special === "golden" ? ", Graine dorée" : ""));
  element.style.setProperty("--accent", info.color);
  element.style.setProperty("--plant-scale", String(info.scale));
  const surface = document.createElement("div");
  surface.className = "tile-surface";
  const plant = document.createElement("div");
  plant.className = "plant-sprite";
  spriteVariables(plant, tile.level);
  const badge = document.createElement("span");
  badge.className = "level-badge";
  badge.textContent = String(tile.level + 1).padStart(2, "0");
  const name = document.createElement("span");
  name.className = "plant-name";
  name.textContent = info.name;
  surface.append(plant, badge, name);
  element.append(surface);
  if (removeMode || freeMergeMode) element.classList.add("selectable");
  if (freeMergeSelection.includes(tile.id)) element.classList.add("selected");
  element.addEventListener("click", () => {
    if (removeMode && !inputLocked) removeTile(tile.id);
    else if (freeMergeMode && !inputLocked) selectFreeMergeTile(tile.id);
  });
  elements.tileLayer.append(element);
  tileElements.set(tile.id, element);
  positionTile(element, tile.row, tile.col, false);
  return element;
}

function renderAll(effectIds = new Set()) {
  tileElements.clear();
  elements.tileLayer.replaceChildren();
  for (const row of state.run.grid) {
    for (const tile of row) {
      if (tile) createTileElement(tile, effectIds.has(tile.id) ? "spawn" : "");
    }
  }
  updateInterface();
}

function layoutTiles() {
  for (const row of state.run.grid) {
    for (const tile of row) {
      const element = tile && tileElements.get(tile.id);
      if (element) positionTile(element, tile.row, tile.col, false);
    }
  }
}

function stockText(type) {
  const stock = state.meta.inventory[type];
  return stock + "/" + jokerCapacity(state.meta.shop);
}

function equippedValue(category, fallback) {
  const id = state.meta.shop.equipped[category];
  const item = cosmeticDefinition(id);
  return item && item.category === category ? item.value : fallback;
}

function currentObjective() {
  return state.meta.objectives.find((objective) => !objective.complete) || state.meta.objectives[0];
}

function updateInterface() {
  const progress = progressFromXp(state.meta.totalXp);
  elements.level.textContent = "NIV. " + progress.level;
  elements.xpCopy.textContent = numberFormat.format(progress.current) + " / " + numberFormat.format(progress.needed) + " XP";
  elements.xpFill.style.width = (progress.ratio * 100) + "%";
  elements.coins.textContent = numberFormat.format(state.meta.coins);
  elements.score.textContent = numberFormat.format(state.run.score);
  elements.best.textContent = numberFormat.format(state.best);
  const objective = currentObjective();
  const objectiveIndex = state.meta.objectives.indexOf(objective);
  elements.objectiveKicker.textContent = objective.complete ? "RÉCOMPENSE PRÊTE" : "OBJECTIF " + (objectiveIndex + 1) + "/3";
  elements.objectiveLabel.textContent = objective.label;
  elements.objectiveFill.style.width = (Math.min(1, objective.progress / objective.target) * 100) + "%";
  elements.objectivePreview.classList.toggle("complete", objective.complete);
  const daily = state.run.mode === "daily";
  const dailyConfig = dailyChallengeFor(localDateKey());
  elements.modeLabel.textContent = daily ? dailyConfig.title.toUpperCase() : "PARTIE CLASSIQUE";
  elements.movesLabel.textContent = daily
    ? state.run.moves + " / " + dailyConfig.moveLimit + " MOUV."
    : state.run.moves + " MOUVEMENT" + (state.run.moves > 1 ? "S" : "");
  elements.runBonus.hidden = state.run.doubleXpMoves <= 0;
  elements.doubleXpMoves.textContent = state.run.doubleXpMoves;
  elements.removeStock.textContent = stockText("remove");
  elements.shuffleStock.textContent = stockText("shuffle");
  elements.undoStock.textContent = stockText("undo");
  elements.sproutStock.textContent = stockText("sprout");
  elements.freeMergeStock.textContent = stockText("freeMerge");
  const tileCount = state.run.grid.flat().filter(Boolean).length;
  $("#joker-undo").disabled = !state.undo || inputLocked || state.run.gameOver || state.meta.inventory.undo <= 0;
  $("#joker-remove").disabled = inputLocked || state.run.gameOver || tileCount <= 1 || state.meta.inventory.remove <= 0;
  $("#joker-shuffle").disabled = inputLocked || state.run.gameOver || tileCount <= 1 || state.meta.inventory.shuffle <= 0;
  $("#joker-sprout").disabled = inputLocked || state.run.gameOver || tileCount >= GRID_SIZE * GRID_SIZE || state.meta.inventory.sprout <= 0;
  $("#joker-free-merge").disabled = inputLocked || state.run.gameOver || tileCount < 2 || state.meta.inventory.freeMerge <= 0;
  elements.dailyDot.hidden = state.meta.daily.completedDate === localDateKey();
  document.body.dataset.decor = state.meta.selectedDecor;
  document.body.dataset.pot = equippedValue("pot", "classic");
  document.body.dataset.tileSkin = equippedValue("tile", "classic");
  document.body.dataset.effect = equippedValue("effect", "pollen");
  document.body.dataset.animation = equippedValue("animation", "bounce");
  const shopCoins = $("#shop-coins");
  if (shopCoins) shopCoins.textContent = numberFormat.format(state.meta.coins);
}

function announce(message) {
  elements.srStatus.textContent = "";
  requestAnimationFrame(() => { elements.srStatus.textContent = message; });
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = message;
  elements.toast.append(toast);
  window.setTimeout(() => toast.remove(), 2600);
}

function showScoreDelta(amount) {
  if (!amount) return;
  elements.scoreDelta.textContent = "+" + numberFormat.format(amount);
  elements.scoreDelta.classList.remove("fly");
  void elements.scoreDelta.offsetWidth;
  elements.scoreDelta.classList.add("fly");
}

function animateCoinGain(amount) {
  if (!amount || !elements.coinGain) return;
  window.clearTimeout(coinTimer);
  elements.coinGain.textContent = "+" + numberFormat.format(amount) + " ●";
  elements.coinGain.classList.remove("fly");
  elements.coinGain.parentElement.classList.remove("gain");
  void elements.coinGain.offsetWidth;
  elements.coinGain.classList.add("fly");
  elements.coinGain.parentElement.classList.add("gain");
  coinTimer = window.setTimeout(() => {
    elements.coinGain.classList.remove("fly");
    elements.coinGain.parentElement.classList.remove("gain");
  }, 950);
}

function showCombo(count) {
  if (count < 2) return;
  window.clearTimeout(comboTimer);
  elements.combo.textContent = COMBO_TEXT[count] || "ULTRA COMBO ×" + count;
  elements.combo.classList.remove("show");
  void elements.combo.offsetWidth;
  elements.combo.classList.add("show");
  comboTimer = window.setTimeout(() => elements.combo.classList.remove("show"), 850);
}

function showEvent(message) {
  window.clearTimeout(eventTimer);
  elements.event.textContent = message;
  elements.event.classList.remove("show");
  void elements.event.offsetWidth;
  elements.event.classList.add("show");
  eventTimer = window.setTimeout(() => elements.event.classList.remove("show"), 1200);
}

function emitParticles(row, col, color, intensity = 1) {
  const values = metrics();
  const centerX = col * (values.tileSize + values.gap) + values.tileSize / 2;
  const centerY = row * (values.tileSize + values.gap) + values.tileSize / 2;
  const total = Math.min(24, 7 + intensity * 2);
  for (let index = 0; index < total; index += 1) {
    const particle = document.createElement("i");
    const angle = Math.PI * 2 * index / total + Math.random() * .35;
    const distance = values.tileSize * (.25 + Math.random() * (.25 + intensity * .025));
    particle.className = "particle";
    particle.style.left = centerX + "px";
    particle.style.top = centerY + "px";
    particle.style.setProperty("--particle-x", (Math.cos(angle) * distance) + "px");
    particle.style.setProperty("--particle-y", (Math.sin(angle) * distance) + "px");
    particle.style.setProperty("--particle-r", Math.round(Math.random() * 240 - 120) + "deg");
    particle.style.setProperty("--particle-size", (3 + Math.random() * 4) + "px");
    particle.style.setProperty("--particle-color", index % 3 === 0 ? "#f7ca72" : color);
    particle.style.setProperty("--particle-hue", Math.round(index * 360 / total) + "deg");
    elements.tileLayer.append(particle);
    window.setTimeout(() => particle.remove(), 540);
  }
}

class GameAudio {
  constructor() {
    this.context = null;
    this.musicNodes = [];
  }

  unlock() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.context = new AudioContextClass();
    }
    if (this.context.state === "suspended") this.context.resume().catch(() => {});
    this.syncMusic();
  }

  tone(frequency, duration, type = "sine", volume = .03, delay = 0) {
    if (!state.meta.settings.sound || !this.context) return;
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + .03);
  }

  syncMusic() {
    if (!this.context) return;
    if (!state.meta.settings.music) {
      this.musicNodes.forEach((node) => {
        try { node.stop(); } catch { /* already stopped */ }
      });
      this.musicNodes = [];
      return;
    }
    if (this.musicNodes.length) return;
    [73.42, 110].forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = index ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = index ? .004 : .003;
      oscillator.connect(gain).connect(this.context.destination);
      oscillator.start();
      this.musicNodes.push(oscillator);
    });
  }

  move() { this.tone(128, .055, "triangle", .016); }
  spawn() { this.tone(286, .08, "sine", .017, .03); }
  merge(level) {
    this.tone(190 + Math.min(level, 14) * 18, .12, "triangle", .035);
    this.tone(280 + Math.min(level, 14) * 22, .15, "sine", .021, .045);
  }
  combo(count) { this.tone(420 + count * 42, .16, "square", .016, .05); }
  discovery() {
    [392, 523, 659].forEach((frequency, index) => this.tone(frequency, .24, "sine", .026, index * .085));
  }
  reward() {
    this.tone(523, .13, "triangle", .025);
    this.tone(784, .22, "sine", .025, .08);
  }
  gameOver() {
    this.tone(185, .28, "triangle", .027);
    this.tone(132, .38, "triangle", .023, .17);
  }
}

const audio = new GameAudio();

function vibrate(value) {
  if (!state.meta.settings.vibration) return;
  try {
    if (window.AndroidAds && typeof window.AndroidAds.vibrate === "function") {
      window.AndroidAds.vibrate(Array.isArray(value) ? Math.max(...value) : value);
    } else if (navigator.vibrate) {
      navigator.vibrate(value);
    }
  } catch {
    // Vibration is optional.
  }
}

function grantReward(xp, coins, reason = "", options = {}) {
  const safeXp = Math.max(0, Math.round(xp));
  const safeCoins = Math.max(0, Math.round(coins));
  const trackRun = options.trackRun !== false;
  const before = progressFromXp(state.meta.totalXp);
  state.meta.totalXp += safeXp;
  state.meta.coins += safeCoins;
  if (trackRun) {
    state.run.xpEarned += safeXp;
    state.run.coinsEarned += safeCoins;
  }
  if (safeCoins) animateCoinGain(safeCoins);
  const after = progressFromXp(state.meta.totalXp);
  if (after.level > before.level) {
    for (let level = before.level + 1; level <= after.level; level += 1) {
      const levelCoins = 24 + level * 4;
      state.meta.coins += levelCoins;
      if (trackRun) state.run.coinsEarned += levelCoins;
      animateCoinGain(levelCoins);
      if (level % 4 === 0) {
        const types = ["undo", "remove", "shuffle", "sprout", "freeMerge"];
        const gift = types[(level / 4 - 1) % types.length];
        state.meta.inventory[gift] = Math.min(jokerCapacity(state.meta.shop), state.meta.inventory[gift] + 1);
      }
      const newlyUnlocked = DECORS.find((decor) => decor.unlockLevel === level);
      showToast("NIVEAU " + level + " · <strong>+" + levelCoins + " PIÈCES</strong>" + (newlyUnlocked ? " · " + newlyUnlocked.name : ""));
      audio.reward();
    }
  } else if (reason && (safeXp || safeCoins)) {
    showToast(reason + " · <strong>+" + safeXp + " XP · +" + safeCoins + "●</strong>");
  }
}

function updateObjectives(event) {
  const newlyComplete = [];
  state.meta.objectives = state.meta.objectives.map((objective) => {
    const wasComplete = objective.complete;
    const updated = objectiveProgress(objective, event);
    if (!wasComplete && updated.complete) newlyComplete.push(updated);
    return updated;
  });
  newlyComplete.forEach((objective) => {
    showToast("OBJECTIF TERMINÉ · <strong>" + objective.label + "</strong>");
    audio.reward();
    vibrate([15, 35, 20]);
  });
}

function claimObjective(id) {
  const index = state.meta.objectives.findIndex((objective) => objective.id === id);
  if (index < 0 || !state.meta.objectives[index].complete) return;
  const objective = state.meta.objectives[index];
  grantReward(objective.rewardXp, objective.rewardCoins, "RÉCOMPENSE RÉCUPÉRÉE");
  state.run.objectivesCompleted += 1;
  state.meta.objectives[index] = createObjective(state.meta.nextObjectiveIndex);
  state.meta.nextObjectiveIndex += 1;
  saveState();
  renderObjectives();
  updateInterface();
}

function processRareEvents(result, combo) {
  const goldenMerges = result.merges.filter((merge) => merge.golden);
  if (goldenMerges.length) {
    goldenMerges.forEach((merge) => { delete merge.tile.special; });
    const coins = 28 * goldenMerges.length;
    grantReward(36 * goldenMerges.length, coins, "GRAINE DORÉE");
    updateObjectives({ golden: goldenMerges.length });
    showEvent("GRAINE DORÉE · +" + coins + " PIÈCES");
    vibrate([18, 30, 26]);
  }
  const largeMerges = result.merges.filter((merge) => merge.tile.level >= 8).length;
  if (largeMerges) {
    state.run.bigMerges += largeMerges;
    updateObjectives({ bigMerges: largeMerges });
  }
  if (largeMerges && combo >= 3) {
    grantReward(55, 14, "FUSION PARFAITE");
    showEvent("FUSION PARFAITE · BONUS");
  }
  if (state.run.moves > 10 && state.run.doubleXpMoves <= 0 && Math.random() < .009) {
    state.run.doubleXpMoves = 6;
    showEvent("DOUBLE XP · 6 MOUVEMENTS");
    audio.reward();
  }
}

function isDailySuccess() {
  if (state.run.mode !== "daily") return false;
  const config = dailyChallengeFor(localDateKey());
  if (config.kind === "evolution") return state.run.maxLevel >= config.target;
  if (config.kind === "score") return state.run.score >= config.target;
  return state.run.comboEvents >= config.target;
}

function evaluateEndState() {
  if (state.run.mode === "daily") {
    const config = dailyChallengeFor(localDateKey());
    if (isDailySuccess()) {
      state.run.dailyWon = true;
      state.run.gameOver = true;
      state.run.endReason = "success";
      return;
    }
    if (state.run.moves >= config.moveLimit) {
      state.run.gameOver = true;
      state.run.endReason = "limit";
      return;
    }
  }
  if (isGameOver(state.run.grid)) {
    state.run.gameOver = true;
    state.run.endReason = "blocked";
  }
}

function finalizeRun() {
  if (state.run.finalized) return;
  const bonus = endRunBonus(state.run);
  let xp = bonus.xp;
  let coins = bonus.coins;
  if (state.run.dailyWon) {
    const config = dailyChallengeFor(localDateKey());
    xp += config.rewardXp;
    coins += Math.round(config.rewardCoins * dailyRewardMultiplier(state.meta.shop));
    state.meta.daily.completedDate = localDateKey();
    state.meta.stats.dailyCompleted += 1;
  }
  grantReward(xp, coins);
  state.run.finalized = true;
  state.meta.stats.gamesCompleted += 1;
  state.meta.gamesSinceInterstitial += 1;
  saveState();
}

function animateMove(result, spawnedTile, discoveries) {
  result.motions.forEach((motion) => {
    const element = tileElements.get(motion.id);
    if (element) element.classList.add(motion.merged ? "merging" : "moving");
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    result.motions.forEach((motion) => {
      const element = tileElements.get(motion.id);
      if (element) positionTile(element, motion.row, motion.col, true);
    });
  }));
  window.setTimeout(() => {
    result.merges.forEach((merge) => {
      merge.sourceIds.forEach((sourceId) => {
        const old = tileElements.get(sourceId);
        if (old) old.remove();
        tileElements.delete(sourceId);
      });
      const mergedElement = createTileElement(merge.tile, "merge-pop");
      positionTile(mergedElement, merge.tile.row, merge.tile.col, false);
      const info = levelInfo(merge.tile.level);
      emitParticles(merge.tile.row, merge.tile.col, info.color, Math.min(merge.tile.level + 1, 10));
    });
    result.motions.forEach((motion) => {
      if (!motion.merged) {
        const element = tileElements.get(motion.id);
        if (element) element.classList.remove("moving");
      }
    });
    if (spawnedTile) {
      createTileElement(spawnedTile, "spawn");
      audio.spawn();
      if (spawnedTile.special === "golden") {
        showEvent("UNE GRAINE DORÉE EST APPARUE");
        vibrate(18);
      }
    }
    inputLocked = false;
    updateInterface();
    if (discoveries.length) {
      discoveryQueue.push(...discoveries);
      pendingEndScreen = state.run.gameOver;
      showNextDiscovery();
    } else if (state.run.gameOver) {
      window.setTimeout(showGameOver, 90);
    }
  }, MOVE_MS + 12);
}

function makeMove(direction) {
  if (inputLocked || state.run.gameOver || anyModalOpen()) return false;
  if (removeMode || freeMergeMode) cancelJokerModes();
  const result = computeMove(state.run.grid, direction, createId);
  if (!result.changed) {
    announce("Mouvement impossible.");
    vibrate(6);
    return false;
  }
  inputLocked = true;
  state.undo = snapshotForUndo();
  state.run.grid = result.grid;
  state.run.moves += 1;
  state.run.merges += result.mergeCount;
  state.run.comboStreak = result.mergeCount ? state.run.comboStreak + 1 : 0;
  const combo = Math.max(result.mergeCount, state.run.comboStreak);
  if (combo >= 2) state.run.comboEvents += 1;
  state.run.bestCombo = Math.max(state.run.bestCombo, combo);
  const scoreMultiplier = 1 + Math.max(0, combo - 1) * .12;
  const scoreGain = Math.round(result.scoreGain * scoreMultiplier);
  state.run.score += scoreGain;
  state.best = Math.max(state.best, state.run.score);
  state.meta.stats.totalMoves += 1;
  state.meta.stats.totalMerges += result.mergeCount;
  state.meta.stats.maxCombo = Math.max(state.meta.stats.maxCombo, combo);

  const discoveries = [];
  result.merges.forEach((merge) => {
    const level = merge.tile.level;
    state.run.maxLevel = Math.max(state.run.maxLevel, level);
    state.meta.stats.maxLevel = Math.max(state.meta.stats.maxLevel, level);
    state.meta.stats.levelBest[level] = Math.max(Number(state.meta.stats.levelBest[level]) || 0, state.run.score);
    if (level < PLANT_COUNT && !state.meta.discovered.includes(level)) {
      state.meta.discovered.push(level);
      state.run.discoveries += 1;
      discoveries.push(level);
    }
  });

  const multiplier = state.run.doubleXpMoves > 0 ? 2 : 1;
  const moveXp = Math.round((result.scoreGain / 13 + result.mergeCount * 4) * Math.max(1, combo * .55) * multiplier);
  const moveCoins = moveCoinReward({
    mergeCount: result.mergeCount,
    combo,
    mergedLevels: result.merges.map((merge) => merge.tile.level),
  }, state.meta.shop);
  if (moveXp || moveCoins) grantReward(moveXp, moveCoins);
  if (!state.run.recordBonusGranted && state.run.startingBest > 0 && state.run.score > state.run.startingBest) {
    state.run.recordBonusGranted = true;
    grantReward(55, 25, "NOUVEAU RECORD");
    showEvent("NOUVEAU RECORD · +25 PIÈCES");
  }
  updateObjectives({
    moved: true,
    merges: result.mergeCount,
    score: state.run.score,
    combo,
    level: state.run.maxLevel,
  });
  processRareEvents(result, combo);
  if (state.run.doubleXpMoves > 0) state.run.doubleXpMoves -= 1;
  const spawnedTile = spawnRandomTile(state.run.grid);
  evaluateEndState();
  if (state.run.gameOver) finalizeRun();
  saveState();

  audio.move();
  if (result.merges.length) audio.merge(Math.max(...result.merges.map((merge) => merge.tile.level)));
  if (combo >= 2) {
    showCombo(combo);
    audio.combo(combo);
    vibrate(combo >= 4 ? [14, 18, 24] : 14);
  } else if (result.merges.length) {
    vibrate(9);
  }
  showScoreDelta(scoreGain);
  updateInterface();
  animateMove(result, spawnedTile, discoveries);
  announce(direction + ". " + result.mergeCount + " fusion" + (result.mergeCount > 1 ? "s" : "") + ". Score " + state.run.score + ".");
  return true;
}

function hasJoker(type) {
  if (state.meta.inventory[type] > 0) return true;
  const item = JOKER_CATALOG.find((entry) => entry.id === type);
  showToast((item ? item.name.toUpperCase() : "JOKER") + " · <strong>stock vide, ouvre le Grow Shop</strong>");
  return false;
}

function consumeJoker(type) {
  if (!hasJoker(type)) return false;
  state.meta.inventory[type] -= 1;
  return true;
}

function beginRemoveMode() {
  if (inputLocked || state.run.gameOver || anyModalOpen()) return;
  if (!hasJoker("remove")) return;
  cancelFreeMergeMode();
  removeMode = !removeMode;
  elements.removeHint.textContent = "TOUCHE UNE TUILE À SUPPRIMER";
  elements.removeHint.hidden = !removeMode;
  $("#joker-remove").classList.toggle("active", removeMode);
  tileElements.forEach((element) => element.classList.toggle("selectable", removeMode));
}

function cancelRemoveMode() {
  removeMode = false;
  elements.removeHint.hidden = true;
  $("#joker-remove").classList.remove("active");
  tileElements.forEach((element) => element.classList.remove("selectable"));
}

function cancelFreeMergeMode() {
  freeMergeMode = false;
  freeMergeSelection = [];
  elements.removeHint.hidden = true;
  $("#joker-free-merge").classList.remove("active");
  tileElements.forEach((element) => element.classList.remove("selectable", "selected"));
}

function cancelJokerModes() {
  cancelRemoveMode();
  cancelFreeMergeMode();
}

function removeTile(id) {
  const tileCount = state.run.grid.flat().filter(Boolean).length;
  if (!removeMode || tileCount <= 1) return;
  const before = snapshotForUndo();
  if (!consumeJoker("remove")) return;
  let removed = null;
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (state.run.grid[row][col] && state.run.grid[row][col].id === id) {
        removed = state.run.grid[row][col];
        state.run.grid[row][col] = null;
      }
    }
  }
  if (!removed) return;
  state.undo = before;
  state.run.gameOver = false;
  state.run.endReason = "";
  state.meta.stats.jokersUsed += 1;
  cancelRemoveMode();
  saveState();
  renderAll();
  showEvent("TUILE SUPPRIMÉE");
  audio.reward();
  vibrate(16);
}

function shuffleTiles() {
  if (inputLocked || state.run.gameOver || anyModalOpen()) return;
  if (!hasJoker("shuffle")) return;
  cancelJokerModes();
  const before = snapshotForUndo();
  if (!consumeJoker("shuffle")) return;
  let next = shuffledGrid(state.run.grid);
  let tries = 0;
  while (JSON.stringify(next) === JSON.stringify(state.run.grid) && tries < 4) {
    next = shuffledGrid(state.run.grid);
    tries += 1;
  }
  state.run.grid = next;
  state.run.gameOver = false;
  state.run.endReason = "";
  state.undo = before;
  state.meta.stats.jokersUsed += 1;
  saveState();
  renderAll(new Set(state.run.grid.flat().filter(Boolean).map((tile) => tile.id)));
  showEvent("SERRE MÉLANGÉE");
  audio.reward();
  vibrate([10, 25, 15]);
}

function undoMove() {
  if (inputLocked || !state.undo || state.run.gameOver || anyModalOpen()) return;
  const snapshot = deepClone(state.undo);
  if (!hasJoker("undo")) return;
  cancelJokerModes();
  if (!restoreUndoSnapshot(snapshot)) return;
  if (!consumeJoker("undo")) return;
  state.meta.stats.jokersUsed += 1;
  saveState();
  renderAll();
  showEvent("MOUVEMENT ANNULÉ");
  audio.reward();
  vibrate(12);
}

function spawnSmallPlant() {
  if (inputLocked || state.run.gameOver || anyModalOpen()) return;
  const cells = emptyCells(state.run.grid);
  if (!cells.length) {
    showToast("AUCUNE CASE LIBRE · impossible de planter");
    return;
  }
  if (!hasJoker("sprout")) return;
  cancelJokerModes();
  const before = snapshotForUndo();
  if (!consumeJoker("sprout")) return;
  const [row, col] = cells[Math.floor(Math.random() * cells.length)];
  const tile = { id: createId(), level: 0, row, col };
  state.run.grid[row][col] = tile;
  state.undo = before;
  state.run.gameOver = false;
  state.run.endReason = "";
  state.meta.stats.jokersUsed += 1;
  saveState();
  renderAll(new Set([tile.id]));
  showEvent("PETITE POUSSE PLANTÉE");
  audio.spawn();
  vibrate(12);
}

function beginFreeMergeMode() {
  if (inputLocked || state.run.gameOver || anyModalOpen()) return;
  if (state.run.grid.flat().filter(Boolean).length < 2) return;
  if (!hasJoker("freeMerge")) return;
  cancelRemoveMode();
  freeMergeMode = !freeMergeMode;
  freeMergeSelection = [];
  elements.removeHint.textContent = "CHOISIS 2 TUILES À FUSIONNER LIBREMENT";
  elements.removeHint.hidden = !freeMergeMode;
  $("#joker-free-merge").classList.toggle("active", freeMergeMode);
  tileElements.forEach((element) => element.classList.toggle("selectable", freeMergeMode));
}

function selectFreeMergeTile(id) {
  if (!freeMergeMode) return;
  const existing = freeMergeSelection.indexOf(id);
  if (existing >= 0) freeMergeSelection.splice(existing, 1);
  else freeMergeSelection.push(id);
  tileElements.forEach((element, tileId) => element.classList.toggle("selected", freeMergeSelection.includes(tileId)));
  elements.removeHint.textContent = freeMergeSelection.length
    ? "CHOISIS ENCORE 1 TUILE"
    : "CHOISIS 2 TUILES À FUSIONNER LIBREMENT";
  if (freeMergeSelection.length === 2) completeFreeMerge();
}

function completeFreeMerge() {
  const selected = freeMergeSelection.map((id) => state.run.grid.flat().find((tile) => tile && tile.id === id));
  if (selected.some((tile) => !tile)) {
    cancelFreeMergeMode();
    return;
  }
  const before = snapshotForUndo();
  if (!consumeJoker("freeMerge")) {
    cancelFreeMergeMode();
    return;
  }
  const destination = selected[1];
  const nextLevel = Math.min(99, Math.max(selected[0].level, selected[1].level) + 1);
  const mergedTile = {
    id: createId(),
    level: nextLevel,
    row: destination.row,
    col: destination.col,
    ...(selected.some((tile) => tile.special === "golden") ? { special: "golden" } : {}),
  };
  const selectedIds = new Set(freeMergeSelection);
  state.run.grid = state.run.grid.map((row) => row.map((tile) => tile && selectedIds.has(tile.id) ? null : tile));
  state.run.grid[mergedTile.row][mergedTile.col] = mergedTile;
  state.undo = before;
  state.run.merges += 1;
  state.run.score += tileValue(nextLevel);
  state.best = Math.max(state.best, state.run.score);
  state.run.maxLevel = Math.max(state.run.maxLevel, nextLevel);
  state.meta.stats.totalMerges += 1;
  state.meta.stats.maxLevel = Math.max(state.meta.stats.maxLevel, nextLevel);
  state.meta.stats.levelBest[nextLevel] = Math.max(Number(state.meta.stats.levelBest[nextLevel]) || 0, state.run.score);
  state.meta.stats.jokersUsed += 1;
  const discovered = nextLevel < PLANT_COUNT && !state.meta.discovered.includes(nextLevel);
  if (discovered) {
    state.meta.discovered.push(nextLevel);
    state.run.discoveries += 1;
  }
  updateObjectives({ merges: 1, score: state.run.score, level: nextLevel });
  cancelFreeMergeMode();
  saveState();
  renderAll(new Set([mergedTile.id]));
  const info = levelInfo(nextLevel);
  emitParticles(mergedTile.row, mergedTile.col, info.color, Math.min(nextLevel + 2, 12));
  showEvent("FUSION LIBRE · " + info.name.toUpperCase());
  audio.merge(nextLevel);
  vibrate([16, 28, 22]);
  if (discovered) {
    discoveryQueue.push(nextLevel);
    window.setTimeout(showNextDiscovery, 120);
  }
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  cancelJokerModes();
  lastFocus = document.activeElement;
  modal.hidden = false;
  const focusTarget = modal.querySelector("button:not([disabled])");
  window.setTimeout(() => focusTarget && focusTarget.focus({ preventScroll: true }), 0);
}

function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;
  if (lastFocus instanceof HTMLElement) lastFocus.focus({ preventScroll: true });
}

function closeAllModals() {
  document.querySelectorAll(".modal").forEach((modal) => { modal.hidden = true; });
}

function anyModalOpen() {
  return Boolean(document.querySelector(".modal:not([hidden])"));
}

function spendCoins(amount) {
  const price = Math.max(0, Math.round(amount));
  if (state.meta.coins < price) {
    showToast("PIÈCES INSUFFISANTES · <strong>" + numberFormat.format(price) + " ● requis</strong>");
    return false;
  }
  state.meta.coins -= price;
  state.meta.stats.coinsSpent += price;
  return true;
}

function availableDecorOptions() {
  const level = progressFromXp(state.meta.totalXp).level;
  const progression = DECORS
    .filter((decor) => level >= decor.unlockLevel)
    .map((decor) => ({ id: decor.id, name: decor.name }));
  const owned = new Set(state.meta.shop.ownedCosmetics);
  const purchased = COSMETIC_CATALOG
    .filter((item) => item.category === "decor" && owned.has(item.id))
    .map((item) => ({ id: item.value, name: item.name }));
  return [...progression, ...purchased.filter((item) => !progression.some((decor) => decor.id === item.id))];
}

function decorName(id) {
  return availableDecorOptions().find((item) => item.id === id)?.name || DECORS[0].name;
}

function purchaseJoker(type) {
  const item = JOKER_CATALOG.find((entry) => entry.id === type);
  if (!item) return;
  const capacity = jokerCapacity(state.meta.shop);
  if (state.meta.inventory[type] >= capacity) {
    showToast("STOCK PLEIN · améliore ton étagère à jokers");
    return;
  }
  const price = jokerPrice(type, state.meta.shop);
  if (!spendCoins(price)) return;
  state.meta.inventory[type] += 1;
  state.meta.shop.purchases += 1;
  state.meta.stats.shopPurchases += 1;
  saveState();
  updateInterface();
  renderShop();
  showToast(item.name.toUpperCase() + " · <strong>ajouté au stock</strong>");
  audio.reward();
}

function equipCosmetic(item) {
  if (item.category === "decor") state.meta.selectedDecor = item.value;
  else state.meta.shop.equipped[item.category] = item.id;
  saveState();
  updateInterface();
  renderHome();
  renderShop();
  showToast(item.name.toUpperCase() + " · <strong>équipé</strong>");
  vibrate(9);
}

function buyOrEquipCosmetic(id) {
  const item = cosmeticDefinition(id);
  if (!item) return;
  const owned = state.meta.shop.ownedCosmetics.includes(item.id);
  if (!owned) {
    if (!spendCoins(item.price)) return;
    state.meta.shop.ownedCosmetics.push(item.id);
    state.meta.shop.purchases += 1;
    state.meta.stats.shopPurchases += 1;
  }
  equipCosmetic(item);
}

function purchaseUpgrade(id) {
  const item = UPGRADE_CATALOG.find((entry) => entry.id === id);
  if (!item) return;
  const level = state.meta.shop.upgrades[id];
  if (level >= item.costs.length) return;
  const price = item.costs[level];
  if (!spendCoins(price)) return;
  state.meta.shop.upgrades[id] = level + 1;
  state.meta.shop.purchases += 1;
  state.meta.stats.shopPurchases += 1;
  saveState();
  updateInterface();
  renderShop();
  showToast(item.name.toUpperCase() + " · <strong>niveau " + (level + 1) + "/2</strong>");
  audio.reward();
}

function makeShopRow(icon, name, detail, buttonLabel, onClick, options = {}) {
  const card = document.createElement("article");
  card.className = "shop-item" + (options.complete ? " " + options.complete : "");
  const symbol = document.createElement("span");
  symbol.className = "shop-icon";
  symbol.textContent = icon;
  const copy = document.createElement("div");
  copy.className = "shop-copy";
  const title = document.createElement("strong");
  title.textContent = name;
  const description = document.createElement("small");
  description.textContent = detail;
  copy.append(title, description);
  const button = document.createElement("button");
  button.className = "shop-buy" + (options.equip ? " equip" : "");
  button.type = "button";
  button.textContent = buttonLabel;
  button.disabled = Boolean(options.disabled);
  button.addEventListener("click", onClick);
  card.append(symbol, copy, button);
  return card;
}

function renderShopJokers() {
  const container = $("#shop-jokers");
  container.replaceChildren();
  const capacity = jokerCapacity(state.meta.shop);
  JOKER_CATALOG.forEach((item) => {
    const stock = state.meta.inventory[item.id];
    const full = stock >= capacity;
    const price = jokerPrice(item.id, state.meta.shop);
    const row = makeShopRow(
      item.icon,
      item.name,
      "Stock " + stock + " / " + capacity,
      full ? "STOCK PLEIN" : numberFormat.format(price) + " ●",
      () => purchaseJoker(item.id),
      { disabled: full || state.meta.coins < price, complete: full ? "maxed" : "" },
    );
    container.append(row);
  });
}

function isCosmeticEquipped(item) {
  if (item.category === "decor") return state.meta.selectedDecor === item.value;
  return state.meta.shop.equipped[item.category] === item.id;
}

function renderShopCosmetics() {
  const container = $("#shop-cosmetics");
  container.replaceChildren();
  Object.keys(COSMETIC_CATEGORY_LABELS).forEach((category) => {
    const title = document.createElement("h3");
    title.className = "shop-category";
    title.textContent = COSMETIC_CATEGORY_LABELS[category];
    const list = document.createElement("div");
    list.className = "cosmetic-list";
    COSMETIC_CATALOG.filter((item) => item.category === category).forEach((item) => {
      const owned = state.meta.shop.ownedCosmetics.includes(item.id);
      const equipped = owned && isCosmeticEquipped(item);
      const card = document.createElement("article");
      card.className = "cosmetic-card" + (owned ? " owned" : "");
      const swatch = document.createElement("div");
      swatch.className = "cosmetic-swatch";
      swatch.style.setProperty("--swatch", COSMETIC_SWATCHES[category]);
      const name = document.createElement("strong");
      name.textContent = item.name;
      const button = document.createElement("button");
      button.className = "shop-buy" + (owned ? " equip" : "");
      button.type = "button";
      button.textContent = equipped ? "ÉQUIPÉ" : owned ? "ÉQUIPER" : numberFormat.format(item.price) + " ●";
      button.disabled = equipped || (!owned && state.meta.coins < item.price);
      button.addEventListener("click", () => buyOrEquipCosmetic(item.id));
      card.append(swatch, name, button);
      list.append(card);
    });
    container.append(title, list);
  });
}

function renderShopUpgrades() {
  const container = $("#shop-upgrades");
  container.replaceChildren();
  UPGRADE_CATALOG.forEach((item) => {
    const level = state.meta.shop.upgrades[item.id];
    const maxed = level >= item.costs.length;
    const price = maxed ? 0 : item.costs[level];
    const row = makeShopRow(
      item.id === "capacity" ? "▦" : item.id === "dailyBonus" ? "◆" : item.id === "comboCoins" ? "×3" : "%",
      item.name,
      item.description + " Niveau " + level + "/2.",
      maxed ? "MAX" : numberFormat.format(price) + " ●",
      () => purchaseUpgrade(item.id),
      { disabled: maxed || state.meta.coins < price, complete: maxed ? "maxed" : "" },
    );
    row.querySelector("small").classList.add("upgrade-level");
    container.append(row);
  });
}

function renderDailyChest() {
  const claimed = state.meta.shop.dailyChestDate === localDateKey();
  const multiplier = dailyRewardMultiplier(state.meta.shop);
  const normal = Math.round(45 * multiplier);
  const improved = Math.round(90 * multiplier);
  $("#chest-copy").textContent = claimed
    ? "Coffre récupéré. Une nouvelle récolte t’attend demain."
    : normal + " pièces gratuites ou " + improved + " pièces + 1 joker avec une publicité.";
  $("#claim-chest").disabled = claimed;
  $("#claim-chest-ad").disabled = claimed;
  $("#claim-chest").textContent = claimed ? "RÉCUPÉRÉ" : "GRATUIT · +" + normal + " ●";
  $("#claim-chest-ad").innerHTML = claimed ? "RÉCUPÉRÉ" : "<span>▶</span> +" + improved + " ● + JOKER";
}

function claimDailyChest(improved) {
  if (state.meta.shop.dailyChestDate === localDateKey()) return;
  const multiplier = dailyRewardMultiplier(state.meta.shop);
  let coins = Math.round((improved ? 90 : 45) * multiplier);
  let gift = "";
  if (improved) {
    const capacity = jokerCapacity(state.meta.shop);
    const available = JOKER_CATALOG.filter((item) => state.meta.inventory[item.id] < capacity);
    if (available.length) {
      const item = available[Math.floor(Math.random() * available.length)];
      state.meta.inventory[item.id] += 1;
      gift = " · " + item.shortName;
    } else {
      coins += 35;
      gift = " · STOCK PLEIN +35 ●";
    }
  }
  state.meta.shop.dailyChestDate = localDateKey();
  grantReward(0, coins, improved ? "COFFRE AMÉLIORÉ" : "COFFRE QUOTIDIEN", { trackRun: false });
  saveState();
  updateInterface();
  renderShop();
  showToast((improved ? "COFFRE AMÉLIORÉ" : "COFFRE QUOTIDIEN") + " · <strong>+" + coins + " ●" + gift + "</strong>");
  audio.reward();
}

function setShopTab(tab) {
  if (!['jokers', 'cosmetics', 'upgrades'].includes(tab)) return;
  activeShopTab = tab;
  document.querySelectorAll("[data-shop-tab]").forEach((button) => button.classList.toggle("active", button.dataset.shopTab === tab));
  document.querySelectorAll("[data-shop-panel]").forEach((panel) => { panel.hidden = panel.dataset.shopPanel !== tab; });
}

function renderShop() {
  $("#shop-coins").textContent = numberFormat.format(state.meta.coins);
  renderDailyChest();
  renderShopJokers();
  renderShopCosmetics();
  renderShopUpgrades();
  setShopTab(activeShopTab);
}

function openShop() {
  closeModal($("#home-modal"));
  renderShop();
  openModal("shop-modal");
}

function renderHome() {
  const progress = progressFromXp(state.meta.totalXp);
  $("#home-level").textContent = progress.level;
  $("#home-collection").textContent = state.meta.discovered.length + " / " + PLANT_COUNT;
  $("#home-coins").textContent = numberFormat.format(state.meta.coins);
  $("#decor-name").textContent = decorName(state.meta.selectedDecor);
  const done = state.meta.daily.completedDate === localDateKey();
  $("#home-daily-state").textContent = done ? "TERMINÉ" : "DISPONIBLE";
  $("#home-daily").disabled = done;
  $("#continue-game").querySelector("span").textContent = state.run.mode === "daily" ? "DÉFI EN COURS" : "REPRENDRE";
}

function openHome() {
  renderHome();
  openModal("home-modal");
}

function cycleDecor(direction) {
  const available = availableDecorOptions();
  const current = Math.max(0, available.findIndex((item) => item.id === state.meta.selectedDecor));
  const nextIndex = (current + direction + available.length) % available.length;
  state.meta.selectedDecor = available[nextIndex].id;
  saveState();
  updateInterface();
  renderHome();
}

function renderObjectives() {
  const container = $("#objectives-list");
  container.replaceChildren();
  state.meta.objectives.forEach((objective) => {
    const card = document.createElement("article");
    card.className = "objective-card" + (objective.complete ? " complete" : "");
    const title = document.createElement("h3");
    title.textContent = objective.label;
    const reward = document.createElement("span");
    reward.className = "objective-reward";
    reward.textContent = "+" + objective.rewardXp + " XP · +" + objective.rewardCoins + "●";
    const progress = document.createElement("span");
    progress.className = "progress-copy";
    progress.textContent = Math.min(objective.progress, objective.target) + " / " + objective.target;
    const track = document.createElement("div");
    track.className = "objective-track";
    const fill = document.createElement("i");
    fill.style.width = (Math.min(1, objective.progress / objective.target) * 100) + "%";
    track.append(fill);
    card.append(title, reward, progress, track);
    if (objective.complete) {
      const claim = document.createElement("button");
      claim.className = "claim-button";
      claim.type = "button";
      claim.textContent = "RÉCUPÉRER";
      claim.addEventListener("click", () => claimObjective(objective.id));
      card.append(claim);
    }
    container.append(card);
  });
}

function openObjectives() {
  renderObjectives();
  openModal("objectives-modal");
}

function renderHerbarium() {
  const grid = $("#herbarium-grid");
  grid.replaceChildren();
  $("#collection-total").textContent = state.meta.discovered.length + " / " + PLANT_COUNT;
  LEVELS.forEach((info, level) => {
    const unlocked = state.meta.discovered.includes(level);
    const card = document.createElement("article");
    card.className = "herb-card" + (unlocked ? "" : " locked");
    card.style.setProperty("--accent", info.color);
    const sprite = document.createElement("div");
    sprite.className = "herb-sprite";
    spriteVariables(sprite, level);
    const rarity = document.createElement("span");
    rarity.className = "rarity";
    rarity.style.setProperty("--rarity-color", RARITY_COLORS[info.rarity]);
    rarity.textContent = unlocked ? info.rarity : "INCONNUE";
    const levelLabel = document.createElement("small");
    levelLabel.textContent = "ÉVOLUTION " + (level + 1) + (unlocked ? " · ✓" : "");
    const title = document.createElement("h3");
    title.textContent = unlocked ? info.name : "???";
    const description = document.createElement("p");
    description.textContent = unlocked ? info.description : "Fusionne encore pour révéler ce spécimen.";
    const best = document.createElement("p");
    best.className = "best-line";
    best.textContent = unlocked ? "Meilleur score · " + numberFormat.format(Number(state.meta.stats.levelBest[level]) || 0) : "Meilleur score · —";
    card.append(sprite, rarity, levelLabel, title, description, best);
    grid.append(card);
  });
}

function openHerbarium() {
  renderHerbarium();
  openModal("herbarium-modal");
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? hours + " h " + String(rest).padStart(2, "0") + " min" : Math.max(1, minutes) + " min";
}

function renderStats() {
  trackPlayTime();
  const stats = state.meta.stats;
  const values = [
    ["PARTIES JOUÉES", numberFormat.format(stats.games)],
    ["MEILLEUR SCORE", numberFormat.format(state.best)],
    ["PLUS GROSSE ÉVOLUTION", levelInfo(stats.maxLevel).name],
    ["FUSIONS TOTALES", numberFormat.format(stats.totalMerges)],
    ["MEILLEUR COMBO", "×" + Math.max(1, stats.maxCombo)],
    ["HERBIER", state.meta.discovered.length + " / " + PLANT_COUNT],
    ["DÉFIS TERMINÉS", numberFormat.format(stats.dailyCompleted)],
    ["TEMPS DE JEU", formatDuration(stats.playTimeMs)],
    ["JOKERS UTILISÉS", numberFormat.format(stats.jokersUsed)],
    ["ACHATS GROW SHOP", numberFormat.format(stats.shopPurchases)],
    ["PIÈCES DÉPENSÉES", numberFormat.format(stats.coinsSpent)],
    ["MOUVEMENTS", numberFormat.format(stats.totalMoves)],
  ];
  const grid = $("#stats-grid");
  grid.replaceChildren();
  values.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "stat-card";
    const label = document.createElement("span");
    label.textContent = entry[0];
    const value = document.createElement("strong");
    value.textContent = entry[1];
    card.append(label, value);
    grid.append(card);
  });
}

function openStats() {
  renderStats();
  openModal("stats-modal");
}

function syncSettingsUI() {
  [["sound", "setting-sound"], ["music", "setting-music"], ["vibration", "setting-vibration"]].forEach((entry) => {
    const button = document.getElementById(entry[1]);
    const enabled = state.meta.settings[entry[0]];
    button.classList.toggle("off", !enabled);
    button.querySelector("strong").textContent = enabled ? "ON" : "OFF";
  });
}

function openSettings() {
  syncSettingsUI();
  openModal("settings-modal");
}

function toggleSetting(name) {
  state.meta.settings[name] = !state.meta.settings[name];
  if (name === "music") audio.syncMusic();
  if (name === "sound" && state.meta.settings.sound) {
    audio.unlock();
    audio.reward();
  }
  saveState();
  syncSettingsUI();
}

function renderDaily() {
  const config = dailyChallengeFor(localDateKey());
  const done = state.meta.daily.completedDate === localDateKey();
  $("#daily-name").textContent = config.title;
  $("#daily-rule").textContent = config.rule;
  $("#daily-xp").textContent = config.rewardXp;
  $("#daily-coins").textContent = Math.round(config.rewardCoins * dailyRewardMultiplier(state.meta.shop));
  $("#daily-status").textContent = done ? "Défi terminé aujourd’hui" : "Disponible aujourd’hui";
  $("#start-daily").disabled = done;
  $("#start-daily").textContent = done ? "TERMINÉ" : state.run.mode === "daily" && !state.run.gameOver ? "REPRENDRE" : "COMMENCER";
}

function openDaily() {
  renderDaily();
  openModal("daily-modal");
}

function showNextDiscovery() {
  if (!discoveryQueue.length) {
    closeModal($("#discovery-modal"));
    if (pendingEndScreen) {
      pendingEndScreen = false;
      window.setTimeout(showGameOver, 80);
    }
    return;
  }
  const level = discoveryQueue.shift();
  const info = levelInfo(level);
  const sprite = $("#discovery-sprite");
  sprite.style.setProperty("--accent", info.color);
  spriteVariables(sprite, level);
  $("#discovery-rarity").textContent = info.rarity;
  $("#discovery-rarity").style.setProperty("--rarity-color", RARITY_COLORS[info.rarity]);
  $("#discovery-title").textContent = info.name;
  $("#discovery-title").style.setProperty("--accent", info.color);
  $("#discovery-description").textContent = info.description;
  openModal("discovery-modal");
  audio.discovery();
  vibrate([18, 35, 28]);
}

function showGameOver() {
  finalizeRun();
  const daily = state.run.mode === "daily";
  $("#game-over-title").textContent = state.run.dailyWon ? "DÉFI RÉUSSI !" : daily ? "DÉFI TERMINÉ" : "PAS SI LOIN…";
  $("#final-score").textContent = numberFormat.format(state.run.score);
  $("#final-best").textContent = numberFormat.format(state.best);
  $("#final-xp").textContent = "+" + numberFormat.format(state.run.xpEarned);
  $("#final-coins").textContent = "+" + numberFormat.format(state.run.coinsEarned);
  $("#final-combo").textContent = "×" + Math.max(1, state.run.bestCombo);
  $("#final-plant").textContent = levelInfo(state.run.maxLevel).name;
  $("#final-objectives").textContent = String(state.run.objectivesCompleted);
  $("#final-discoveries").textContent = String(state.run.discoveries);
  const secondChanceAvailable = !state.run.secondChanceUsed && !state.run.dailyWon && state.run.endReason === "blocked";
  $("#second-chance-options").hidden = !secondChanceAvailable;
  $("#second-chance").disabled = false;
  $("#second-chance-coins").disabled = state.meta.coins < SECOND_CHANCE_PRICE;
  $("#second-chance-coins").textContent = numberFormat.format(SECOND_CHANCE_PRICE) + " ●";
  const canDouble = state.run.coinsEarned > 0 && !state.run.coinsDoubled;
  $("#double-coins").hidden = !canDouble;
  $("#double-coins").disabled = false;
  $("#double-coins").innerHTML = "<span>▶</span> DOUBLER MES PIÈCES · +" + numberFormat.format(state.run.coinsEarned) + " ●";
  $("#restart-game").textContent = daily && !state.run.dailyWon ? "RÉESSAYER" : "REJOUER";
  openModal("game-over-modal");
  if (state.run.dailyWon) {
    audio.discovery();
    vibrate([20, 35, 30, 45, 38]);
  } else {
    audio.gameOver();
  }
}

function clearForSecondChance() {
  state.run.grid = secondChanceGrid(state.run.grid, 3);
  state.run.secondChanceUsed = true;
  state.run.gameOver = false;
  state.run.endReason = "";
  state.undo = null;
  closeModal($("#game-over-modal"));
  saveState();
  renderAll();
  showEvent("SECONDE CHANCE · 3 CASES LIBÉRÉES");
  audio.reward();
  vibrate([18, 28, 24]);
}

function buySecondChance() {
  if (state.run.secondChanceUsed || state.meta.coins < SECOND_CHANCE_PRICE) return;
  if (!spendCoins(SECOND_CHANCE_PRICE)) return;
  saveState();
  clearForSecondChance();
}

function doubleRunCoins() {
  if (state.run.coinsDoubled || state.run.coinsEarned <= 0) return;
  const bonus = state.run.coinsEarned;
  state.run.coinsDoubled = true;
  state.meta.coins += bonus;
  state.run.coinsEarned += bonus;
  state.meta.stats.rewardedAds += 1;
  animateCoinGain(bonus);
  saveState();
  $("#final-coins").textContent = "+" + numberFormat.format(state.run.coinsEarned);
  $("#double-coins").hidden = true;
  showToast("PIÈCES DOUBLÉES · <strong>+" + numberFormat.format(bonus) + " ●</strong>");
  audio.reward();
}

function showRewarded(action, callback, button = null) {
  pendingAd = { action, callback, button };
  if (button) button.disabled = true;
  try {
    if (window.AndroidAds && typeof window.AndroidAds.showRewarded === "function") {
      window.AndroidAds.showRewarded(action);
      return;
    }
  } catch {
    // The Web test path below remains available.
  }
  const modal = $("#web-ad-modal");
  const labels = {
    second_chance: ["Seconde chance", "La récompense libérera trois cases de la grille."],
    double_coins: ["Double récolte", "La récompense doublera les pièces gagnées pendant cette partie."],
    daily_chest: ["Coffre amélioré", "La récompense ajoute des pièces et un joker à ton stock."],
  };
  const label = labels[action] || ["Récompense", "La récompense sera ajoutée immédiatement."];
  $("#ad-title").textContent = label[0];
  modal.querySelector("p").textContent = label[1];
  const countdown = $("#ad-countdown");
  const close = $("#ad-close");
  close.disabled = true;
  countdown.textContent = "2";
  modal.hidden = false;
  let remaining = 2;
  const timer = window.setInterval(() => {
    remaining -= 1;
    countdown.textContent = String(Math.max(0, remaining));
    if (remaining <= 0) {
      window.clearInterval(timer);
      close.disabled = false;
      close.focus();
    }
  }, 650);
}

function completeRewarded(success) {
  if (!pendingAd) return;
  const current = pendingAd;
  pendingAd = null;
  $("#web-ad-modal").hidden = true;
  if (current.button) current.button.disabled = false;
  if (success) current.callback();
  else showToast("PUBLICITÉ INDISPONIBLE · réessaie plus tard");
}

function maybeShowInterstitial() {
  if (state.meta.gamesSinceInterstitial < state.meta.interstitialTarget) return;
  state.meta.gamesSinceInterstitial = 0;
  state.meta.interstitialTarget = Math.random() < .5 ? 3 : 4;
  saveState();
  try {
    if (window.AndroidAds && typeof window.AndroidAds.showInterstitial === "function") {
      window.AndroidAds.showInterstitial();
    } else {
      showToast("PUBLICITÉ INTERSTITIELLE TEST · pause naturelle simulée");
    }
  } catch {
    // Ads never block the game.
  }
}

window.BEuhBeuh48Ads = Object.freeze({
  rewarded(action) {
    if (pendingAd && pendingAd.action === action) completeRewarded(true);
  },
  failed(action) {
    if (pendingAd && pendingAd.action === action) {
      completeRewarded(false);
    }
  },
});

function openTutorial(force = false) {
  if (state.meta.tutorialDone && !force) return;
  tutorialIndex = 0;
  renderTutorial();
  openModal("tutorial-modal");
}

function renderTutorial() {
  const step = TUTORIAL[tutorialIndex];
  $("#tutorial-step").textContent = (tutorialIndex + 1) + " / " + TUTORIAL.length;
  $("#tutorial-title").textContent = step.title;
  $("#tutorial-copy").textContent = step.copy;
  $("#tutorial-visual").dataset.step = String(tutorialIndex);
  $("#tutorial-visual").textContent = step.icon;
  $("#tutorial-next").textContent = tutorialIndex === TUTORIAL.length - 1 ? "JOUER" : "SUIVANT";
}

function finishTutorial() {
  state.meta.tutorialDone = true;
  saveState();
  closeModal($("#tutorial-modal"));
}

function nextTutorialStep() {
  if (tutorialIndex >= TUTORIAL.length - 1) {
    finishTutorial();
    return;
  }
  tutorialIndex += 1;
  renderTutorial();
}

function restartFromGameOver() {
  const wasDaily = state.run.mode === "daily";
  const won = state.run.dailyWon;
  closeModal($("#game-over-modal"));
  maybeShowInterstitial();
  if (wasDaily && !won && state.meta.daily.completedDate !== localDateKey()) startDailyChallenge();
  else {
    restoreNormalRun();
    startNewGame();
  }
}

const keyDirections = new Map([
  ["ArrowLeft", "left"], ["a", "left"], ["q", "left"],
  ["ArrowRight", "right"], ["d", "right"],
  ["ArrowUp", "up"], ["w", "up"], ["z", "up"],
  ["ArrowDown", "down"], ["s", "down"],
]);

document.addEventListener("pointerdown", () => audio.unlock(), { passive: true });
document.addEventListener("touchmove", (event) => {
  if (elements.board.contains(event.target)) event.preventDefault();
}, { passive: false });

document.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (keyDirections.has(key)) {
    event.preventDefault();
    audio.unlock();
    if (!event.repeat) makeMove(keyDirections.get(key));
    return;
  }
  if (event.key === "Escape") {
    if (removeMode || freeMergeMode) {
      cancelJokerModes();
      return;
    }
    const modal = document.querySelector(".modal:not([hidden])");
    if (modal && !modal.matches("#game-over-modal,#discovery-modal,#tutorial-modal,#web-ad-modal")) closeModal(modal);
  }
});

elements.board.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || inputLocked || anyModalOpen() || state.run.gameOver || removeMode || freeMergeMode) return;
  event.preventDefault();
  audio.unlock();
  pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  if (elements.board.setPointerCapture) elements.board.setPointerCapture(event.pointerId);
});
elements.board.addEventListener("pointermove", (event) => {
  if (pointerStart && pointerStart.id === event.pointerId) event.preventDefault();
}, { passive: false });
elements.board.addEventListener("pointerup", (event) => {
  if (!pointerStart || pointerStart.id !== event.pointerId) return;
  event.preventDefault();
  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  pointerStart = null;
  const threshold = Math.max(22, elements.board.clientWidth * .052);
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < threshold) return;
  const direction = Math.abs(deltaX) > Math.abs(deltaY)
    ? (deltaX > 0 ? "right" : "left")
    : (deltaY > 0 ? "down" : "up");
  makeMove(direction);
}, { passive: false });
elements.board.addEventListener("pointercancel", () => { pointerStart = null; });

$("#home-logo").addEventListener("click", openHome);
$("#nav-home").addEventListener("click", openHome);
$("#continue-game").addEventListener("click", () => closeModal($("#home-modal")));
$("#new-game").addEventListener("click", () => startNewGame());
$("#home-shop").addEventListener("click", openShop);
$("#previous-decor").addEventListener("click", () => cycleDecor(-1));
$("#next-decor").addEventListener("click", () => cycleDecor(1));
$("#objective-preview").addEventListener("click", openObjectives);
$("#nav-herbarium").addEventListener("click", openHerbarium);
$("#nav-stats").addEventListener("click", openStats);
$("#nav-settings").addEventListener("click", openSettings);
$("#nav-daily").addEventListener("click", openDaily);
$("#home-daily").addEventListener("click", () => {
  closeModal($("#home-modal"));
  openDaily();
});
$("#start-daily").addEventListener("click", () => {
  if (state.run.mode === "daily" && !state.run.gameOver) closeModal($("#daily-modal"));
  else startDailyChallenge();
});
$("#joker-remove").addEventListener("click", beginRemoveMode);
$("#joker-shuffle").addEventListener("click", shuffleTiles);
$("#joker-undo").addEventListener("click", undoMove);
$("#joker-sprout").addEventListener("click", spawnSmallPlant);
$("#joker-free-merge").addEventListener("click", beginFreeMergeMode);
document.querySelectorAll("[data-shop-tab]").forEach((button) => {
  button.addEventListener("click", () => setShopTab(button.dataset.shopTab));
});
$("#claim-chest").addEventListener("click", () => claimDailyChest(false));
$("#claim-chest-ad").addEventListener("click", () => {
  const button = $("#claim-chest-ad");
  showRewarded("daily_chest", () => {
    state.meta.stats.rewardedAds += 1;
    claimDailyChest(true);
  }, button);
});
$("#setting-sound").addEventListener("click", () => toggleSetting("sound"));
$("#setting-music").addEventListener("click", () => toggleSetting("music"));
$("#setting-vibration").addEventListener("click", () => toggleSetting("vibration"));
$("#replay-tutorial").addEventListener("click", () => {
  closeModal($("#settings-modal"));
  openTutorial(true);
});
$("#discovery-continue").addEventListener("click", showNextDiscovery);
$("#restart-game").addEventListener("click", restartFromGameOver);
$("#game-over-home").addEventListener("click", () => {
  closeModal($("#game-over-modal"));
  maybeShowInterstitial();
  restoreNormalRun();
  openHome();
});
$("#second-chance").addEventListener("click", () => {
  const button = $("#second-chance");
  showRewarded("second_chance", () => {
    state.meta.stats.rewardedAds += 1;
    clearForSecondChance();
  }, button);
});
$("#second-chance-coins").addEventListener("click", buySecondChance);
$("#double-coins").addEventListener("click", () => {
  const button = $("#double-coins");
  showRewarded("double_coins", doubleRunCoins, button);
});
$("#tutorial-next").addEventListener("click", nextTutorialStep);
$("#skip-tutorial").addEventListener("click", finishTutorial);
$("#ad-close").addEventListener("click", () => completeRewarded(true));

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => closeModal(button.closest(".modal")));
});
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("pointerdown", (event) => {
    if (event.target === modal && !modal.matches("#game-over-modal,#discovery-modal,#tutorial-modal,#web-ad-modal")) closeModal(modal);
  });
});

window.addEventListener("resize", () => {
  window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(layoutTiles);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) saveState();
  else activeSince = Date.now();
});
window.addEventListener("pagehide", saveState);
window.setInterval(saveState, 30000);

const loaded = loadState();
state = loaded.state;
if (loaded.fresh) {
  startNewGame({ animate: true });
} else {
  state.run.gameOver = state.run.gameOver || isGameOver(state.run.grid);
  renderAll();
  if (loaded.migrated) {
    saveState();
    window.setTimeout(() => showToast("PROGRESSION V1 IMPORTÉE · bienvenue dans la V2"), 350);
  }
  if (state.run.gameOver) window.setTimeout(showGameOver, 260);
}
if (loaded.fresh) window.setTimeout(() => openTutorial(false), 350);

window.__BEUHBEUH48__ = Object.freeze({
  move: makeMove,
  newGame: () => startNewGame({ animate: false }),
  getState: () => deepClone({
    grid: state.run.grid.map((row) => row.map((tile) => tile ? { level: tile.level, special: tile.special || null } : null)),
    score: state.run.score,
    best: state.best,
    gameOver: state.run.gameOver,
    mode: state.run.mode,
    meta: state.meta,
  }),
  setGridForTest(levels) {
    state.run.grid = gridFromLevels(levels, createId);
    state.run.maxLevel = highestLevel(state.run.grid);
    state.run.gameOver = isGameOver(state.run.grid);
    state.run.endReason = state.run.gameOver ? "blocked" : "";
    state.run.finalized = false;
    state.undo = null;
    renderAll();
    if (state.run.gameOver) window.setTimeout(showGameOver, 0);
  },
  useJoker(type) {
    if (type === "shuffle") shuffleTiles();
    if (type === "undo") undoMove();
    if (type === "sprout") spawnSmallPlant();
  },
  setResourcesForTest({ coins, inventory } = {}) {
    if (Number.isFinite(coins)) state.meta.coins = Math.max(0, Math.round(coins));
    if (inventory && typeof inventory === "object") {
      const capacity = jokerCapacity(state.meta.shop);
      JOKER_CATALOG.forEach((item) => {
        if (Number.isFinite(inventory[item.id])) state.meta.inventory[item.id] = Math.min(capacity, Math.max(0, Math.round(inventory[item.id])));
      });
    }
    saveState();
    updateInterface();
  },
  openShop,
  buyJoker: purchaseJoker,
  save: saveState,
});

function registerWebMCPTools() {
  const context = document.modelContext;
  if (!context || !context.registerTool) return;
  const lifecycle = new AbortController();
  const gameState = () => ({
    grid: state.run.grid.map((row) => row.map((tile) => tile ? tile.level : null)),
    score: state.run.score,
    best: state.best,
    highestPlant: levelInfo(highestLevel()).name,
    gameOver: state.run.gameOver,
    playerLevel: progressFromXp(state.meta.totalXp).level,
    herbarium: state.meta.discovered.length + " / " + PLANT_COUNT,
  });
  const registrations = [
    context.registerTool({
      name: "read_game_state",
      title: "Lire la partie BEUHBEUH48",
      description: "Lire le plateau, la progression et le score sans modifier la partie.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() { return gameState(); },
    }, { signal: lifecycle.signal }),
    context.registerTool({
      name: "move_plants",
      title: "Déplacer les plantes",
      description: "Effectuer un déplacement valide sur le plateau BEUHBEUH48.",
      inputSchema: {
        type: "object",
        properties: { direction: { type: "string", enum: ["left", "right", "up", "down"] } },
        required: ["direction"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        if (!input || !["left", "right", "up", "down"].includes(input.direction)) throw new Error("Direction invalide.");
        if (!makeMove(input.direction)) throw new Error("Mouvement impossible ou jeu occupé.");
        await new Promise((resolve) => window.setTimeout(resolve, MOVE_MS + 80));
        return gameState();
      },
    }, { signal: lifecycle.signal }),
  ];
  registrations.forEach((registration) => Promise.resolve(registration).catch(() => {}));
}

registerWebMCPTools();

if (!window.AndroidAds && "serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  navigator.serviceWorker.register("./sw.js").catch(() => {
    // Offline caching is a progressive enhancement on the Web build.
  });
}
