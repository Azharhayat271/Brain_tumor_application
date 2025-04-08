import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-16 h-16 border-4 border-t-transparent border-primary border-solid rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
