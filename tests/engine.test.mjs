import assert from "node:assert/strict";
import {
  computeMove,
  gridFromLevels,
  isGameOver,
  levelsFromGrid,
  makeEmptyGrid,
  secondChanceGrid,
  shuffledGrid,
} from "../app/src/main/assets/engine.js";

let id = 0;
const nextId = () => `n-${id += 1}`;
const E = null;

function moveRow(row, direction) {
  const levels = direction === "left" || direction === "right"
    ? [row, [E, E, E, E], [E, E, E, E], [E, E, E, E]]
    : [
        [row[0], E, E, E],
        [row[1], E, E, E],
        [row[2], E, E, E],
        [row[3], E, E, E],
      ];
  const result = computeMove(gridFromLevels(levels, nextId), direction, nextId);
  const moved = levelsFromGrid(result.grid);
  return direction === "left" || direction === "right"
    ? moved[0]
    : moved.map((line) => line[0]);
}

const leftCases = [
  [[0, 0, E, E], [1, E, E, E]],
  [[0, 0, 0, E], [1, 0, E, E]],
  [[0, 0, 0, 0], [1, 1, E, E]],
  [[0, 0, 1, 1], [1, 2, E, E]],
  [[0, 1, 1, 0], [0, 2, 0, E]],
  [[E, 0, E, 0], [1, E, E, E]],
  [[1, 0, 0, 1], [1, 1, 1, E]],
];

const rightCases = [
  [[0, 0, E, E], [E, E, E, 1]],
  [[0, 0, 0, E], [E, E, 0, 1]],
  [[0, 0, 0, 0], [E, E, 1, 1]],
  [[0, 0, 1, 1], [E, E, 1, 2]],
  [[0, 1, 1, 0], [E, 0, 2, 0]],
  [[E, 0, E, 0], [E, E, E, 1]],
  [[1, 0, 0, 1], [E, 1, 1, 1]],
];

for (const [input, expected] of leftCases) {
  assert.deepEqual(moveRow(input, "left"), expected);
  assert.deepEqual(moveRow(input, "up"), expected);
}

for (const [input, expected] of rightCases) {
  assert.deepEqual(moveRow(input, "right"), expected);
  assert.deepEqual(moveRow(input, "down"), expected);
}

const immobile = gridFromLevels([
  [0, E, E, E],
  [E, E, E, E],
  [E, E, E, E],
  [E, E, E, E],
], nextId);
assert.equal(computeMove(immobile, "left", nextId).changed, false);
assert.equal(computeMove(makeEmptyGrid(), "left", nextId).changed, false);

const fourMergeMove = computeMove(gridFromLevels([
  [0, 0, 1, 1],
  [2, 2, 3, 3],
  [E, E, E, E],
  [E, E, E, E],
], nextId), "left", nextId);
assert.equal(fourMergeMove.mergeCount, 4);
assert.equal(fourMergeMove.scoreGain, 4 + 8 + 16 + 32);
assert.equal(new Set(fourMergeMove.merges.map((merge) => merge.tile.id)).size, 4);

const sequentialStart = gridFromLevels([
  [0, 0, 0, 0],
  [E, E, E, E],
  [E, E, E, E],
  [E, E, E, E],
], nextId);
const sequentialLeft = computeMove(sequentialStart, "left", nextId);
const sequentialRight = computeMove(sequentialLeft.grid, "right", nextId);
assert.deepEqual(levelsFromGrid(sequentialRight.grid)[0], [E, E, E, 2]);

const serialized = JSON.parse(JSON.stringify(sequentialRight.grid));
assert.deepEqual(levelsFromGrid(serialized), levelsFromGrid(sequentialRight.grid));

const fullWithMerge = gridFromLevels([
  [0, 1, 0, 1],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 0, 1],
], nextId);
assert.equal(isGameOver(fullWithMerge), false);

const fullWithoutMerge = gridFromLevels([
  [0, 1, 0, 1],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 1, 0],
], nextId);
assert.equal(isGameOver(fullWithoutMerge), true);

const goldenGrid = gridFromLevels([
  [0, 0, E, E],
  [E, E, E, E],
  [E, E, E, E],
  [E, E, E, E],
], nextId);
goldenGrid[0][0].special = "golden";
const goldenMove = computeMove(goldenGrid, "left", nextId);
assert.equal(goldenMove.merges[0].golden, true);
assert.equal(goldenMove.grid[0][0].special, "golden");

const shuffleSource = gridFromLevels([
  [0, 1, 2, E],
  [3, 4, E, E],
  [E, E, E, E],
  [E, E, E, E],
], nextId);
const randomValues = [.99, .81, .72, .63, .54, .45, .36, .27, .18, .09, .88, .77, .66, .55, .44, .33];
let randomIndex = 0;
const shuffled = shuffledGrid(shuffleSource, () => randomValues[randomIndex++ % randomValues.length]);
assert.deepEqual(
  shuffled.flat().filter(Boolean).map((tile) => tile.level).sort((a, b) => a - b),
  [0, 1, 2, 3, 4],
);
assert.equal(new Set(shuffled.flat().filter(Boolean).map((tile) => tile.id)).size, 5);
shuffled.forEach((row, rowIndex) => row.forEach((tile, colIndex) => {
  if (tile) assert.deepEqual([tile.row, tile.col], [rowIndex, colIndex]);
}));

const secondChanceSource = gridFromLevels([
  [0, 1, 2, 3],
  [1, 2, 3, 4],
  [2, 3, 4, 5],
  [3, 4, 5, 6],
], nextId);
const continuedGrid = secondChanceGrid(secondChanceSource, 3);
assert.equal(continuedGrid.flat().filter(Boolean).length, 13);
assert.equal(Math.max(...continuedGrid.flat().filter(Boolean).map((tile) => tile.level)), 6);
assert.equal(isGameOver(continuedGrid), false);

console.log("BEUHBEUH48 engine: all deterministic movement tests passed.");
