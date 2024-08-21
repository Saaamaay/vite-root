import React, { useRef, useEffect } from 'react';

const GameHistoryLog = ({ history }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div>
      <h3 className="font-bold mb-2">Game History</h3>
      <div 
        ref={scrollRef}
        className="h-[200px] w-[300px] overflow-y-auto border p-4 rounded-md"
      >
        {history && history.length > 0 ? (
          history.map((entry, index) => (
            <div key={index} className="mb-2">
              {entry || "Empty entry"}
            </div>
          ))
        ) : (
          <div>No moves yet</div>
        )}
      </div>
    </div>
  );
};

export default GameHistoryLog;