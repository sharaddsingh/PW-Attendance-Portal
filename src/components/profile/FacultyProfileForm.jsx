import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Building2, BookOpen, Check } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { createProfileDocument } from '../../services/firebase';

const SUBJECTS_BY_DEPARTMENT = {
  'School of Technology': [
    'JAVA',
    'PYTHON', 
    'JAVASCRIPT',
    'Data Structures & Algorithms (DSA)',
    'Database Management System (DBMS)',
    'Web Development',
    'Mobile App Development',
    'Data Science',
    'Machine Learning',
    'Cybersecurity',
    'Cloud Computing',
    'Software Engineering'
  ],
  'School of Management': [
    'BUSINESS COMMUNICATION',
    'CRITICAL COMMUNICATION',
    'EXCEL',
    'Marketing Management',
    'Financial Management',
    'Human Resource Management',
    'Operations Management',
    'Strategic Management',
    'Business Analytics',
    'Digital Marketing',
    'Entrepreneurship',
    'Project Management'
  ]
};

const FacultyProfileForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    departments: [],
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

  const handleDepartmentChange = (departmentValue, isChecked) => {
    setFormData(prev => {
      let newDepartments;
      if (isChecked) {
        newDepartments = [...prev.departments, departmentValue];
      } else {
        newDepartments = prev.departments.filter(dept => dept !== departmentValue);
        // Remove subjects from unchecked department
        const subjectsToRemove = SUBJECTS_BY_DEPARTMENT[departmentValue] || [];
        const filteredSubjects = prev.subjects.filter(subject => 
          !subjectsToRemove.includes(subject)
        );
        return {
          ...prev,
          departments: newDepartments,
          subjects: filteredSubjects
        };
      }
      return {
        ...prev,
        departments: newDepartments
      };
    });
  };

  const handleSubjectChange = (subjectValue, isChecked) => {
    setFormData(prev => {
      let newSubjects;
      if (isChecked) {
        newSubjects = [...prev.subjects, subjectValue];
      } else {
        newSubjects = prev.subjects.filter(subject => subject !== subjectValue);
      }
      return {
        ...prev,
        subjects: newSubjects
      };
    });
  };

  const getAvailableSubjects = () => {
    return formData.departments.reduce((acc, dept) => {
      const deptSubjects = SUBJECTS_BY_DEPARTMENT[dept] || [];
      return [...acc, ...deptSubjects];
    }, []);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (formData.departments.length === 0) {
      newErrors.departments = 'Please select at least one department';
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
        employeeId: formData.employeeId.trim(),
        departments: formData.departments,
        subjects: formData.subjects,
        phone: formData.phone.trim(),
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

  const availableSubjects = getAvailableSubjects();

  return (
    <div className="min-h-screen bg-hero-pattern bg-cover bg-center bg-fixed flex items-center justify-center py-8">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-3xl mx-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Faculty Profile
          </h2>
          <p className="text-gray-600">
            Please fill in your details to access the faculty dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Employee ID */}
            <Input
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              error={errors.employeeId}
              required
              placeholder="Enter your employee ID"
            />
          </div>

          {/* Departments Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Department(s) <span className="text-red-500">*</span>
              <span className="text-gray-500 text-xs ml-2">(Select multiple)</span>
            </label>
            <div className="space-y-3">
              {Object.keys(SUBJECTS_BY_DEPARTMENT).map(department => (
                <div 
                  key={department} 
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`dept-${department}`}
                    checked={formData.departments.includes(department)}
                    onChange={(e) => handleDepartmentChange(department, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`dept-${department}`} className="ml-3 flex items-center cursor-pointer flex-1">
                    <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">{department}</span>
                  </label>
                </div>
              ))}
            </div>
            {errors.departments && (
              <p className="mt-1 text-sm text-red-600">{errors.departments}</p>
            )}
          </div>

          {/* Subjects Selection */}
          {availableSubjects.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Subjects You Teach <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-2">(Select multiple)</span>
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                {availableSubjects.map(subject => (
                  <div 
                    key={subject} 
                    className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`subject-${subject}`}
                      checked={formData.subjects.includes(subject)}
                      onChange={(e) => handleSubjectChange(subject, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`subject-${subject}`} className="ml-3 flex items-center cursor-pointer flex-1">
                      <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 text-sm">{subject}</span>
                    </label>
                  </div>
                ))}
              </div>
              {errors.subjects && (
                <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>
              )}
            </div>
          )}

          {/* Phone Number */}
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

          {/* Selected Summary */}
          {(formData.departments.length > 0 || formData.subjects.length > 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Selection Summary</h4>
              {formData.departments.length > 0 && (
                <p className="text-sm text-blue-800 mb-1">
                  <strong>Departments:</strong> {formData.departments.join(', ')}
                </p>
              )}
              {formData.subjects.length > 0 && (
                <p className="text-sm text-blue-800">
                  <strong>Subjects:</strong> {formData.subjects.length} selected
                </p>
              )}
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            variant="success"
            size="lg"
            className="w-full"
            icon={<Check className="w-5 h-5" />}
          >
            Complete Profile
          </Button>

          <p className="text-center text-sm text-gray-500">
            Profile completion is mandatory to access dashboard features
          </p>
        </form>
      </div>
    </div>
  );
};

export default FacultyProfileForm;