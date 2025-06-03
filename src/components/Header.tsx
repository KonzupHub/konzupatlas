
import React from 'react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/b3b72f42-ea5e-4ea3-8e28-557f80999510.png" 
              alt="Konzup Atlas Logo" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Konzup Atlas</h1>
              <p className="text-sm text-gray-600">Automatização de Master Plans</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">v1.0</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
