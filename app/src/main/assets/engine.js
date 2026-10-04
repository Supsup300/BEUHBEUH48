export const GRID_SIZE = 4;

export function makeEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

export function tileValue(level) {
  return 2 ** (level + 1);
}

export function cloneGrid(grid) {
  return grid.map((row) => row.map((tile) => (tile ? { ...tile } : null)));
}

function lineCoordinates(direction, lineIndex) {
  const coords = [];
  for (let i = 0; i < GRID_SIZE; i += 1) {
    if (direction === "left") coords.push([lineIndex, i]);
    if (direction === "right") coords.push([lineIndex, GRID_SIZE - 1 - i]);
    if (direction === "up") coords.push([i, lineIndex]);
    if (direction === "down") coords.push([GRID_SIZE - 1 - i, lineIndex]);
  }
  return coords;
}

export function computeMove(grid, direction, createId) {
  if (!["left", "right", "up", "down"].includes(direction)) {
    throw new Error(`Direction invalide: ${direction}`);
  }

  const nextGrid = makeEmptyGrid();
  const motions = [];
  const merges = [];
  let scoreGain = 0;
  let changed = false;

  for (let lineIndex = 0; lineIndex < GRID_SIZE; lineIndex += 1) {
    const coords = lineCoordinates(direction, lineIndex);
    const tiles = coords
      .map(([row, col]) => grid[row][col])
      .filter(Boolean);

    let sourceIndex = 0;
    let targetIndex = 0;

    while (sourceIndex < tiles.length) {
      const first = tiles[sourceIndex];
      const second = tiles[sourceIndex + 1];
      const [targetRow, targetCol] = coords[targetIndex];

      if (second && first.level === second.level) {
        const mergedTile = {
          id: createId(),
          level: first.level + 1,
          row: targetRow,
          col: targetCol,
          ...(first.special === "golden" || second.special === "golden" ? { special: "golden" } : {}),
        };
        nextGrid[targetRow][targetCol] = mergedTile;
        motions.push({ id: first.id, fromRow: first.row, fromCol: first.col, row: targetRow, col: targetCol, merged: true });
        motions.push({ id: second.id, fromRow: second.row, fromCol: second.col, row: targetRow, col: targetCol, merged: true });
        merges.push({
          sourceIds: [first.id, second.id],
          tile: mergedTile,
          golden: first.special === "golden" || second.special === "golden",
        });
        scoreGain += tileValue(mergedTile.level);
        changed = true;
        sourceIndex += 2;
      } else {
        const movedTile = { ...first, row: targetRow, col: targetCol };
        nextGrid[targetRow][targetCol] = movedTile;
        motions.push({ id: first.id, fromRow: first.row, fromCol: first.col, row: targetRow, col: targetCol, merged: false });
        if (first.row !== targetRow || first.col !== targetCol) changed = true;
        sourceIndex += 1;
      }

      targetIndex += 1;
    }
  }

  return {
    changed,
    grid: nextGrid,
    motions,
    merges,
    scoreGain,
    mergeCount: merges.length,
  };
}

export function hasEmptyCell(grid) {
  return grid.some((row) => row.some((tile) => tile === null));
}

export function emptyCells(grid) {
  const cells = [];
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (!grid[row][col]) cells.push([row, col]);
    }
  }
  return cells;
}

export function shuffledGrid(grid, random = Math.random) {
  const tiles = grid.flat().filter(Boolean).map((tile) => ({ ...tile }));
  const positions = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => index);
  for (let index = positions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [positions[index], positions[swapIndex]] = [positions[swapIndex], positions[index]];
  }
  const result = makeEmptyGrid();
  tiles.forEach((tile, index) => {
    const position = positions[index];
    const row = Math.floor(position / GRID_SIZE);
    const col = position % GRID_SIZE;
    result[row][col] = { ...tile, row, col };
  });
  return result;
}

export function secondChanceGrid(grid, removeCount = 3) {
  const result = cloneGrid(grid);
  const tiles = result.flat().filter(Boolean).sort((a, b) => a.level - b.level);
  const safeCount = Math.min(Math.max(2, removeCount), Math.max(2, tiles.length - 2));
  const removedIds = new Set(tiles.slice(0, safeCount).map((tile) => tile.id));
  return result.map((row) => row.map((tile) => tile && removedIds.has(tile.id) ? null : tile));
}

export function canAnyTileMerge(grid) {
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const tile = grid[row][col];
      if (!tile) continue;
      if (col + 1 < GRID_SIZE && grid[row][col + 1]?.level === tile.level) return true;
      if (row + 1 < GRID_SIZE && grid[row + 1][col]?.level === tile.level) return true;
    }
  }
  return false;
}

export function isGameOver(grid) {
  return !hasEmptyCell(grid) && !canAnyTileMerge(grid);
}

export function gridFromLevels(levels, createId = (() => {
  let index = 0;
  return () => `test-${index += 1}`;
})()) {
  return levels.map((line, row) => line.map((level, col) => (
    level === null || level === undefined
      ? null
      : { id: createId(), level, row, col }
  )));
}

export function levelsFromGrid(grid) {
  return grid.map((row) => row.map((tile) => tile?.level ?? null));
}
