import React from 'react';

const GameHistoryLog = ({ history }) => {
  console.log("GameHistoryLog received history:", history);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">Game History</h2>
      <div className="h-[200px] w-[300px] overflow-y-auto border p-4 rounded-md">
        {history && history.length > 0 ? (
          history.map((entry, index) => (
            <div key={index} className="mb-2">
              {entry || "Empty entry"}
            </div>
          ))
        ) : (
          <div>No moves yet (History length: {history ? history.length : 'undefined'})</div>
        )}
      </div>
    </div>
  );
};

export default GameHistoryLog;