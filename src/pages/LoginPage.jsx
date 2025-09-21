/**
 * Login Page Component
 * 
 * This is the main authentication page for the PW Attendance Portal.
 * It provides role-based authentication using Google OAuth with email validation.
 * 
 * Key Features:
 * - Role selection (Student vs Faculty)
 * - Email domain validation (@pwioi.com for students, others for faculty)
 * - Google OAuth authentication with popup/redirect fallback
 * - Mobile-responsive design with device detection
 * - Admin tools for Firebase data initialization
 * 
 * Authentication Flow:
 * 1. User selects their role (Student/Faculty)
 * 2. User clicks Google Sign In
 * 3. Email is validated against selected role
 * 4. User is redirected to appropriate dashboard or profile completion
 * 
 * @author PW Attendance Portal Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { GraduationCap, UserCheck, Smartphone, Monitor } from 'lucide-react';
import { signInWithGoogle, handleRedirectResult, validateEmailRole } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import DataInitializer from '../components/admin/DataInitializer';

/**
 * LoginPage Component
 * 
 * Renders the authentication interface with role selection and Google sign-in.
 * Handles both popup and redirect-based Google authentication flows.
 * 
 * @returns {JSX.Element} The login page interface
 */
const LoginPage = () => {
  // Component state
  const [selectedRole, setSelectedRole] = useState(null);  // Selected user role (student/faculty)
  const [isLoading, setIsLoading] = useState(false);       // Loading state for authentication
  const [error, setError] = useState('');                  // Error message state
  const { setUser } = useAuth();                           // Authentication context

  /**
   * Handle Redirect Result Effect
   * 
   * This effect runs on component mount to handle Google OAuth redirect results.
   * When popup authentication is blocked, Google redirects back to this page,
   * and we need to process the authentication result.
   */
  useEffect(() => {
    // Handle redirect result when user comes back from Google sign-in
    const handleRedirect = async () => {
      const result = await handleRedirectResult();
      if (result.success && result.user) {
        // Validate email against previously selected role (stored in localStorage)
        const savedRole = localStorage.getItem('selectedRole');
        if (savedRole && validateEmailRole(result.user.email, savedRole)) {
          setUser(result.user);
        } else {
          setError(`Invalid email for ${savedRole} role. ${savedRole === 'student' ? 'Students must use @pwioi.com email.' : 'Faculty cannot use @pwioi.com email.'}`);
        }
        // Clean up stored role
        localStorage.removeItem('selectedRole');
      }
    };
    
    handleRedirect();
  }, [setUser]);

  /**
   * Handle Role Selection
   * 
   * Updates the selected role and clears any existing error messages.
   * 
   * @param {string} role - The selected role ('student' or 'faculty')
   */
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError(''); // Clear any previous errors
  };

  /**
   * Handle Google Sign In
   * 
   * Initiates Google OAuth authentication flow with email validation.
   * Supports both popup and redirect authentication methods.
   * 
   * Process:
   * 1. Validates that a role is selected
   * 2. Stores selected role in localStorage (for redirect fallback)
   * 3. Attempts popup authentication
   * 4. Validates email domain against selected role
   * 5. Sets user if validation passes
   */
  const handleGoogleSignIn = async () => {
    // Ensure user has selected a role
    if (!selectedRole) {
      setError('Please select your role first');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Save role for redirect validation (in case popup is blocked)
      localStorage.setItem('selectedRole', selectedRole);
      
      const result = await signInWithGoogle();
      
      if (result.success) {
        if (result.redirect) {
          // Popup was blocked, user will be redirected to Google
          // handleRedirectResult will process the result when they return
          return;
        }
        
        // Popup authentication succeeded - validate email domain
        if (validateEmailRole(result.user.email, selectedRole)) {
          setUser(result.user);
        } else {
          // Email doesn't match selected role requirements
          const errorMsg = selectedRole === 'student' 
            ? 'Students must use @pwioi.com email address' 
            : 'Faculty cannot use @pwioi.com email address';
          setError(errorMsg);
        }
      } else {
        setError(result.error || 'Failed to sign in with Google');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(false);
      localStorage.removeItem('selectedRole');
    }
  };

  // Device detection for responsive behavior
  const isMobile = window.innerWidth <= 768;

  // Render the login interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PW Attendance Portal</h1>
              <p className="text-sm text-gray-600">Physics Wallah Institute of Innovation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {isMobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            <span>{isMobile ? 'Mobile' : 'Desktop'} View</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="card fade-in">
            <div className="card-header text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Please select your role and sign in to continue</p>
            </div>

            <div className="card-body space-y-6">
              {/* Role Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 text-center">I am a:</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  {/* Student Role */}
                  <button
                    onClick={() => handleRoleSelect('student')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedRole === 'student'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="w-6 h-6" />
                      <div className="text-left flex-1">
                        <div className="font-medium">Student</div>
                        <div className="text-sm text-gray-500">
                          Access with @pwioi.com email
                        </div>
                        {isMobile && (
                          <div className="text-xs text-green-600 mt-1">
                            📱 Mobile optimized
                          </div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Faculty Role */}
                  <button
                    onClick={() => handleRoleSelect('faculty')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedRole === 'faculty'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <UserCheck className="w-6 h-6" />
                      <div className="text-left flex-1">
                        <div className="font-medium">Faculty</div>
                        <div className="text-sm text-gray-500">
                          Any Google account except @pwioi.com
                        </div>
                        {!isMobile && (
                          <div className="text-xs text-blue-600 mt-1">
                            💻 Desktop recommended
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Role-specific Information */}
              {selectedRole && (
                <div className="bg-gray-50 rounded-lg p-4 slide-in">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {selectedRole === 'student' ? 'Student Features:' : 'Faculty Features:'}
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {selectedRole === 'student' ? (
                      <>
                        <li>• QR code attendance scanning</li>
                        <li>• Photo verification for attendance</li>
                        <li>• Leave request submissions</li>
                        <li>• Attendance history and statistics</li>
                        {isMobile && <li>• Optimized for mobile devices</li>}
                      </>
                    ) : (
                      <>
                        <li>• Manual attendance management</li>
                        <li>• QR code generation for classes</li>
                        <li>• Student attendance reports</li>
                        <li>• Leave request approvals</li>
                        <li>• Batch and student management</li>
                      </>
                    )}
                  </ul>
                </div>
              )}

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={!selectedRole || isLoading}
                className={`w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  !selectedRole || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 loading-spinner"></div>
                ) : (
                  <FcGoogle className="text-xl" />
                )}
                <span>
                  {isLoading 
                    ? 'Signing in...' 
                    : selectedRole 
                      ? `Continue as ${selectedRole === 'student' ? 'Student' : 'Faculty'}`
                      : 'Select role first'
                  }
                </span>
              </button>

              {/* Additional Info */}
              <div className="text-center text-sm text-gray-500 space-y-2">
                <p>
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
                {selectedRole === 'student' && (
                  <p className="text-blue-600">
                    📧 Make sure to use your @pwioi.com email address
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mobile-specific Notice */}
          {isMobile && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                📱 You're on mobile! Student features are optimized for your device.
              </p>
            </div>
          )}

          {/* Admin Tools - Initialize Firebase Data */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">Admin Tools</h3>
            <DataInitializer />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          <p>&copy; 2024 Physics Wallah Institute of Innovation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;