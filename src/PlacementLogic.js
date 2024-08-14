export const canPlacePrimary = (board, currentPlayer, row, col, branches, selectedBranch) => {
  const bulbPosition = findBulbPosition(board, currentPlayer);
  if (!bulbPosition) return false;

  const branchRoots = branches[currentPlayer][selectedBranch].roots;

  if (branchRoots.length === 0) {
    // If the branch hasn't been started, only allow placement in the correct direction from the bulb
    return isAdjacentInDirection(bulbPosition, [row, col], selectedBranch);
  } else {
    // If the branch has started, check if the placement is adjacent to the last Primary in the selected branch
    const lastPrimary = findLastPrimary(branchRoots);
    return lastPrimary && isAdjacentInDirection(lastPrimary.position, [row, col], selectedBranch);
  }
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

const isAdjacentInDirection = (pos1, pos2, direction) => {
  const [x1, y1] = pos1;
  const [x2, y2] = pos2;
  
  switch (direction) {
    case 'UP':
      return x2 === x1 - 1 && y2 === y1;
    case 'RIGHT':
      return x2 === x1 && y2 === y1 + 1;
    case 'DOWN':
      return x2 === x1 + 1 && y2 === y1;
    case 'LEFT':
      return x2 === x1 && y2 === y1 - 1;
    default:
      return false;
  }
};

export const getValidPlacements = (board, currentPlayer, selectedRootType, branches, selectedBranch) => {
  const validPlacements = [];

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === null) {
        if (selectedRootType === 'B') {
          // Bulb can be placed anywhere on an empty cell
          validPlacements.push([i, j]);
        } else if (selectedRootType === 'P' && selectedBranch && canPlacePrimary(board, currentPlayer, i, j, branches, selectedBranch)) {
          validPlacements.push([i, j]);
        }
        // Add more conditions for other root types here
      }
    }
  }

  return validPlacements;
};