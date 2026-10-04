import assert from "node:assert/strict";
import {
  DECORS,
  createObjective,
  dailyChallengeFor,
  endRunBonus,
  objectiveProgress,
  progressFromXp,
  unlockedDecorIds,
  xpForNextLevel,
} from "../app/src/main/assets/meta.js";

assert.equal(progressFromXp(0).level, 1);
assert.equal(progressFromXp(xpForNextLevel(1)).level, 2);
assert.ok(xpForNextLevel(8) > xpForNextLevel(2), "La progression doit ralentir avec le niveau.");

const date = "2026-09-28";
assert.deepEqual(dailyChallengeFor(date), dailyChallengeFor(date), "Le défi quotidien doit être déterministe.");
assert.notDeepEqual(dailyChallengeFor(date), dailyChallengeFor("2026-09-29"), "Le défi doit varier selon la date.");

let objective = createObjective(0);
objective = objectiveProgress(objective, { merges: 12 });
assert.equal(objective.progress, 12);
assert.equal(objective.complete, false);
objective = objectiveProgress(objective, { merges: 8 });
assert.equal(objective.progress, objective.target);
assert.equal(objective.complete, true);

const bonus = endRunBonus({ score: 5000, merges: 40, bestCombo: 4, maxLevel: 8 });
assert.ok(bonus.xp > 0 && bonus.coins > 0);

assert.deepEqual(unlockedDecorIds(1), ["urban"]);
assert.equal(unlockedDecorIds(99).length, DECORS.length);

console.log("BEUHBEUH48 meta: XP, objectifs, défis et récompenses validés.");
