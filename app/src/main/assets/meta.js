export const SAVE_KEY_V2 = "beuhbeuh48.save.v2";
export const SAVE_KEY_V1 = "beuhbeuh48.save.v1";
export const PLANT_COUNT = 20;

export const DECORS = [
  { id: "urban", name: "Appartement urbain", unlockLevel: 1 },
  { id: "balcony", name: "Balcon solaire", unlockLevel: 3 },
  { id: "greenhouse", name: "Serre botanique", unlockLevel: 5 },
  { id: "rooftop", name: "Rooftop nocturne", unlockLevel: 8 },
  { id: "tropical", name: "Jardin tropical", unlockLevel: 12 },
  { id: "laboratory", name: "Laboratoire stylisé", unlockLevel: 17 },
  { id: "psychedelic", name: "Jardin psychédélique", unlockLevel: 24 },
];

export function xpForNextLevel(level) {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.round(110 + (safeLevel - 1) * 55 + Math.pow(safeLevel - 1, 1.35) * 12);
}

export function progressFromXp(totalXp) {
  let level = 1;
  let remainder = Math.max(0, Math.floor(Number(totalXp) || 0));
  let needed = xpForNextLevel(level);
  while (remainder >= needed && level < 999) {
    remainder -= needed;
    level += 1;
    needed = xpForNextLevel(level);
  }
  return { level, current: remainder, needed, ratio: Math.min(1, remainder / needed) };
}

export function unlockedDecorIds(level) {
  return DECORS.filter((decor) => level >= decor.unlockLevel).map((decor) => decor.id);
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function dailyChallengeFor(dateKey) {
  const random = seededRandom(hashString(`BEUHBEUH48-${dateKey}`));
  const kind = Math.floor(random() * 3);
  if (kind === 0) {
    const targetLevel = 6 + Math.floor(random() * 3);
    return {
      id: `${dateKey}-evolution`, kind: "evolution", target: targetLevel,
      title: "Pousse express", rule: `Atteins ${targetLevel + 1} évolutions en 90 mouvements.`,
      moveLimit: 90, rewardXp: 180 + targetLevel * 10, rewardCoins: 65,
    };
  }
  if (kind === 1) {
    const targetScore = 2800 + Math.floor(random() * 5) * 450;
    return {
      id: `${dateKey}-score`, kind: "score", target: targetScore,
      title: "Course au score", rule: `Marque ${targetScore.toLocaleString("fr-FR")} points en 75 mouvements.`,
      moveLimit: 75, rewardXp: 220, rewardCoins: 70,
    };
  }
  const targetCombos = 4 + Math.floor(random() * 3);
  return {
    id: `${dateKey}-combos`, kind: "combos", target: targetCombos,
    title: "Récolte en chaîne", rule: `Réalise ${targetCombos} combos ×2 ou plus en 85 mouvements.`,
    moveLimit: 85, rewardXp: 200, rewardCoins: 75,
  };
}

export const OBJECTIVE_TEMPLATES = [
  { type: "merges", target: 20, label: "Réaliser 20 fusions", rewardXp: 70, rewardCoins: 18 },
  { type: "merges", target: 45, label: "Réaliser 45 fusions", rewardXp: 115, rewardCoins: 28 },
  { type: "moves", target: 100, label: "Effectuer 100 déplacements", rewardXp: 90, rewardCoins: 22 },
  { type: "score", target: 5000, label: "Atteindre 5 000 points", rewardXp: 130, rewardCoins: 32 },
  { type: "combo", target: 4, label: "Réaliser un combo ×4", rewardXp: 125, rewardCoins: 34 },
  { type: "level", target: 7, label: "Atteindre l’évolution 8", rewardXp: 105, rewardCoins: 26 },
  { type: "bigMerges", target: 3, label: "Obtenir 3 grosses fusions", rewardXp: 145, rewardCoins: 36 },
  { type: "golden", target: 1, label: "Fusionner une Graine dorée", rewardXp: 155, rewardCoins: 42 },
];

export function createObjective(index) {
  const templateIndex = ((index % OBJECTIVE_TEMPLATES.length) + OBJECTIVE_TEMPLATES.length) % OBJECTIVE_TEMPLATES.length;
  const cycle = Math.floor(index / OBJECTIVE_TEMPLATES.length);
  const template = OBJECTIVE_TEMPLATES[templateIndex];
  return {
    id: `objective-${index}`,
    ...template,
    rewardXp: template.rewardXp + cycle * 12,
    rewardCoins: template.rewardCoins + cycle * 3,
    progress: 0,
    complete: false,
  };
}

export function objectiveProgress(objective, event) {
  let progress = objective.progress;
  if (objective.type === "merges" && event.merges) progress += event.merges;
  if (objective.type === "moves" && event.moved) progress += 1;
  if (objective.type === "score" && event.score !== undefined) progress = Math.max(progress, event.score);
  if (objective.type === "combo" && event.combo) progress = Math.max(progress, event.combo);
  if (objective.type === "level" && event.level !== undefined) progress = Math.max(progress, event.level);
  if (objective.type === "bigMerges" && event.bigMerges) progress += event.bigMerges;
  if (objective.type === "golden" && event.golden) progress += event.golden;
  progress = Math.min(objective.target, progress);
  return { ...objective, progress, complete: progress >= objective.target };
}

export function endRunBonus(run) {
  const xp = Math.round(
    Math.min(280, run.score / 24)
    + run.merges * 1.5
    + run.bestCombo * 10
    + run.maxLevel * 14,
  );
  const coins = Math.max(3, Math.round(run.score / 620 + run.maxLevel * 1.6 + run.bestCombo));
  return { xp, coins };
}
