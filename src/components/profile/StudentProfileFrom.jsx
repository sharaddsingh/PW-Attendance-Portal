import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, School, Users, Upload, Check, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { createProfileDocument, uploadFile, generateDeviceId } from '../../services/firebase';

const BATCH_OPTIONS = {
  'School of Technology': [
    'SOT24B1',
    'SOT24B2',
    'SOT23B1'
  ],
  'School of Management': [
    'SOM23B1',
    'SOM24B1'
  ]
};

const StudentProfileForm = () => {
  const [formData, setFormData] = useState({
    fullName: '', regNumber: '', school: '', batch: '', phone: '', profilePhoto: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSchoolChange = e => {
    const school = e.target.value;
    setFormData(prev => ({ ...prev, school, batch: '' }));
  };

  const handlePhotoUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profilePhoto: 'Select a valid image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, profilePhoto: 'Image must be less than 5MB' }));
      return;
    }

    setFormData(prev => ({ ...prev, profilePhoto: file }));

    const reader = new FileReader();
    reader.onload = e => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
    if (errors.profilePhoto) setErrors(prev => ({ ...prev, profilePhoto: '' }));
  };

  const handleBackToLogin = () => {
    // Sign out the user and redirect to login
    if (window.confirm('Are you sure you want to go back? You will be signed out.')) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.regNumber.trim()) newErrors.regNumber = 'Registration number is required';
    if (!formData.school) newErrors.school = 'Select a school';
    if (!formData.batch) newErrors.batch = 'Select a batch';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Enter valid 10-digit phone';
    if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setUploadProgress(10);

      // Upload photo
      const photoPath = `profiles/${user.uid}/profile-photo.jpg`;
      const photoResult = await uploadFile(formData.profilePhoto, photoPath);
      if (!photoResult.success) throw new Error('Failed to upload photo');
      setUploadProgress(60);

      // Create profile document
      const deviceId = generateDeviceId();
      const profileData = {
        ...formData,
        profilePhotoUrl: photoResult.url,
        deviceId,
        isProfileComplete: true
      };
      const profileResult = await createProfileDocument(user.uid, profileData);
      if (!profileResult.success) throw new Error('Failed to create profile');
      setUploadProgress(90);

      // Update auth context
      updateUserProfile({ ...profileData, role: 'student' });
      setUploadProgress(100);

      setTimeout(() => navigate('/student-dashboard'), 500);
    } catch (error) {
      console.error(error);
      setErrors({ submit: error.message || 'Failed to complete profile' });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const availableBatches = formData.school ? BATCH_OPTIONS[formData.school] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-4 px-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl relative">
        {/* Back Button */}
        <button
          onClick={handleBackToLogin}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Login</span>
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-105">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-sm sm:text-base text-gray-600">Fill your details to access the student dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Photo */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg transition-transform hover:scale-105">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <label htmlFor="photoUpload" className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                <Upload className="w-4 h-4" />
              </label>
            </div>
            <input type="file" id="photoUpload" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            {errors.profilePhoto && <p className="text-red-500 text-sm">{errors.profilePhoto}</p>}
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} error={errors.fullName} required placeholder="Enter your full name" />
            <Input label="Registration Number" name="regNumber" value={formData.regNumber} onChange={handleInputChange} error={errors.regNumber} required placeholder="Enter your registration number" />

            {/* School */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School <span className="text-red-500">*</span></label>
              <div className="relative">
                <School className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select name="school" value={formData.school} onChange={handleSchoolChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                  <option value="">Select School</option>
                  <option value="School of Technology">School of Technology</option>
                  <option value="School of Management">School of Management</option>
                </select>
              </div>
              {errors.school && <p className="mt-1 text-sm text-red-600">{errors.school}</p>}
            </div>

            {/* Batch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch <span className="text-red-500">*</span></label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select name="batch" value={formData.batch} onChange={handleInputChange} disabled={!formData.school} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" required>
                  <option value="">Select Batch</option>
                  {availableBatches.map(batch => (<option key={batch} value={batch}>{batch}</option>))}
                </select>
              </div>
              {errors.batch && <p className="mt-1 text-sm text-red-600">{errors.batch}</p>}
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <Input label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} error={errors.phone} required placeholder="Enter your 10-digit phone number" />
            </div>
          </div>

          {/* Progress Bar */}
          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Creating profile...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{errors.submit}</div>}

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
              variant="primary"
              size="lg"
              className="flex-1"
              icon={<Check className="w-5 h-5" />}
            >
              Complete Profile
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500">Profile completion is mandatory to access dashboard features</p>
        </form>
      </div>
    </div>
  );
};

export default StudentProfileForm;
