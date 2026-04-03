import React from 'react';

const Button = () => {
  return (
    <button className="cursor-pointer bg-gray-800 px-3 py-2 rounded-md text-white tracking-wider shadow-xl animate-bounce">
      <svg className="w-5 h-5" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export default Button;
