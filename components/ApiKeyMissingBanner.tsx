import React from 'react';

const ApiKeyMissingBanner: React.FC = () => {
  return (
    <div className="bg-red-600 text-white p-3 text-center fixed top-0 left-0 right-0 z-50 shadow-lg">
      <p className="font-bold text-sm sm:text-base">Configuration Error: Gemini API Key is missing.</p>
      <p className="text-xs sm:text-sm">Please ensure the <code>API_KEY</code> environment variable is correctly set for the application to function.</p>
    </div>
  );
};

export default ApiKeyMissingBanner;
