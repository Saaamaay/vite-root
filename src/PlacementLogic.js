export const canPlacePrimary = (board, currentPlayer, row, col, branches, selectedBranch) => {
  const bulbPosition = findBulbPosition(board, currentPlayer);
  if (!bulbPosition) return false;

  const branchRoots = branches[currentPlayer][selectedBranch].roots;

  if (branchRoots.length === 0) {
    return isAdjacentInDirection(bulbPosition, [row, col], selectedBranch);
  } else {
    const lastPrimary = findLastPrimary(branchRoots);
    const direction = getDirection(selectedBranch);
    const validCells = getValidAdjacentCells(lastPrimary.position, direction);
    return validCells.some(([validRow, validCol]) => validRow === row && validCol === col);
  }
};

const getValidAdjacentCells = (position, direction) => {
  const [row, col] = position;
  const [dx, dy] = direction;
  return [
    [row + dx, col + dy],     // front
    [row - dx, col - dy],     // back
    [row - dy, col + dx],     // left side
    [row + dy, col - dx]      // right side
  ];
};


export const canPlaceSecondary = (board, currentPlayer, row, col, branches, selectedBranch) => {
  const branchRoots = branches[currentPlayer][selectedBranch].roots;
  if (branchRoots.length === 0) return false;

  const lastPiece = findLastPlacedPrimaryOrSecondary(branchRoots);
  if (!lastPiece) return false;

  const direction = getDirection(selectedBranch);
  const validCells = getValidAdjacentCells(lastPiece.position, direction);

  return validCells.some(([validRow, validCol]) => 
    validRow === row && validCol === col
  );
};


const findBulbPosition = (board, player) => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === `P${player + 1}B`) {
        return [i, j];
      }
    }
  }
  return null;
};

const findLastPrimary = (roots) => {
  for (let i = roots.length - 1; i >= 0; i--) {
    if (roots[i].type === 'P') {
      return roots[i];
    }
  }
  return null;
};

const findLastPlacedPrimaryOrSecondary = (roots) => {
  for (let i = roots.length - 1; i >= 0; i--) {
    if (roots[i].type === 'P' || roots[i].type === 'S') {
      return roots[i];
    }
  }
  return null;
};


const isAdjacentInDirection = (pos1, pos2, direction) => {
  const [x1, y1] = pos1;
  const [x2, y2] = pos2;
  const [dx, dy] = getDirection(direction);
  return x2 === x1 + dx && y2 === y1 + dy;
};

const getDirection = (direction) => {
  switch (direction) {
    case 'UP': return [-1, 0];
    case 'RIGHT': return [0, 1];
    case 'DOWN': return [1, 0];
    case 'LEFT': return [0, -1];
    default: return [0, 0];
  }
};

export const getValidPlacements = (board, currentPlayer, selectedRootType, branches, selectedBranch) => {
  const validPlacements = [];

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === null) {
        if (selectedRootType === 'B') {
          validPlacements.push([i, j]);
        } else if (selectedRootType === 'P' && selectedBranch && canPlacePrimary(board, currentPlayer, i, j, branches, selectedBranch)) {
          validPlacements.push([i, j]);
        } else if (selectedRootType === 'S' && selectedBranch && canPlaceSecondary(board, currentPlayer, i, j, branches, selectedBranch)) {
          validPlacements.push([i, j]);
        }
        // Add more conditions for other root types here (T, C)
      }
    }
  }

  return validPlacements;
};