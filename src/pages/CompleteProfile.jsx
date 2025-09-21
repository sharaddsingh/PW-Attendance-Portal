import React, { useState, useEffect } from 'react';
import { User, GraduationCap, UserCheck, Camera, Upload, Save, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createProfileDocument, uploadFile, validateEmailRole, academicDataService } from '../services/firebase';

const CompleteProfile = () => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Common fields
    fullName: user?.displayName || '',
    email: user?.email || '',
    phoneNumber: '',
    role: '',
    profilePhoto: null,
    profilePhotoURL: user?.photoURL || '',
    
    // Student fields
    regNumber: '',
    school: '',
    batch: '',
    semester: '',
    course: '',
    
    // Faculty fields
    employeeId: '',
    department: '',
    designation: '',
    experience: '',
    specialization: '',
    teachingSubjects: []
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user?.photoURL || null);
  const [schools, setSchools] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Auto-detect role based on email
  useEffect(() => {
    if (user?.email) {
      const detectedRole = validateEmailRole(user.email, 'student') ? 'student' : 'faculty';
      setFormData(prev => ({ ...prev, role: detectedRole }));
    }
  }, [user]);

  // Load schools when component mounts
  useEffect(() => {
    loadSchools();
  }, []);

  // Load batches when school changes (for students)
  useEffect(() => {
    if (formData.school && formData.role === 'student') {
      loadBatchesAndSubjects(formData.school);
    } else if (formData.role === 'student') {
      setBatches([]);
      setSubjects([]);
    }
  }, [formData.school, formData.role]);

  // Load subjects when faculty department changes
  useEffect(() => {
    if (formData.department && formData.role === 'faculty') {
      loadSubjectsForFaculty(formData.department);
    } else if (formData.role === 'faculty') {
      setSubjects([]);
    }
  }, [formData.department, formData.role]);

  const loadSubjectsForFaculty = async (departmentId) => {
    setLoadingData(true);
    try {
      const subjectResult = await academicDataService.getSubjectsBySchool(departmentId);
      if (subjectResult.success) {
        setSubjects(subjectResult.data);
      }
    } catch (error) {
      console.error('Error loading subjects for faculty:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadSchools = async () => {
    setLoadingData(true);
    try {
      const result = await academicDataService.getSchools();
      if (result.success) {
        setSchools(result.data);
      } else {
        // Initialize data if not found
        await academicDataService.initializeAcademicData();
        const retryResult = await academicDataService.getSchools();
        if (retryResult.success) {
          setSchools(retryResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading schools:', error);
      setErrors(prev => ({ ...prev, school: 'Failed to load schools' }));
    } finally {
      setLoadingData(false);
    }
  };

  const loadBatchesAndSubjects = async (schoolId) => {
    setLoadingData(true);
    try {
      // Load batches
      const batchResult = await academicDataService.getBatchesBySchool(schoolId);
      if (batchResult.success) {
        setBatches(batchResult.data);
      }

      // Load subjects
      const subjectResult = await academicDataService.getSubjectsBySchool(schoolId);
      if (subjectResult.success) {
        setSubjects(subjectResult.data);
      }
    } catch (error) {
      console.error('Error loading batches/subjects:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Dynamic data is now loaded from Firebase via useEffect hooks above

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

  const handleSubjectToggle = (subjectId) => {
    setFormData(prev => ({
      ...prev,
      teachingSubjects: prev.teachingSubjects.includes(subjectId)
        ? prev.teachingSubjects.filter(s => s !== subjectId)
        : [...prev.teachingSubjects, subjectId]
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, photo: 'Photo must be less than 5MB' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, profilePhoto: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      setErrors(prev => ({ ...prev, photo: '' }));
    }
  };

  const validateStep1 = () => {
    const stepErrors = {};
    
    if (!formData.fullName.trim()) {
      stepErrors.fullName = 'Full name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      stepErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      stepErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep2 = () => {
    const stepErrors = {};
    
    if (formData.role === 'student') {
      if (!formData.regNumber.trim()) {
        stepErrors.regNumber = 'Registration number is required';
      }
      if (!formData.school) {
        stepErrors.school = 'School selection is required';
      }
      if (!formData.batch.trim()) {
        stepErrors.batch = 'Batch is required';
      }
      if (!formData.semester) {
        stepErrors.semester = 'Semester is required';
      }
      if (!formData.course.trim()) {
        stepErrors.course = 'Course is required';
      }
    } else if (formData.role === 'faculty') {
      if (!formData.employeeId.trim()) {
        stepErrors.employeeId = 'Employee ID is required';
      }
      if (!formData.department) {
        stepErrors.department = 'Department selection is required';
      }
      if (!formData.designation.trim()) {
        stepErrors.designation = 'Designation is required';
      }
      if (!formData.experience) {
        stepErrors.experience = 'Experience is required';
      }
      if (formData.teachingSubjects.length === 0) {
        stepErrors.teachingSubjects = 'Please select at least one teaching subject';
      }
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      let profilePhotoURL = formData.profilePhotoURL;
      
      // Upload photo if selected
      if (formData.profilePhoto) {
        const photoPath = `profile-photos/${user.uid}/${Date.now()}-${formData.profilePhoto.name}`;
        const uploadResult = await uploadFile(formData.profilePhoto, photoPath);
        
        if (uploadResult.success) {
          profilePhotoURL = uploadResult.url;
        } else {
          throw new Error('Failed to upload profile photo');
        }
      }
      
      // Prepare profile data
      const profileData = {
        uid: user.uid,
        fullName: formData.fullName.trim(),
        email: formData.email,
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role,
        profilePhotoURL,
        profileComplete: true,
        completedAt: new Date()
      };
      
      // Add role-specific fields
      if (formData.role === 'student') {
        profileData.regNumber = formData.regNumber.trim();
        profileData.schoolId = formData.school;
        profileData.batchId = formData.batch;
        profileData.semester = parseInt(formData.semester);
        profileData.course = formData.course.trim();
        
        // Get school and batch names for display
        const selectedSchool = schools.find(s => s.id === formData.school);
        const selectedBatch = batches.find(b => b.id === formData.batch);
        profileData.school = selectedSchool?.name || formData.school;
        profileData.batch = selectedBatch?.name || formData.batch;
      } else if (formData.role === 'faculty') {
        profileData.employeeId = formData.employeeId.trim();
        profileData.departmentId = formData.department;
        profileData.designation = formData.designation.trim();
        profileData.experience = parseInt(formData.experience);
        profileData.specialization = formData.specialization.trim();
        profileData.teachingSubjects = formData.teachingSubjects;
        
        // Get department name for display
        const selectedDept = schools.find(s => s.id === formData.department);
        profileData.department = selectedDept?.name || formData.department;
      }
      
      // Save to Firebase
      const result = await createProfileDocument(user.uid, profileData);
      
      if (result.success) {
        updateUserProfile(profileData);
      } else {
        throw new Error(result.error || 'Failed to save profile');
      }
      
    } catch (error) {
      console.error('Profile completion error:', error);
      setErrors({ submit: error.message || 'Failed to complete profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">
            {formData.role === 'student' 
              ? 'Help us set up your student account'
              : 'Help us set up your faculty account'
            }
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          <div className="card-body">
            {step === 1 && (
              <div className="space-y-6 fade-in">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                
                {/* Profile Photo */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mx-auto mb-4">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="text-gray-400 w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <label 
                      htmlFor="photo-upload"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                  {errors.photo && (
                    <p className="text-red-600 text-sm mt-2">{errors.photo}</p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`input-primary ${errors.fullName ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="input-primary bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your email address cannot be changed
                  </p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`input-primary ${errors.phoneNumber ? 'border-red-500' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Role Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {formData.role === 'student' ? (
                      <>
                        <GraduationCap className="text-blue-600 w-5 h-5" />
                        <span className="font-medium text-gray-900">Student Account</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="text-purple-600 w-5 h-5" />
                        <span className="font-medium text-gray-900">Faculty Account</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {formData.role === 'student' ? 'Academic Information' : 'Professional Information'}
                  </h2>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                </div>

                {formData.role === 'student' ? (
                  <>
                    {/* Student Fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        name="regNumber"
                        value={formData.regNumber}
                        onChange={handleInputChange}
                        className={`input-primary ${errors.regNumber ? 'border-red-500' : ''}`}
                        placeholder="Enter your registration number"
                      />
                      {errors.regNumber && (
                        <p className="text-red-600 text-sm mt-1">{errors.regNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School * {loadingData && <RefreshCw className="inline w-4 h-4 animate-spin ml-2" />}
                      </label>
                      <select
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        className={`input-primary ${errors.school ? 'border-red-500' : ''}`}
                        disabled={loadingData}
                      >
                        <option value="">Select your school</option>
                        {schools.map(school => (
                          <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                      </select>
                      {errors.school && (
                        <p className="text-red-600 text-sm mt-1">{errors.school}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Batch *
                        </label>
                        <select
                          name="batch"
                          value={formData.batch}
                          onChange={handleInputChange}
                          className={`input-primary ${errors.batch ? 'border-red-500' : ''}`}
                          disabled={!formData.school || loadingData}
                        >
                          <option value="">Select your batch</option>
                          {batches.map(batch => (
                            <option key={batch.id} value={batch.id}>{batch.name}</option>
                          ))}
                        </select>
                        {errors.batch && (
                          <p className="text-red-600 text-sm mt-1">{errors.batch}</p>
                        )}
                        {!formData.school && (
                          <p className="text-gray-500 text-sm mt-1">Please select a school first</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Semester *
                        </label>
                        <select
                          name="semester"
                          value={formData.semester}
                          onChange={handleInputChange}
                          className={`input-primary ${errors.semester ? 'border-red-500' : ''}`}
                        >
                          <option value="">Select semester</option>
                          {[1,2,3,4,5,6,7,8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                          ))}
                        </select>
                        {errors.semester && (
                          <p className="text-red-600 text-sm mt-1">{errors.semester}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course *
                      </label>
                      <input
                        type="text"
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        className={`input-primary ${errors.course ? 'border-red-500' : ''}`}
                        placeholder="e.g., B.Tech Computer Science"
                      />
                      {errors.course && (
                        <p className="text-red-600 text-sm mt-1">{errors.course}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Faculty Fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee ID *
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        className={`input-primary ${errors.employeeId ? 'border-red-500' : ''}`}
                        placeholder="Enter your employee ID"
                      />
                      {errors.employeeId && (
                        <p className="text-red-600 text-sm mt-1">{errors.employeeId}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department/School *
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className={`input-primary ${errors.department ? 'border-red-500' : ''}`}
                        disabled={loadingData}
                      >
                        <option value="">Select your department</option>
                        {schools.map(school => (
                          <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                      </select>
                      {errors.department && (
                        <p className="text-red-600 text-sm mt-1">{errors.department}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Designation *
                        </label>
                        <input
                          type="text"
                          name="designation"
                          value={formData.designation}
                          onChange={handleInputChange}
                          className={`input-primary ${errors.designation ? 'border-red-500' : ''}`}
                          placeholder="e.g., Assistant Professor"
                        />
                        {errors.designation && (
                          <p className="text-red-600 text-sm mt-1">{errors.designation}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Experience (Years) *
                        </label>
                        <select
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className={`input-primary ${errors.experience ? 'border-red-500' : ''}`}
                        >
                          <option value="">Select experience</option>
                          {[...Array(21)].map((_, i) => (
                            <option key={i} value={i}>{i} {i === 1 ? 'year' : 'years'}</option>
                          ))}
                          <option value="20+">20+ years</option>
                        </select>
                        {errors.experience && (
                          <p className="text-red-600 text-sm mt-1">{errors.experience}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization (Optional)
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="input-primary"
                        placeholder="e.g., Machine Learning, Data Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teaching Subjects * {errors.teachingSubjects && <span className="text-red-600">({errors.teachingSubjects})</span>}
                        {loadingData && <RefreshCw className="inline w-4 h-4 animate-spin ml-2" />}
                      </label>
                      <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 border border-gray-300 rounded-lg ${
                        loadingData ? 'opacity-50' : ''
                      }`}>
                        {subjects.length > 0 ? (
                          subjects.map(subject => (
                            <label key={subject.id} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.teachingSubjects.includes(subject.id)}
                                onChange={() => handleSubjectToggle(subject.id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                disabled={loadingData}
                              />
                              <span className="text-sm text-gray-700">{subject.name}</span>
                            </label>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-4">
                            <p className="text-gray-500 text-sm">
                              {formData.department ? 'Loading subjects...' : 'Please select a department first'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-700 text-sm">{errors.submit}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary py-3 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 loading-spinner"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>
                      {isLoading ? 'Completing Profile...' : 'Complete Profile'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation for Step 1 */}
            {step === 1 && (
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full btn-primary py-3"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
