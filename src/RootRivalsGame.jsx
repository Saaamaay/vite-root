import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getValidPlacements } from './PlacementLogic';
import GameHistoryLog from './gameHistory';

const PLAYER_COLORS = ['bg-gray-200', 'bg-blue-200'];
const ROOT_TYPES = ['B', 'P', 'S', 'T', 'C'];
const BRANCHES = ['UP', 'RIGHT', 'DOWN', 'LEFT'];

const initializeBoard = () => Array(8).fill().map(() => Array(8).fill(null));
const initializeResources = () => ({ B: 1, P: 6, S: 12, T: 6, C: 6 });
const initializeBranches = () => BRANCHES.reduce((acc, branch) => ({ ...acc, [branch]: { status: 'Off', roots: [] } }), {});
const initializeZones = () => [null, null, null, null];

const RootRivalsGame = () => {
  const [board, setBoard] = useState(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selectedRootType, setSelectedRootType] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [resources, setResources] = useState([initializeResources(), initializeResources()]);
  const [branches, setBranches] = useState([initializeBranches(), initializeBranches()]);
  const [bulbPlaced, setBulbPlaced] = useState([false, false]);
  const [validPlacements, setValidPlacements] = useState([]);
  const [error, setError] = useState(null);
  const [zones, setZones] = useState(initializeZones());
  const [winner, setWinner] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);


  useEffect(() => {
    if (selectedRootType === 'B' || (selectedRootType && selectedBranch && bulbPlaced[currentPlayer])) {
      const newValidPlacements = getValidPlacements(board, currentPlayer, selectedRootType, branches, selectedBranch);
      setValidPlacements(newValidPlacements);
      setError(null);
    } else if (selectedRootType && selectedRootType !== 'B' && !selectedBranch) {
      setValidPlacements([]);
      setError("Please select a branch before placing a root.");
    } else {
      setValidPlacements([]);
      setError(null);
    }
  }, [selectedRootType, selectedBranch, board, currentPlayer, bulbPlaced, branches]);

  const handleRootTypeSelect = (type) => {
    setSelectedRootType(type);
    if (type !== 'B' && !bulbPlaced[currentPlayer]) {
      setError("You must place your Bulb first.");
    } else if (type !== 'B') {
      setSelectedBranch(null);
      setError("Please select a branch.");
    } else {
      setError(null);
    }
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    if (selectedRootType && selectedRootType !== 'B') {
      setError(null);
    }
  };

  const addToGameHistory = (action) => {
    setGameHistory(prevHistory => [...prevHistory, action]);
  };

// Main function to handle cell clicks on the game board
const handleCellClick = (row, col) => {
  // If no root type is selected, do nothing
  if (!selectedRootType) return;

  // If the bulb hasn't been placed and the selected root type is 'B', place the bulb
  if (!bulbPlaced[currentPlayer] && selectedRootType === 'B') {
    placeBulb(row, col);
    addToGameHistory(`Player ${currentPlayer + 1} placed Bulb at (${row}, ${col})`);

  } 
  // Otherwise, if a root type and branch are selected, and the placement is valid, place the root
  else if (selectedRootType && selectedBranch && validPlacements.some(([r, c]) => r === row && c === col)) {
    placeRoot(row, col);
    addToGameHistory(`Player ${currentPlayer + 1} placed ${selectedRootType} at (${row}, ${col}) on ${selectedBranch} branch`);

  }
};

// Function to place the bulb on the board
const placeBulb = (row, col) => {
  // Create a new board with the bulb placed
  const newBoard = [...board];
  newBoard[row][col] = `P${currentPlayer + 1}${selectedRootType}`;
  setBoard(newBoard);

  // Update the player's resources (decrease bulb count)
  const newResources = [...resources];
  newResources[currentPlayer].B -= 1;
  setResources(newResources);

  // Mark that the current player has placed their bulb
  const newBulbPlaced = [...bulbPlaced];
  newBulbPlaced[currentPlayer] = true;
  setBulbPlaced(newBulbPlaced);

  // End the turn
  endTurn();
};

// Function to place a root on the board
const placeRoot = (row, col) => {
  const newBoard = [...board];
  const currentCell = newBoard[row][col];
  // Check if this is an attack (Tertiary root placed on non-empty cell)
  const isAttack = selectedRootType === 'T' && currentCell !== null;

  // If it's an attack, handle it
  if (isAttack) {
    const attackedPlayer = parseInt(currentCell[1]) - 1;
    const attackedRootType = currentCell[2];
    handleAttack(attackedPlayer, attackedRootType, row, col);
  }

  // Place the new root on the board
  newBoard[row][col] = `P${currentPlayer + 1}${selectedRootType}`;
  setBoard(newBoard);

  // Update the player's resources
  const newResources = [...resources];
  newResources[currentPlayer][selectedRootType] -= 1;
  setResources(newResources);

  // Update the player's branch information
  const newBranches = [...branches];
  newBranches[currentPlayer][selectedBranch] = {
    status: 'On',
    roots: [...newBranches[currentPlayer][selectedBranch].roots, { type: selectedRootType, position: [row, col] }]
  };
  setBranches(newBranches);

  updateZoneControl(newBoard);

  // End the turn
  endTurn();
};

const handleAttack = (attackedPlayer, attackedRootType, row, col) => {
  const newBranches = [...branches];
  // Find the attacked branch
  const attackedBranch = Object.keys(newBranches[attackedPlayer]).find(branch => 
    newBranches[attackedPlayer][branch].roots.some(root => 
      root.position[0] === row && root.position[1] === col
    )
  );

  if (attackedBranch) {
    // Find the index of the attacked root
    const rootIndex = newBranches[attackedPlayer][attackedBranch].roots.findIndex(
      root => root.position[0] === row && root.position[1] === col
    );

    // Remove the attacked root and all subsequent roots
    const removedRoots = newBranches[attackedPlayer][attackedBranch].roots.splice(rootIndex);

    // Update the board by removing the attacked root and subsequent roots
    const newBoard = [...board];
    removedRoots.forEach(root => {
      newBoard[root.position[0]][root.position[1]] = null;
    });
    setBoard(newBoard);

    // Update the "last placed" marker for the affected branch
    let lastPlacedIndex = rootIndex - 1;
    while (lastPlacedIndex >= 0) {
      const root = newBranches[attackedPlayer][attackedBranch].roots[lastPlacedIndex];
      if (root.type === 'P' || root.type === 'S') {
        newBranches[attackedPlayer][attackedBranch].lastPlaced = root;
        break;
      }
      lastPlacedIndex--;
    }

    // If no Primary or Secondary root is found, the branch is now empty
    if (lastPlacedIndex < 0) {
      newBranches[attackedPlayer][attackedBranch].status = 'Off';
      newBranches[attackedPlayer][attackedBranch].lastPlaced = null;
    }

    // Update the branches state
    setBranches(newBranches);

    // Optionally, update the resources of the attacked player
    // const newResources = [...resources];
    // removedRoots.forEach(root => {
    //   newResources[attackedPlayer][root.type] += 1;
    // });
    // setResources(newResources);
  }
};


const updateZoneControl = (newBoard) => {
  const newZones = [...zones];
  const zoneSize = 4;

  for (let zone = 0; zone < 4; zone++) {
    const startRow = Math.floor(zone / 2) * zoneSize;
    const startCol = (zone % 2) * zoneSize;
    const zoneCount = [0, 0];

    for (let i = startRow; i < startRow + zoneSize; i++) {
      for (let j = startCol; j < startCol + zoneSize; j++) {
        const cell = newBoard[i][j];
        if (cell && cell[2] === 'C') {
          zoneCount[parseInt(cell[1]) - 1]++;
        }
      }
    }

    if (zoneCount[0] > zoneCount[1]) {
      newZones[zone] = 0;
    } else if (zoneCount[1] > zoneCount[0]) {
      newZones[zone] = 1;
    } else {
      newZones[zone] = null;
    }
  }

  setZones(newZones);
  checkWinCondition(newZones);
};

  const checkWinCondition = (newZones) => {
    const player1Zones = newZones.filter(zone => zone === 0).length;
    const player2Zones = newZones.filter(zone => zone === 1).length;

    if (player1Zones >= 3) {
      setWinner(0);
    } else if (player2Zones >= 3) {
      setWinner(1);
    }
  };

  const endTurn = () => {
    setCurrentPlayer(1 - currentPlayer);
    setSelectedRootType(null);
    setSelectedBranch(null);
  };

  const getCellColor = (cell, rowIndex, colIndex) => {
    const opponentPlayer = currentPlayer === 0 ? 2 : 1;
    const isValidPlacement = validPlacements.some(([r, c]) => r === rowIndex && c === colIndex);
    
    if (isValidPlacement) {
      if (selectedRootType === 'T' && cell && cell.startsWith(`P${opponentPlayer}`)) {
        return 'bg-red-200';
      }
      return 'bg-green-200';
    }
    
    if (cell) {
      return PLAYER_COLORS[parseInt(cell[1]) - 1];
    }
    
    return 'bg-white';
  };

  const renderBoard = () => (
    <div className="relative grid grid-cols-8 gap-1 w-96 h-96">
      {/* Horizontal zone separator */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black z-10"></div>
      {/* Vertical zone separator */}
      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-black z-10"></div>
      
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isZoneBorder = rowIndex % 4 === 0 || colIndex % 4 === 0;
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-full h-full border flex items-center justify-center
                ${getCellColor(cell, rowIndex, colIndex)}`}
              style={{ aspectRatio: '1 / 1' }}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell && <span className="text-sm font-bold">{cell}</span>}
            </div>
          );
        })
      )}
    </div>
  );

  const renderResourceButtons = () => (
    <div className="flex flex-col gap-2 mb-4">
      <h3 className="font-bold">Select Root Type:</h3>
      {ROOT_TYPES.map((type) => (
        <Button
          key={type}
          className={`bg-gray-300 text-black w-full 
            ${selectedRootType === type ? 'bg-blue-300 ring-2 ring-blue-500' : ''}`}
          onClick={() => handleRootTypeSelect(type)}
          disabled={resources[currentPlayer][type] === 0 || (type === 'B' && bulbPlaced[currentPlayer]) || winner !== null}
        >
          {type} ({resources[currentPlayer][type]})
        </Button>
      ))}
    </div>
  );

  const renderBranchButtons = () => (
    <div className="flex flex-col gap-2">
      <h3 className="font-bold">Select Branch:</h3>
      {BRANCHES.map((branch) => (
        <div key={branch} className="flex items-center">
          <Button
            className={`bg-gray-300 text-black w-full mr-2
              ${selectedBranch === branch ? 'bg-blue-300 ring-2 ring-blue-500' : ''}`}
            onClick={() => handleBranchSelect(branch)}
            disabled={!bulbPlaced[currentPlayer] || winner !== null}
          >
            {branch} ({branches[currentPlayer][branch].status})
          </Button>
          <div className="text-xs">
            P1: {branches[0][branch].roots.length} | P2: {branches[1][branch].roots.length}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPlayerInfo = (player) => (
    <div className={`p-4 ${PLAYER_COLORS[player]} rounded-lg mb-4`}>
      <h3 className="font-bold mb-2">Player {player + 1}</h3>
      {ROOT_TYPES.map((type) => (
        <div key={type}>
          {type}: {resources[player][type]}
        </div>
      ))}
      <div className="mt-2">
        Zones Controlled: {zones.filter(zone => zone === player).length}
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Root Rivals</h1>
      <div className="flex gap-4 mb-4">
        {renderPlayerInfo(0)}
        {renderPlayerInfo(1)}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {winner !== null 
              ? `Game Over - Player ${winner + 1} Wins!`
              : `Game Board - Player ${currentPlayer + 1}'s Turn
                ${!bulbPlaced[currentPlayer] ? " (Place your Bulb)" : ""}`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {renderBoard()}
            <div className="w-40">
              {renderResourceButtons()}
            </div>
            <div className="w-64">{renderBranchButtons()}</div>
            <GameHistoryLog history={gameHistory} />
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default RootRivalsGame; 