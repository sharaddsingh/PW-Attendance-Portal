/**
 * QR Code Generator Component for Faculty
 * 
 * This component allows faculty members to generate QR codes for attendance sessions.
 * Students can scan these QR codes to mark their attendance with photo verification.
 * 
 * Key Features:
 * - Hardcoded academic data (schools, batches, subjects)
 * - QR code generation with 30-second expiration
 * - Active session management with countdown timers
 * - Firebase integration for session storage
 * - Professional UI with gradient designs and animations
 * - Real-time session tracking and management
 * 
 * QR Code Data Structure:
 * - sessionId: Unique identifier for the attendance session
 * - facultyId: ID of the faculty member creating the session
 * - school, batch, subject: Academic context
 * - periods: Number of periods for the session
 * - timestamp: When the QR was generated
 * - expiresAt: When the QR code expires (30 seconds)
 * 
 * @author PW Attendance Portal Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode'; // Library for generating QR codes
import { QrCode, Clock, RefreshCw, Save, School, Users, BookOpen, Hash, GraduationCap, Building2, UserCheck, Timer, Sparkles } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { createAttendanceSession, saveQRCodeToStorage, getActiveSessions, deactivateSession } from '../../services/firebase';
import { testFirebaseConnection, checkAuthStatus } from '../../utils/firebaseTest';

/**
 * QRGenerator Component
 * 
 * Main component for generating and managing attendance QR codes.
 * 
 * @returns {JSX.Element} QR Generator interface with modal and session management
 */
const QRGenerator = () => {
  // Modal and form state
  const [isOpen, setIsOpen] = useState(false);              // Modal visibility state
  const [formData, setFormData] = useState({               // Form data for QR generation
    school: '',
    batch: '',
    subject: '',
    periods: ''
  });
  
  // QR code state
  const [qrData, setQrData] = useState(null);              // Generated QR data object
  const [qrCode, setQrCode] = useState('');                // Base64 QR code image
  const [loading, setLoading] = useState(false);           // Loading state for QR generation
  const [timeLeft, setTimeLeft] = useState(30);            // Countdown timer (30 seconds)
  const [isActive, setIsActive] = useState(false);         // QR code active state
  const [error, setError] = useState('');                  // Error message state
  
  /**
   * Hardcoded Academic Data
   * 
   * Static data for schools, batches, and subjects.
   * This replaces dynamic Firebase data loading for consistent performance.
   */
  const HARDCODED_SCHOOLS = [
    { id: 'sot', name: 'School of Technology', shortName: 'SOT' },
    { id: 'som', name: 'School of Management', shortName: 'SOM' }
  ];
  
  const HARDCODED_BATCHES = {
    'sot': [
      { id: 'sot24b1', name: 'SOT24B1' },
      { id: 'sot24b2', name: 'SOT24B2' },
      { id: 'sot23b1', name: 'SOT23B1' }
    ],
    'som': [
      { id: 'som24b1', name: 'SOM24B1' },
      { id: 'som23b1', name: 'SOM23B1' }
    ]
  };
  
  const HARDCODED_SUBJECTS = {
    'sot': [
      { id: 'java', name: 'Java', code: 'JAVA' },
      { id: 'python', name: 'Python', code: 'PYTHON' },
      { id: 'dbms', name: 'DBMS', code: 'DBMS' },
      { id: 'sql', name: 'SQL', code: 'SQL' }
    ],
    'som': [
      { id: 'java', name: 'Java', code: 'JAVA' },
      { id: 'python', name: 'Python', code: 'PYTHON' },
      { id: 'dbms', name: 'DBMS', code: 'DBMS' },
      { id: 'sql', name: 'SQL', code: 'SQL' }
    ]
  };
  
  // Academic data state
  const [schools] = useState(HARDCODED_SCHOOLS);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  
  // Session management
  const [activeSessions, setActiveSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const { user, userProfile } = useAuth();

  // Load active sessions on mount
  useEffect(() => {
    loadActiveSessions();
  }, []);
  
  // Load active sessions
  const loadActiveSessions = async () => {
    try {
      if (user?.uid) {
        const sessionsResult = await getActiveSessions(user.uid);
        if (sessionsResult.success) {
          setActiveSessions(sessionsResult.data);
        }
      }
    } catch (error) {
      console.error('Failed to load active sessions:', error);
    }
  };
  // Load batches and subjects when school changes
  useEffect(() => {
    if (formData.school) {
      setBatches(HARDCODED_BATCHES[formData.school] || []);
      setSubjects(HARDCODED_SUBJECTS[formData.school] || []);
      // Simulate student count based on batch
      setStudentsCount(Math.floor(Math.random() * 50) + 20); // 20-70 students
    } else {
      setBatches([]);
      setSubjects([]);
      setStudentsCount(0);
    }
  }, [formData.school]);

  // Timer effect
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setQrData(null);
      setQrCode('');
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset batch and subject when school changes
    if (name === 'school') {
      setFormData(prev => ({
        ...prev,
        batch: '',
        subject: ''
      }));
    }

    setError('');
  };

  
  const generateQRCode = async () => {
    console.log('🚀 Starting QR generation...');
    console.log('📝 Form data:', formData);
    console.log('👤 User:', user);
    console.log('📋 User Profile:', userProfile);

    // Validation
    if (!formData.school || !formData.batch || !formData.subject || !formData.periods) {
      const missingFields = [];
      if (!formData.school) missingFields.push('school');
      if (!formData.batch) missingFields.push('batch');
      if (!formData.subject) missingFields.push('subject');
      if (!formData.periods) missingFields.push('periods');
      
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      console.error('❌ Missing required fields:', missingFields);
      return;
    }

    // Check if user is authenticated
    if (!user || !user.uid) {
      setError('User not authenticated. Please login again.');
      console.error('❌ User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('🔄 Loading started...');

      // Get school, batch, and subject names from hardcoded data
      const schoolName = HARDCODED_SCHOOLS.find(s => s.id === formData.school)?.name || formData.school;
      const batchName = HARDCODED_BATCHES[formData.school]?.find(b => b.id === formData.batch)?.name || formData.batch;
      const subjectName = HARDCODED_SUBJECTS[formData.school]?.find(s => s.id === formData.subject)?.name || formData.subject;
      
      console.log('🏫 School Name:', schoolName);
      console.log('👥 Batch Name:', batchName);
      console.log('📚 Subject Name:', subjectName);

      // Create attendance session with detailed information
      const sessionData = {
        facultyId: user.uid,
        facultyName: userProfile?.fullName || user.displayName || 'Unknown Faculty',
        facultyEmail: user.email,
        schoolId: formData.school,
        schoolName: schoolName,
        batchId: formData.batch,
        batchName: batchName,
        subjectId: formData.subject,
        subjectName: subjectName,
        periods: parseInt(formData.periods),
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 30000), // 30 seconds
        studentsCount: studentsCount,
        academicYear: new Date().getFullYear(),
        semester: Math.ceil((new Date().getMonth() + 1) / 6) // 1 or 2
      };
      
      console.log('💾 Session data to save:', sessionData);

      console.log('🔥 Creating attendance session in Firebase...');
      const sessionResult = await createAttendanceSession(sessionData);
      console.log('✅ Firebase session result:', sessionResult);
      
      if (!sessionResult.success) {
        throw new Error(sessionResult.error || 'Failed to create attendance session');
      }

      console.log('🆔 Session created with ID:', sessionResult.sessionId);

      // Generate QR data with comprehensive information
      const qrDataObj = {
        sessionId: sessionResult.sessionId,
        facultyId: user.uid,
        school: formData.school,
        batch: formData.batch,
        subject: formData.subject,
        periods: parseInt(formData.periods),
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30000).toISOString()
      };
      
      console.log('📱 QR data object:', qrDataObj);

      setQrData(qrDataObj);
      setCurrentSessionId(sessionResult.sessionId);

      // Generate QR code with better styling
      console.log('🎨 Generating QR code image...');
      const qrString = JSON.stringify(qrDataObj);
      console.log('📄 QR string length:', qrString.length);
      
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e40af', // Blue color for QR code
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      
      console.log('✅ QR code generated successfully');
      setQrCode(qrCodeDataURL);
      
      // Save QR code to Firebase Storage
      console.log('☁️ Saving QR code to Firebase Storage...');
      const storageResult = await saveQRCodeToStorage(qrCodeDataURL, sessionResult.sessionId);
      console.log('💾 Storage result:', storageResult);
      
      if (storageResult.success) {
        console.log('✅ QR Code saved to storage:', storageResult.url);
      } else {
        console.warn('⚠️ Failed to save QR code to storage, but continuing...');
      }

      setTimeLeft(30);
      setIsActive(true);
      console.log('⏰ Timer started: 30 seconds');
      
      // Reload active sessions
      console.log('🔄 Reloading active sessions...');
      loadActiveSessions();
      
      console.log('🎉 QR generation completed successfully!');

    } catch (error) {
      console.error('💥 QR generation error:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      setError(error.message || 'Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
      console.log('🔄 Loading finished');
    }
  };

  const regenerateQR = () => {
    setQrData(null);
    setQrCode('');
    setTimeLeft(30);
    setIsActive(false);
    generateQRCode();
  };

  const openModal = () => {
    setIsOpen(true);
    setError('');
  };

  const closeModal = async () => {
    // Deactivate current session if it exists
    if (currentSessionId && isActive) {
      await deactivateSession(currentSessionId);
    }
    
    setIsOpen(false);
    setQrData(null);
    setQrCode('');
    setIsActive(false);
    setTimeLeft(30);
    setCurrentSessionId(null);
    setFormData({
      school: '',
      batch: '',
      subject: '',
      periods: ''
    });
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Reload active sessions
    loadActiveSessions();
  };


  return (
    <>
      {/* Active Sessions Display */}
      {activeSessions.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-emerald-800">
              Active QR Sessions ({activeSessions.length})
            </h3>
          </div>
          <div className="space-y-3">
            {activeSessions.map(session => {
              const timeLeft = Math.max(0, Math.floor((new Date(session.expiresAt.toDate()) - new Date()) / 1000));
              return (
                <div key={session.id} className="bg-white rounded-xl p-4 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      timeLeft > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-semibold text-gray-800">
                        {session.subjectName} - {session.batchName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {session.periods} period(s) • {timeLeft > 0 ? `${timeLeft}s left` : 'Expired'}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => deactivateSession(session.id).then(() => loadActiveSessions())}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    Deactivate
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-100/40 rounded-2xl shadow-xl border border-blue-100/60 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
        <div className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg transform hover:scale-110 transition-all duration-300">
              <QrCode className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center animate-bounce shadow-md">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
              Generate Attendance QR Code
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
              Create a secure QR code for students to scan and mark their attendance instantly
            </p>
          </div>
          <Button
            onClick={openModal}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            icon={<QrCode className="w-5 h-5" />}
          >
            Generate QR Code
          </Button>
          
          {/* Debug: Firebase Test Button */}
          <Button
            onClick={() => {
              testFirebaseConnection();
              checkAuthStatus();
            }}
            className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
          >
            🔧 Debug Firebase Connection
          </Button>
        </div>
      </div>

      {/* QR Generation Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent font-bold">
              Generate Attendance QR Code
            </span>
          </div>
        }
        size="lg"
        closeOnOverlayClick={false}
      >
        <div className="space-y-6">
          {!qrCode ? (
            // QR Form
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* School Selection */}
                <div className="h-full">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      School <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <School className="absolute left-4 top-4 w-5 h-5 text-blue-600" />
                    <select
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gradient-to-r from-white to-blue-50/30 font-medium text-gray-800 transition-all duration-200"
                      required
                    >
                      <option value="">Select School</option>
                      {schools.map(school => (
                        <option key={school.id} value={school.id}>{school.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Batch Selection */}
                <div className="h-full">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      Batch <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-4 w-5 h-5 text-indigo-600" />
                    <select
                      name="batch"
                      value={formData.batch}
                      onChange={handleInputChange}
                      disabled={!formData.school}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gradient-to-r from-white to-indigo-50/30 font-medium text-gray-800 disabled:bg-gradient-to-r disabled:from-gray-100 disabled:to-gray-200 disabled:text-gray-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select Batch</option>
                      {batches.map(batch => (
                        <option key={batch.id} value={batch.id}>{batch.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject Selection */}
                <div className="h-full">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      Subject <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-4 w-5 h-5 text-purple-600" />
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gradient-to-r from-white to-purple-50/30 font-medium text-gray-800 transition-all duration-200"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Periods Selection */}
                <div className="h-full">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-emerald-600" />
                      Number of Periods <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-4 w-5 h-5 text-emerald-600" />
                    <select
                      name="periods"
                      value={formData.periods}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gradient-to-r from-white to-emerald-50/30 font-medium text-gray-800 transition-all duration-200"
                      required
                    >
                      <option value="">Select Periods</option>
                      <option value="1">1 Period</option>
                      <option value="2">2 Periods</option>
                      <option value="3">3 Periods</option>
                      <option value="4">4 Periods</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 text-red-700 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-4 h-4 text-white" />
                    </div>
                    <div className="font-medium">{error}</div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-2">
                <Button 
                  onClick={closeModal} 
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateQRCode}
                  loading={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  icon={<QrCode className="w-5 h-5" />}
                >
                  Generate QR Code
                </Button>
              </div>
            </div>
          ) : (
            // QR Code Display
            <div className="text-center space-y-8">
              {/* Session Info */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 border-2 border-blue-200/60 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Attendance Session Details
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/70 rounded-xl p-4 border border-blue-100 h-20 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-blue-700 font-semibold">
                      <Building2 className="w-4 h-4" />
                      <span>School:</span>
                    </div>
                    <div className="text-gray-800 font-medium mt-1">
                      {HARDCODED_SCHOOLS.find(s => s.id === qrData.school)?.name || qrData.school}
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 border border-indigo-100 h-20 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                      <GraduationCap className="w-4 h-4" />
                      <span>Batch:</span>
                    </div>
                    <div className="text-gray-800 font-medium mt-1">
                      {HARDCODED_BATCHES[qrData.school]?.find(b => b.id === qrData.batch)?.name || qrData.batch}
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 border border-purple-100 h-20 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-purple-700 font-semibold">
                      <BookOpen className="w-4 h-4" />
                      <span>Subject:</span>
                    </div>
                    <div className="text-gray-800 font-medium mt-1">
                      {HARDCODED_SUBJECTS[qrData.school]?.find(s => s.id === qrData.subject)?.name || qrData.subject}
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-xl p-4 border border-emerald-100 h-20 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <Hash className="w-4 h-4" />
                      <span>Periods:</span>
                    </div>
                    <div className="text-gray-800 font-medium mt-1">
                      {qrData.periods}
                    </div>
                  </div>
                </div>
                {studentsCount > 0 && (
                  <div className="mt-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-3">
                    <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold">
                      <Users className="w-4 h-4" />
                      <span>Students in batch: {studentsCount}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl border-2 border-gray-200 transform hover:scale-105 transition-all duration-300">
                    <img src={qrCode} alt="QR Code" className="mx-auto rounded-xl" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-6 space-y-4 border border-gray-200">
                <div className="flex items-center justify-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                    timeLeft <= 10 
                      ? 'bg-gradient-to-br from-red-500 to-red-600' 
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  }`}>
                    <Timer className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-1">Expires in</div>
                    <div className={`text-2xl font-bold transition-all duration-500 ${
                      timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {timeLeft}s
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3 shadow-inner">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 shadow-sm ${
                      timeLeft <= 10 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`}
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  ></div>
                </div>
                <div className={`text-center p-3 rounded-xl border-2 transition-all duration-500 ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700' 
                    : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-700'
                }`}>
                  <p className="text-sm font-medium">
                    {isActive 
                      ? "🟢 QR Code is active. Students can scan to mark attendance." 
                      : "🔴 QR Code has expired. Generate a new one."}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4 pt-2">
                {isActive ? (
                  <Button
                    onClick={regenerateQR}
                    className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold rounded-xl border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                    icon={<RefreshCw className="w-5 h-5" />}
                  >
                    Generate New QR
                  </Button>
                ) : (
                  <Button
                    onClick={regenerateQR}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    icon={<RefreshCw className="w-5 h-5" />}
                  >
                    Generate New QR
                  </Button>
                )}
                <Button 
                  onClick={closeModal} 
                  className="px-6 py-3 bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-gray-600 font-medium rounded-xl border border-gray-300 transition-all duration-200"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default QRGenerator;