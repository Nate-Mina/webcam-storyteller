import React from 'react';

interface LoadingSpinnerProps {
  size?: string; // e.g. 'h-5 w-5'
  // colorClasses?: string; // Original prop for the first spinner example, not used by StandardLoadingSpinner
  baseColor?: string; // The track color for StandardLoadingSpinner
  accentColor?: string; // The moving part color for StandardLoadingSpinner
}

// Original simple spinner (kept for reference or alternative use if needed, but not default)
// const SimpleLoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
//   size = 'h-5 w-5', 
//   colorClasses = 'border-sky-400' 
// }) => {
//   return (
//     <div 
//       className={`animate-spin rounded-full border-2 ${size} ${colorClasses} border-t-transparent`}
//       role="status"
//     >
//       <span className="sr-only">Loading...</span>
//     </div>
//   );
// };

// Standard spinner, preferred for its common appearance
const StandardLoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'h-5 w-5', 
  baseColor = 'border-slate-500', // The track color
  accentColor = 'border-t-sky-400' // The moving part color
}) => {
   return (
    <div 
      className={`animate-spin rounded-full border-2 ${size} ${baseColor} ${accentColor}`} 
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Example usage: <StandardLoadingSpinner size="h-8 w-8" baseColor="border-gray-300" accentColor="border-t-blue-500" />
export default StandardLoadingSpinner;