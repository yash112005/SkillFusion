import React, { useState } from 'react';

const Loader = ({ fullScreen = true }) => {
  const [imgError, setImgError] = useState(false);

  const content = (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-primary-500/20 dark:bg-primary-500/10 rounded-full blur-2xl animate-pulse-slow"></div>
        
        {!imgError ? (
          <img 
            src="/logo.png" 
            alt="SkillFusion Loading..." 
            className="h-20 w-auto object-contain animate-float relative z-10" 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30 animate-float relative z-10">
            <span className="text-white font-bold text-4xl font-display">S</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 font-medium">
        <span>Loading</span>
        <span className="animate-[bounce_1.4s_infinite] [animation-delay:-0.32s]">.</span>
        <span className="animate-[bounce_1.4s_infinite] [animation-delay:-0.16s]">.</span>
        <span className="animate-[bounce_1.4s_infinite]">.</span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-dark-bg w-full">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20 w-full">
      {content}
    </div>
  );
};

export default Loader;
