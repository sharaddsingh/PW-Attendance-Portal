/**
 * Reusable Button Component
 * 
 * A flexible button component with multiple variants, sizes, and states.
 * Built with Tailwind CSS and supports icons, loading states, and accessibility features.
 * 
 * Key Features:
 * - Multiple variants (primary, secondary, success, danger, outline, ghost, google)
 * - Various sizes (sm, md, lg, xl)
 * - Loading state with spinner animation
 * - Icon support with proper spacing
 * - Accessibility features (focus rings, disabled states)
 * - Customizable styling via className prop
 * 
 * @author PW Attendance Portal Team
 * @version 1.0.0
 */

import React from 'react';
import { clsx } from 'clsx'; // Utility for conditional class names

/**
 * Button Component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content (text, elements)
 * @param {string} [props.variant='primary'] - Button style variant
 * @param {string} [props.size='md'] - Button size
 * @param {boolean} [props.disabled=false] - Whether button is disabled
 * @param {boolean} [props.loading=false] - Whether button is in loading state
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ReactElement} [props.icon] - Optional icon element
 * @param {...Object} props - Additional HTML button props
 * @returns {JSX.Element} Button element
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  className = '',
  icon,
  ...props 
}) => {
  // Base styles applied to all buttons (accessibility, transitions, etc.)
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Style variants for different button types
  const variants = {
    primary: "bg-black hover:bg-gray-800 text-white focus:ring-gray-500",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    outline: "border-2 border-gray-300 hover:border-gray-400 text-gray-700 bg-transparent focus:ring-gray-500",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500",
    google: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 focus:ring-blue-500 shadow-sm"
  };
  
  // Size variants for different button dimensions
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading} // Disable when explicitly disabled or loading
      {...props}
    >
      {/* Loading spinner - only shown when loading is true */}
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {/* Icon - only shown when not loading and icon is provided */}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      
      {/* Button content */}
      {children}
    </button>
  );
};

export default Button;
