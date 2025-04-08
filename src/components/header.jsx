import React from 'react';

const Header = () => {
  return (
    <header className="bg-primary text-white py-6 shadow-md">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl font-bold">Brain Tumor Detection</h1>
        <p className="mt-2 text-lg">Upload a brain scan image for analysis</p>
      </div>
    </header>
  );
};

export default Header;
