import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center tracking-tight">Vibe Fitness</h1>
      </div>
      
      {/* Simple spinner */}
      <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingScreen;

