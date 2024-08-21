import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Root Rivals</h1>
      <p className="mb-8">A strategic game of root domination.</p>
      <Link to="/game">
        <Button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Start Game
        </Button>
      </Link>
    </div>
  );
};

export default HomePage; 