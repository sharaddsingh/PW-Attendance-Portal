import React from 'react';
import { clsx } from 'clsx';

const LoadingSpinner = ({ size = 'md', className = '', fullScreen = false, text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinner = (
    <div className={clsx(
      "flex flex-col items-center justify-center space-y-3",
      fullScreen ? "min-h-screen" : "py-8",
      className
    )}>
      <div className={clsx(
        "animate-spin rounded-full border-b-2 border-blue-600",
        sizes[size]
      )}></div>
      {text && (
        <p className={clsx(
          "text-gray-600 font-medium",
          textSizes[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Simple inline spinner for buttons
export const InlineSpinner = ({ size = 'sm', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={clsx(
      "animate-spin rounded-full border-b-2 border-current",
      sizes[size],
      className
    )}></div>
  );
};

export default LoadingSpinner;