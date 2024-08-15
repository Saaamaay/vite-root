


const isLastPrimaryLastPlaced = (branchRoots) => {
  const lastPrimary = findLastPrimary(branchRoots);
  const lastPlaced = findLastPlacedPrimaryOrSecondary(branchRoots);
  return lastPrimary && lastPlaced && lastPrimary === lastPlaced;
};

export const canPlacePrimary = (board, currentPlayer, row, col, branches, selectedBranch) => {
  if (board[row][col] !== null) return false;
  
  const bulbPosition = findBulbPosition(board, currentPlayer);
  if (!bulbPosition) return false;

  const branchRoots = branches[currentPlayer][selectedBranch].roots;

  if (branchRoots.length === 0) {
    return isAdjacentInDirection(bulbPosition, [row, col], selectedBranch);
  } else {
    if (!isLastPrimaryLastPlaced(branchRoots)) return false;

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
  if (board[row][col] !== null) return false;
  
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

export const canPlaceControl = (board, currentPlayer, row, col, branches, selectedBranch) => {
  if (board[row][col] !== null) return false;
  
  const branchRoots = branches[currentPlayer][selectedBranch].roots;
  if (branchRoots.length === 0) return false;

  const lastPiece = findLastPlacedPrimaryOrSecondary(branchRoots);
  if (!lastPiece || (lastPiece.type !== "S" )) return false;

  const direction = getDirection(selectedBranch);
  const validCells = getValidAdjacentCells(lastPiece.position, direction);

  return validCells.some(([validRow, validCol]) => 
    validRow === row && validCol === col
  );
};

// Helper function to check if a cell is valid for tertiary placement
const isValidCellForTertiary = (cell, opponentPlayerNum) => {
  return cell === null || (cell.startsWith(`P${opponentPlayerNum}`) && (cell.endsWith('S') || cell.endsWith('P')));
};

export const canPlaceTertiary = (board, currentPlayer, row, col, branches, selectedBranch) => {
  const branchRoots = branches[currentPlayer][selectedBranch].roots;
  if (branchRoots.length === 0) return false;

  const lastPiece = findLastPlacedPrimaryOrSecondary(branchRoots);
  if (!lastPiece || (lastPiece.type !== "S" )) return false;

  const direction = getDirection(selectedBranch);
  const validCells = getValidAdjacentCells(lastPiece.position, direction);

  const opponentPlayer = currentPlayer === 0 ? 2:1 ; // Note: Player numbers are 1 and 2 in the board state
  console.log("opponentplayernumber:" + currentPlayer);

  return validCells.some(([validRow, validCol]) => 
    validRow === row && 
    validCol === col && 
    isValidCellForTertiary(board[row][col], opponentPlayer),
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

  const canPlace = {
    B: () => true,
    P: (i, j) => canPlacePrimary(board, currentPlayer, i, j, branches, selectedBranch),
    S: (i, j) => canPlaceSecondary(board, currentPlayer, i, j, branches, selectedBranch),
    C: (i, j) => canPlaceControl(board, currentPlayer, i, j, branches, selectedBranch),
    T: (i, j) => canPlaceTertiary(board, currentPlayer, i, j, branches, selectedBranch)
  };

  board.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (selectedBranch && canPlace[selectedRootType](i, j)) {
        validPlacements.push([i, j]);
      }
    });
  });

  console.log(validPlacements);
  return validPlacements;
};



