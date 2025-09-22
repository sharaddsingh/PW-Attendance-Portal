import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Building2, BookOpen, Check, Briefcase, Code, Database, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { createProfileDocument } from '../../services/firebase';

// This section is removed as we now have ALL_SUBJECTS

// Department options
const DEPARTMENTS = [
  'School of Technology',
  'School of Management'
];

// All subjects combined
const ALL_SUBJECTS = [
  // Technology subjects
  { id: 'java', name: 'JAVA', icon: '☕', department: 'School of Technology' },
  { id: 'python', name: 'PYTHON', icon: '🐍', department: 'School of Technology' },
  { id: 'javascript', name: 'JAVASCRIPT', icon: '🌐', department: 'School of Technology' },
  { id: 'sql', name: 'SQL', icon: '🗃️', department: 'School of Technology' },
  { id: 'dbms', name: 'DBMS (Database Management)', icon: '💾', department: 'School of Technology' },
  { id: 'dsa', name: 'DSA (Data Structures)', icon: '🌳', department: 'School of Technology' },
  { id: 'react', name: 'React.js', icon: '⚛️', department: 'School of Technology' },
  { id: 'nodejs', name: 'Node.js', icon: '🟢', department: 'School of Technology' },
  { id: 'cpp', name: 'C++', icon: '⚙️', department: 'School of Technology' },
  { id: 'c', name: 'C Programming', icon: '📝', department: 'School of Technology' },
  { id: 'html-css', name: 'HTML/CSS', icon: '🎨', department: 'School of Technology' },
  { id: 'machine-learning', name: 'Machine Learning', icon: '🤖', department: 'School of Technology' },
  { id: 'data-science', name: 'Data Science', icon: '📊', department: 'School of Technology' },
  { id: 'cloud-computing', name: 'Cloud Computing', icon: '☁️', department: 'School of Technology' },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔐', department: 'School of Technology' },
  { id: 'mobile-dev', name: 'Mobile Development', icon: '📱', department: 'School of Technology' },
  { id: 'devops', name: 'DevOps', icon: '🔄', department: 'School of Technology' },
  { id: 'blockchain', name: 'Blockchain', icon: '🔗', department: 'School of Technology' },
  // Management subjects
  { id: 'business-comm', name: 'Business Communication', icon: '💼', department: 'School of Management' },
  { id: 'critical-comm', name: 'Critical Communication', icon: '🗣️', department: 'School of Management' },
  { id: 'excel', name: 'Advanced Excel', icon: '📈', department: 'School of Management' },
  { id: 'marketing', name: 'Marketing Management', icon: '📢', department: 'School of Management' },
  { id: 'finance', name: 'Financial Management', icon: '💰', department: 'School of Management' },
  { id: 'hr', name: 'Human Resource Management', icon: '👥', department: 'School of Management' },
  { id: 'operations', name: 'Operations Management', icon: '⚙️', department: 'School of Management' },
  { id: 'strategic', name: 'Strategic Management', icon: '🎯', department: 'School of Management' },
  { id: 'analytics', name: 'Business Analytics', icon: '📊', department: 'School of Management' },
  { id: 'digital-marketing', name: 'Digital Marketing', icon: '🌐', department: 'School of Management' },
  { id: 'entrepreneurship', name: 'Entrepreneurship', icon: '🚀', department: 'School of Management' },
  { id: 'project-mgmt', name: 'Project Management', icon: '📋', department: 'School of Management' }
];

// Removed designation and experience options as they are no longer needed

const FacultyProfileForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    department: '',
    specialization: '',
    subjects: [],
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // No longer needed as department is now a dropdown
  // Subjects are shown regardless of department selection

  const handleSubjectChange = (subjectId, isChecked) => {
    setFormData(prev => {
      let newSubjects;
      if (isChecked) {
        newSubjects = [...prev.subjects, subjectId];
      } else {
        newSubjects = prev.subjects.filter(id => id !== subjectId);
      }
      return {
        ...prev,
        subjects: newSubjects
      };
    });
    
    // Clear error when subjects are selected
    if (errors.subjects) {
      setErrors(prev => ({ ...prev, subjects: '' }));
    }
  };

  const getSubjectById = (subjectId) => {
    return ALL_SUBJECTS.find(s => s.id === subjectId);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    } else if (formData.employeeId.trim().length < 3) {
      newErrors.employeeId = 'Employee ID must be at least 3 characters';
    }

    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    if (formData.subjects.length === 0) {
      newErrors.subjects = 'Please select at least one subject';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBackToLogin = () => {
    // Sign out the user and redirect to login
    if (window.confirm('Are you sure you want to go back? You will be signed out.')) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Create profile document
      const profileData = {
        fullName: formData.fullName.trim(),
        employeeId: formData.employeeId.trim().toUpperCase(),
        department: formData.department,
        specialization: formData.specialization.trim(),
        subjects: formData.subjects,
        phone: formData.phone.trim(),
        email: user.email,
        isProfileComplete: true
      };

      const profileResult = await createProfileDocument(user.uid, profileData);
      
      if (!profileResult.success) {
        throw new Error('Failed to create profile');
      }

      // Update auth context
      updateUserProfile({
        ...profileData,
        role: 'faculty'
      });

      // Navigate to faculty dashboard
      navigate('/faculty-dashboard');

    } catch (error) {
      console.error('Profile completion error:', error);
      setErrors({
        submit: error.message || 'Failed to complete profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-pattern bg-cover bg-center bg-fixed flex items-center justify-center py-4 px-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-3xl relative">
        {/* Back Button */}
        <button
          onClick={handleBackToLogin}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Login</span>
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Complete Your Faculty Profile
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Please fill in your details to access the faculty dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-gray-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Full Name */}
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={errors.fullName}
                required
                placeholder="Enter your full name"
              />

              {/* Employee ID - Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., EMP001 or FAC2024"
                  required
                />
                {errors.employeeId && (
                  <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-gray-600" />
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Department/School */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department/School <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select your department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
              </div>

              {/* Specialization (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Machine Learning, Data Science, Cloud Computing"
                />
              </div>
            </div>
          </div>

          {/* Teaching Subjects Selection - Show ALL subjects */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Code className="inline w-4 h-4 mr-1 text-gray-600" />
              Teaching Subjects <span className="text-red-500">*</span>
              <span className="text-gray-500 text-xs ml-2">(Select all subjects you can teach)</span>
            </label>
            
            {/* Technology Subjects Section */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Database className="w-4 h-4 mr-2 text-blue-600" />
                Technology Subjects
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border border-gray-200 rounded-lg p-3 bg-white">
                {ALL_SUBJECTS.filter(s => s.department === 'School of Technology').map(subject => (
                  <div 
                    key={subject.id} 
                    className="flex items-center p-2 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-blue-300"
                  >
                    <input
                      type="checkbox"
                      id={`subject-${subject.id}`}
                      checked={formData.subjects.includes(subject.id)}
                      onChange={(e) => handleSubjectChange(subject.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label 
                      htmlFor={`subject-${subject.id}`} 
                      className="ml-2 flex items-center cursor-pointer flex-1"
                    >
                      <span className="text-lg mr-1">{subject.icon}</span>
                      <span className="text-xs font-medium text-gray-900">{subject.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Management Subjects Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-green-600" />
                Management Subjects
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border border-gray-200 rounded-lg p-3 bg-white">
                {ALL_SUBJECTS.filter(s => s.department === 'School of Management').map(subject => (
                  <div 
                    key={subject.id} 
                    className="flex items-center p-2 bg-gray-50 hover:bg-green-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-green-300"
                  >
                    <input
                      type="checkbox"
                      id={`subject-${subject.id}`}
                      checked={formData.subjects.includes(subject.id)}
                      onChange={(e) => handleSubjectChange(subject.id, e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label 
                      htmlFor={`subject-${subject.id}`} 
                      className="ml-2 flex items-center cursor-pointer flex-1"
                    >
                      <span className="text-lg mr-1">{subject.icon}</span>
                      <span className="text-xs font-medium text-gray-900">{subject.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {errors.subjects && (
              <p className="mt-3 text-sm text-red-600 font-medium">{errors.subjects}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              required
              placeholder="Enter your 10-digit phone number"
            />
          </div>

          {/* Selected Summary */}
          {(formData.department || formData.subjects.length > 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                <Check className="w-5 h-5 mr-2" />
                Profile Summary
              </h4>
              <div className="space-y-2 text-sm">
                {formData.employeeId && (
                  <p className="text-blue-800">
                    <strong>Employee ID:</strong> {formData.employeeId.toUpperCase()}
                  </p>
                )}
                {formData.department && (
                  <p className="text-blue-800">
                    <strong>Department:</strong> {formData.department}
                  </p>
                )}
                {formData.specialization && (
                  <p className="text-blue-800">
                    <strong>Specialization:</strong> {formData.specialization}
                  </p>
                )}
                {formData.subjects.length > 0 && (
                  <div className="text-blue-800">
                    <strong>Teaching Subjects ({formData.subjects.length}):</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.subjects.map(subjectId => {
                        const subject = getSubjectById(subjectId);
                        return subject ? (
                          <span key={subjectId} className="inline-flex items-center px-2 py-1 bg-white border border-blue-300 rounded-full text-xs">
                            <span className="mr-1">{subject.icon}</span>
                            {subject.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Submit and Cancel Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={handleBackToLogin}
              disabled={loading}
              variant="secondary"
              size="lg"
              className="flex-1"
              icon={<ArrowLeft className="w-5 h-5" />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              variant="success"
              size="lg"
              className="flex-1"
              icon={<Check className="w-5 h-5" />}
            >
              Complete Profile
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500">
            Profile completion is mandatory to access dashboard features
          </p>
        </form>
      </div>
    </div>
  );
};

export default FacultyProfileForm;