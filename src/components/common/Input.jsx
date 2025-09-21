import React from 'react';
import { clsx } from 'clsx';

const Input = ({ 
  label, 
  error, 
  className = '',
  required = false,
  type = 'text',
  ...props 
}) => {
  const inputStyles = clsx(
    "w-full px-4 py-2.5 border rounded-lg transition-colors duration-200 bg-transparent",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    error 
      ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500" 
      : "border-gray-300 text-gray-900 placeholder-gray-400",
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputStyles}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Floating Label Input Component
export const FloatingInput = ({ 
  label, 
  error, 
  className = '',
  required = false,
  type = 'text',
  value = '',
  ...props 
}) => {
  const hasValue = value && value.toString().length > 0;

  return (
    <div className="relative mb-6">
      <input
        type={type}
        value={value}
        className={clsx(
          "peer w-full px-0 py-2.5 text-gray-900 bg-transparent border-0 border-b-2",
          "focus:outline-none focus:ring-0 focus:border-blue-600",
          error ? "border-red-300" : "border-gray-300",
          className
        )}
        placeholder=" "
        {...props}
      />
      <label className={clsx(
        "absolute text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0]",
        "peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100",
        "peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6",
        hasValue && "scale-75 -translate-y-6 text-blue-600"
      )}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;