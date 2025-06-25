import React from 'react';

interface ErrorDisplayProps {
  message: string;
  className?: string;
}

const ErrorIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div 
      className={`bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative flex items-center ${className}`} 
      role="alert"
    >
      {ErrorIcon}
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default ErrorDisplay;
