/**
 * Authentication Context
 * 
 * This context manages the global authentication state for the PW Attendance Portal.
 * It handles user authentication, profile management, and provides authentication
 * utilities throughout the application.
 * 
 * Key Features:
 * - Firebase Authentication integration
 * - User profile management
 * - Automatic profile loading on authentication
 * - Global authentication state management
 * - Error handling for authentication operations
 * 
 * @author PW Attendance Portal Team
 * @version 1.0.0
 */

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { 
  auth, 
  getUserDocument, 
  getProfileDocument, 
  createUserDocument,
  signOutUser
} from "../services/firebase";

// Create authentication context with default empty object
const AuthContext = createContext({});

/**
 * AuthProvider Component
 * 
 * Provides authentication context to all child components.
 * Manages user authentication state, profile data, and loading states.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to auth context
 * @returns {JSX.Element} Provider component with authentication context
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);           // Firebase user object
  const [userProfile, setUserProfile] = useState(null);  // User profile data from Firestore
  const [loading, setLoading] = useState(true);     // Loading state for auth operations
  const [error, setError] = useState(null);         // Error state for auth operations

  /**
   * Load User Data
   * 
   * Loads user data from Firestore when a user is authenticated.
   * This function handles both new users (creates basic user document)
   * and existing users (loads profile data).
   * 
   * @param {Object} firebaseUser - Firebase user object from authentication
   */
  const loadUserData = async (firebaseUser) => {
    try {
      setLoading(true);
      
      // Check if user document exists in Firestore
      const userResult = await getUserDocument(firebaseUser.uid);
      
      if (!userResult.success) {
        // Create basic user document if it doesn't exist (new user)
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: null, // Will be set during profile completion
          profileComplete: false
        };
        
        await createUserDocument(firebaseUser.uid, userData);
        setUserProfile(userData);
      } else {
        // Existing user - check for complete profile document
        const profileResult = await getProfileDocument(firebaseUser.uid);
        
        if (profileResult.success) {
          // User has completed profile - merge user and profile data
          setUserProfile({
            ...userResult.data,
            ...profileResult.data,
            profileComplete: true
          });
        } else {
          // User exists but hasn't completed profile
          setUserProfile({
            ...userResult.data,
            profileComplete: false
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update User Profile
   * 
   * Updates the user profile state after profile completion.
   * This function is typically called after a user completes their profile.
   * 
   * @param {Object} profileData - Updated profile data
   */
  const updateUserProfile = (profileData) => {
    setUserProfile(prev => ({
      ...prev,
      ...profileData,
      profileComplete: true
    }));
  };

  /**
   * Logout Function
   * 
   * Signs out the current user and clears all authentication state.
   * Calls Firebase signOut and clears local state variables.
   */
  const logout = async () => {
    try {
      const result = await signOutUser();
      if (result.success) {
        setUser(null);
        setUserProfile(null);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
    }
  };

  /**
   * Authentication State Listener
   * 
   * Sets up Firebase authentication state listener that automatically
   * updates the app state when user signs in or out.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in - set user and load profile data
          setUser(firebaseUser);
          await loadUserData(firebaseUser);
        } else {
          // User is signed out - clear all state
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError(error.message);
        setLoading(false);
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  // Context value object - all the data and functions available to consumers
  const value = {
    user,                // Firebase user object
    userProfile,         // User profile data from Firestore
    loading,             // Loading state
    error,               // Error state
    setUser,             // Direct user setter (use with caution)
    updateUserProfile,   // Update profile function
    logout,              // Logout function
    loadUserData         // Load user data function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 
 * Custom hook to access authentication context.
 * Must be used within an AuthProvider component.
 * 
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => useContext(AuthContext);
