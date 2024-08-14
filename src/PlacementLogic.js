// PlacementLogic.js
export const canPlacePrimary = (board, currentPlayer, row, col, branches, selectedBranch) => {
    const bulbPosition = findBulbPosition(board, currentPlayer);
    if (!bulbPosition) return false;
  
    // Check if the selected position is adjacent to the Bulb
    if (isAdjacent(bulbPosition, [row, col])) return true;
  
    // Check if the selected position is adjacent to the last Primary in the selected branch
    const lastPrimary = findLastPrimary(branches[currentPlayer][selectedBranch].roots);
    if (lastPrimary && isAdjacent(lastPrimary.position, [row, col])) return true;
  
    return false;
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
  
  const isAdjacent = (pos1, pos2) => {
    const [x1, y1] = pos1;
    const [x2, y2] = pos2;
    return (Math.abs(x1 - x2) + Math.abs(y1 - y2)) === 1;
  };
  
  export const getValidPlacements = (board, currentPlayer, selectedRootType, branches, selectedBranch) => {
    const validPlacements = [];
  
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === null) {
          if (selectedRootType === 'P' && canPlacePrimary(board, currentPlayer, i, j, branches, selectedBranch)) {
            validPlacements.push([i, j]);
          }
          // Add more conditions for other root types here
        }
      }
    }
  
    return validPlacements;
  };