import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { canPlacePrimary, getValidPlacements } from './PlacementLogic';


const PLAYER_COLORS = ['bg-gray-200', 'bg-blue-200'];
const ROOT_TYPES = ['B', 'P', 'S', 'T', 'C'];
const BRANCHES = ['UP', 'RIGHT', 'DOWN', 'LEFT'];

const initializeBoard = () => Array(8).fill().map(() => Array(8).fill(null));
const initializeResources = () => ({ B: 1, P: 6, S: 12, T: 6, C: 6 });
const initializeBranches = () => BRANCHES.reduce((acc, branch) => ({ ...acc, [branch]: { status: 'Off', roots: [] } }), {});

const RootRivalsGame = () => {
  const [board, setBoard] = useState(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [selectedRootType, setSelectedRootType] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [resources, setResources] = useState([initializeResources(), initializeResources()]);
  const [branches, setBranches] = useState([initializeBranches(), initializeBranches()]);
  const [bulbPlaced, setBulbPlaced] = useState([false, false]); // Track if each player has placed their Bulb
  const [validPlacements, setValidPlacements] = useState([]);


  useEffect(() => {
    if (selectedRootType && (bulbPlaced[currentPlayer] || selectedRootType === 'B')) {
      const newValidPlacements = getValidPlacements(board, currentPlayer, selectedRootType, branches, selectedBranch);
      setValidPlacements(newValidPlacements);
    } else {
      setValidPlacements([]);
    }
  }, [selectedRootType, selectedBranch, board, currentPlayer, bulbPlaced]);


  const handleCellClick = (row, col) => {
    if (board[row][col] !== null) return; // Cell is already occupied

    if (!bulbPlaced[currentPlayer]) {
      // Bulb placement logic
      if (selectedRootType === 'B') {
        const newBoard = [...board];
        newBoard[row][col] = `P${currentPlayer + 1}${selectedRootType}`;
        setBoard(newBoard);

        const newResources = [...resources];
        newResources[currentPlayer].B -= 1;
        setResources(newResources);

        const newBulbPlaced = [...bulbPlaced];
        newBulbPlaced[currentPlayer] = true;
        setBulbPlaced(newBulbPlaced);

        setCurrentPlayer(1 - currentPlayer);
        setSelectedRootType(null);
      }
    } else if (selectedRootType && selectedBranch) {
      // Existing logic for other root types
      const newBoard = [...board];
      newBoard[row][col] = `P${currentPlayer + 1}${selectedRootType}`;
      setBoard(newBoard);

      const newResources = [...resources];
      newResources[currentPlayer][selectedRootType] -= 1;
      setResources(newResources);

      const newBranches = [...branches];
      newBranches[currentPlayer][selectedBranch] = {
        status: 'On',
        roots: [...newBranches[currentPlayer][selectedBranch].roots, { type: selectedRootType, position: [row, col] }]
      };
      setBranches(newBranches);

      setCurrentPlayer(1 - currentPlayer);
      setSelectedRootType(null);
      setSelectedBranch(null);
    }
  };

  const renderBoard = () => (
    <div className="grid grid-cols-8 gap-1 w-96 h-96">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`w-full h-full border border-gray-300 flex items-center justify-center ${
              cell ? PLAYER_COLORS[parseInt(cell[1]) - 1] : 'bg-white'
            }`}
            style={{ aspectRatio: '1 / 1' }}
            onClick={() => handleCellClick(rowIndex, colIndex)}
          >
            {cell && <span className="text-sm font-bold">{cell}</span>}
          </div>
        ))
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
          onClick={() => setSelectedRootType(type)}
          disabled={resources[currentPlayer][type] === 0 || (type === 'B' && bulbPlaced[currentPlayer])}
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
        <Button
          key={branch}
          className={`bg-gray-300 text-black w-full 
            ${selectedBranch === branch ? 'bg-blue-300 ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedBranch(branch)}
          disabled={!bulbPlaced[currentPlayer]}
        >
          {branch} ({branches[currentPlayer][branch].status})
        </Button>
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
            Game Board - Player {currentPlayer + 1}'s Turn
            {!bulbPlaced[currentPlayer] && " (Place your Bulb)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {renderBoard()}
            <div className="w-40">
              {renderResourceButtons()}
            </div>
            <div className="w-40">{renderBranchButtons()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RootRivalsGame;