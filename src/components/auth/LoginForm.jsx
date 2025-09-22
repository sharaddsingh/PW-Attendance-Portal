import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Smartphone } from "lucide-react";
import { FcGoogle } from "react-icons/fc"; // ✅ real Google logo

import Button from "../common/Button";
import Modal from "../common/Modal";
import { useAuth } from "../../contexts/AuthContext";
import {
  signInWithGoogle,
  handleRedirectResult,
  validateEmailRole,
  isMobileDevice,
  createUserDocument,
} from "../../services/firebase";

const LoginForm = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, isProfileComplete } = useAuth();

  useEffect(() => {
    // Handle redirect result on component mount
    const checkRedirectResult = async () => {
      const storedRole = sessionStorage.getItem("selectedRole");
      if (storedRole) {
        const result = await handleRedirectResult();
        if (result.success) {
          await processSignInResult(result, storedRole);
        }
        sessionStorage.removeItem("selectedRole");
      }
    };

    checkRedirectResult();
  }, []);

  useEffect(() => {
    // Redirect authenticated users
    if (isAuthenticated && user) {
      if (isProfileComplete) {
        const userRole =
          user.role ||
          (user.email?.includes("@pwioi.com") ? "student" : "faculty");
        navigate(
          userRole === "student" ? "/student-dashboard" : "/faculty-dashboard"
        );
      } else {
        // Navigate to role-specific profile form based on email domain
        const email = user.email || '';
        const isStudent = email.includes('@pwioi.com');
        navigate(isStudent ? "/student-profile" : "/faculty-profile");
      }
    }
  }, [isAuthenticated, isProfileComplete, user, navigate]);

  const processSignInResult = async (result, role) => {
    try {
      const { user } = result;
      const email = user.email;

      // Validate email role
      if (!validateEmailRole(email, role)) {
        setError(
          `Only ${
            role === "student" ? "@pwioi.com" : "@gmail.com"
          } emails allowed for ${role}s.`
        );
        return;
      }

      // Check mobile device requirement for students
      if (role === "student" && !isMobileDevice()) {
        setShowMobileWarning(true);
        return;
      }

      // Create or update user document
      const userData = {
        email,
        role,
        isNewSignup: true,
      };

      const createResult = await createUserDocument(user.uid, userData);
      if (!createResult.success) {
        setError("Failed to create user profile. Please try again.");
        return;
      }

      // Navigate based on role and profile completion
      // Direct to role-specific profile forms
      if (role === "student") {
        navigate("/student-profile");
      } else {
        navigate("/faculty-profile");
      }
    } catch (error) {
      console.error("Sign-in processing error:", error);
      setError("Failed to process sign-in. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      setError("Please select your role first");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await signInWithGoogle();

      if (result.success) {
        if (result.redirect) {
          // Store role for redirect result
          sessionStorage.setItem("selectedRole", selectedRole);
        } else {
          await processSignInResult(result, selectedRole);
        }
      } else {
        setError(result.error || "Failed to sign in. Please try again.");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-pattern bg-cover bg-center bg-fixed px-4 py-8">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Login to Attendance System
          </h2>
          <p className="text-white/80 text-xs sm:text-sm">
            Please select your role and sign in with Google
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Role Selection */}
          <div>
              <select
                value={selectedRole}
                onChange={handleRoleChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-black text-white rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                required
              >
              <option value="" disabled>
                Select Role
              </option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          {/* Google Sign-in Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={!selectedRole || loading}
            loading={loading}
            variant="google"
            className="w-full"
            icon={<FcGoogle className="w-5 h-5" />}   // ✅ real Google icon
          >
            Sign In with Google
          </Button>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Mobile Device Warning Modal */}
        <Modal
          isOpen={showMobileWarning}
          onClose={() => setShowMobileWarning(false)}
          title="Mobile Device Required"
          size="sm"
        >
          <div className="text-center space-y-4">
            <Smartphone className="w-16 h-16 text-blue-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mobile Access Only
              </h3>
              <p className="text-gray-600">
                Students can only access the attendance system from mobile
                devices. Please use your mobile phone or tablet.
              </p>
            </div>
            <Button
              onClick={() => setShowMobileWarning(false)}
              variant="primary"
              className="w-full"
            >
              Understood
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default LoginForm;
