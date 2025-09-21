/**
 * Main Application Component
 * 
 * This is the root component of the PW Attendance Portal application.
 * It handles the overall application routing, authentication flow, and 
 * renders appropriate components based on user authentication and profile status.
 * 
 * Key Features:
 * - Role-based routing (Faculty vs Student dashboards)
 * - Authentication state management
 * - Profile completion flow
 * - Protected routes for role-specific access
 * 
 * @author PW Attendance Portal Team
 * @version 1.0.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import FacultyDashboard from "./components/faculty/FacultyDashboard";
import StudentDashboard from "./components/student/StudentDashboard";
import CompleteProfile from "./pages/CompleteProfile";
import ProtectedRoute from "./components/common/ProtectedRoute";
import QRRotationDebugger from "./components/debug/QRRotationDebugger";

/**
 * AppRoutes Component
 * 
 * Manages the application routing logic based on authentication and profile status.
 * This component implements a multi-step authentication flow:
 * 1. Check if user is authenticated
 * 2. Check if user has completed their profile
 * 3. Route to appropriate dashboard based on user role
 * 
 * @returns {JSX.Element} The appropriate component based on user state
 */
function AppRoutes() {
  // Get authentication state from AuthContext
  const { user, userProfile, loading } = useAuth();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated, show login page
  if (!user) {
    return <LoginPage />;
  }

  // If user is authenticated but doesn't have a complete profile, show profile completion
  // This ensures all users have proper profile data before accessing the main application
  if (user && !userProfile?.profileComplete) {
    return <CompleteProfile />;
  }

  // Main application routes - user is authenticated and has complete profile
  return (
    <Routes>
      {/* Root route - redirects to appropriate dashboard based on user role */}
      <Route path="/" element={
        userProfile?.role === 'faculty' ? <FacultyDashboard /> : <StudentDashboard />
      } />
      
      {/* Profile completion route - accessible after authentication */}
      <Route path="/complete-profile" element={<CompleteProfile />} />
      
      {/* Protected faculty dashboard - only accessible by faculty members */}
      <Route
        path="/faculty-dashboard"
        element={
          <ProtectedRoute allowedRole="faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Protected student dashboard - only accessible by students */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Temporary debug route for QR rotation testing */}
      <Route path="/debug-qr" element={<QRRotationDebugger />} />
    </Routes>
  );
}

/**
 * Main App Component
 * 
 * The root component that wraps the entire application with necessary providers.
 * It sets up the authentication context and browser routing.
 * 
 * Provider Structure:
 * - AuthProvider: Manages authentication state and user data
 * - BrowserRouter: Enables client-side routing
 * 
 * @returns {JSX.Element} The complete application with all providers
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
