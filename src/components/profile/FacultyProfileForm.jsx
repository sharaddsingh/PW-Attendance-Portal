import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Building2, BookOpen, Check, Briefcase, Code, Database } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { createProfileDocument } from '../../services/firebase';

// Core subjects for Technology department
const TECH_SUBJECTS = [
  { id: 'java', name: 'JAVA', icon: '☕' },
  { id: 'python', name: 'PYTHON', icon: '🐍' },
  { id: 'javascript', name: 'JAVASCRIPT', icon: '🌐' },
  { id: 'sql', name: 'SQL', icon: '🗃️' },
  { id: 'dbms', name: 'DBMS (Database Management)', icon: '💾' },
  { id: 'dsa', name: 'DSA (Data Structures)', icon: '🌳' },
  { id: 'react', name: 'React.js', icon: '⚛️' },
  { id: 'nodejs', name: 'Node.js', icon: '🟢' },
  { id: 'cpp', name: 'C++', icon: '⚙️' },
  { id: 'c', name: 'C Programming', icon: '📝' },
  { id: 'html-css', name: 'HTML/CSS', icon: '🎨' },
  { id: 'machine-learning', name: 'Machine Learning', icon: '🤖' },
  { id: 'data-science', name: 'Data Science', icon: '📊' },
  { id: 'cloud-computing', name: 'Cloud Computing', icon: '☁️' },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔐' },
  { id: 'mobile-dev', name: 'Mobile Development', icon: '📱' },
  { id: 'devops', name: 'DevOps', icon: '🔄' },
  { id: 'blockchain', name: 'Blockchain', icon: '🔗' }
];

// Core subjects for Management department
const MANAGEMENT_SUBJECTS = [
  { id: 'business-comm', name: 'Business Communication', icon: '💼' },
  { id: 'critical-comm', name: 'Critical Communication', icon: '🗣️' },
  { id: 'excel', name: 'Advanced Excel', icon: '📈' },
  { id: 'marketing', name: 'Marketing Management', icon: '📢' },
  { id: 'finance', name: 'Financial Management', icon: '💰' },
  { id: 'hr', name: 'Human Resource Management', icon: '👥' },
  { id: 'operations', name: 'Operations Management', icon: '⚙️' },
  { id: 'strategic', name: 'Strategic Management', icon: '🎯' },
  { id: 'analytics', name: 'Business Analytics', icon: '📊' },
  { id: 'digital-marketing', name: 'Digital Marketing', icon: '🌐' },
  { id: 'entrepreneurship', name: 'Entrepreneurship', icon: '🚀' },
  { id: 'project-mgmt', name: 'Project Management', icon: '📋' }
];

const SUBJECTS_BY_DEPARTMENT = {
  'School of Technology': TECH_SUBJECTS,
  'School of Management': MANAGEMENT_SUBJECTS
};

// Designation options
const DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
  'Teaching Assistant',
  'Visiting Faculty',
  'Guest Lecturer'
];

// Experience options
const EXPERIENCE_OPTIONS = [
  '0-1 years',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10-15 years',
  '15+ years'
];

const FacultyProfileForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    departments: [],
    designation: '',
    experience: '',
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

  const getAvailableSubjects = () => {
    return formData.departments.reduce((acc, dept) => {
      const deptSubjects = SUBJECTS_BY_DEPARTMENT[dept] || [];
      return [...acc, ...deptSubjects];
    }, []);
  };

  const getSubjectById = (subjectId) => {
    const allSubjects = [...TECH_SUBJECTS, ...MANAGEMENT_SUBJECTS];
    return allSubjects.find(s => s.id === subjectId);
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

    if (!formData.designation) {
      newErrors.designation = 'Please select your designation';
    }

    if (!formData.experience) {
      newErrors.experience = 'Please select your experience';
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
        employeeId: formData.employeeId.trim().toUpperCase(),
        departments: formData.departments,
        designation: formData.designation,
        experience: formData.experience,
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
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-gray-600" />
              Personal Information
            </h3>
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
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-gray-600" />
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation <span className="text-red-500">*</span>
                </label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select your designation</option>
                  {DESIGNATIONS.map(designation => (
                    <option key={designation} value={designation}>
                      {designation}
                    </option>
                  ))}
                </select>
                {errors.designation && (
                  <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience <span className="text-red-500">*</span>
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select your experience</option>
                  {EXPERIENCE_OPTIONS.map(exp => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
                {errors.experience && (
                  <p className="mt-1 text-sm text-red-600">{errors.experience}</p>
                )}
              </div>

              {/* Specialization (Optional) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Machine Learning, Data Science, Cloud Computing, Digital Marketing"
                />
              </div>
            </div>
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

          {/* Teaching Subjects Selection */}
          {availableSubjects.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Code className="inline w-4 h-4 mr-1 text-gray-600" />
                Teaching Subjects <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-2">(Select at least one)</span>
              </label>
              <p className="text-xs text-gray-600 mb-4">
                Please select all the subjects you can teach:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white">
                {availableSubjects.map(subject => (
                  <div 
                    key={subject.id} 
                    className="flex items-center p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-blue-300"
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
                      className="ml-3 flex items-center cursor-pointer flex-1"
                    >
                      <span className="text-lg mr-2">{subject.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                    </label>
                  </div>
                ))}
              </div>
              {formData.departments.includes('School of Technology') && (
                <p className="text-xs text-gray-500 mt-2">
                  💡 Technology subjects include programming languages, databases, and software development
                </p>
              )}
              {formData.departments.includes('School of Management') && (
                <p className="text-xs text-gray-500 mt-2">
                  💡 Management subjects include business, communication, and analytical skills
                </p>
              )}
              {errors.subjects && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.subjects}</p>
              )}
            </div>
          )}

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
          {(formData.departments.length > 0 || formData.subjects.length > 0) && (
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
                {formData.designation && (
                  <p className="text-blue-800">
                    <strong>Designation:</strong> {formData.designation}
                  </p>
                )}
                {formData.departments.length > 0 && (
                  <p className="text-blue-800">
                    <strong>Departments:</strong> {formData.departments.join(', ')}
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