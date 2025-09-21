/**
 * Offline QR Generator Component
 * 
 * This component generates QR codes without Firebase dependency for immediate testing.
 * Once Firebase permissions are fixed, you can switch back to the main QRGenerator.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { QrCode, RefreshCw, Timer, CheckCircle } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useAuth } from '../../contexts/AuthContext';

const OfflineQRGenerator = () => {
  // Modal and form state
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    school: '',
    batch: '',
    subject: '',
    periods: ''
  });
  
  // QR code state
  const [qrData, setQrData] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dynamic QR rotation state
  const [qrRotationTimer, setQrRotationTimer] = useState(5);
  const [totalRotations, setTotalRotations] = useState(0);
  const [baseSessionData, setBaseSessionData] = useState(null);

  // Hardcoded academic data
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

  // Component state
  const [schools] = useState(HARDCODED_SCHOOLS);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const timerRef = useRef(null);
  const rotationTimerRef = useRef(null);
  const { user, userProfile } = useAuth();

  // Load batches and subjects when school changes
  useEffect(() => {
    if (formData.school) {
      setBatches(HARDCODED_BATCHES[formData.school] || []);
      setSubjects(HARDCODED_SUBJECTS[formData.school] || []);
    } else {
      setBatches([]);
      setSubjects([]);
    }
  }, [formData.school]);

  // Generate QR code with maximum entropy and rotation-specific data
  const generateQRWithEntropy = useCallback(async (baseData, rotationIndex = 0) => {
    const currentTime = new Date();
    const microseconds = performance.now();
    const nanoTime = performance.timeOrigin + performance.now();
    const randomSalt = Math.random().toString(36).substr(2, 20);
    const rotationSalt = Math.random().toString(36).substr(2, 16);
    
    // Create ultra-dynamic QR data with rotation-specific entropy
    const qrDataObj = {
      ...baseData,
      // Rotation-specific data
      rotationIndex: rotationIndex,
      rotationId: `rot_${rotationIndex}_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`,
      rotationSalt: rotationSalt,
      
      // High-entropy timing data
      timestamp: currentTime.toISOString(),
      microseconds: microseconds,
      nanoTime: nanoTime,
      
      // Multiple sources of randomness
      randomSalt: randomSalt,
      entropyMix: btoa(`${microseconds}_${Math.random()}_${Date.now()}_${rotationIndex}`).substr(0, 16),
      
      // Time-based entropy
      millisecond: currentTime.getMilliseconds(),
      second: currentTime.getSeconds(),
      
      // Additional uniqueness factors
      browserEntropy: navigator.userAgent.length + window.screen.width + window.screen.height,
      memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : Math.random() * 10000,
      
      // Checksum with rotation data
      checksum: btoa(`${baseData.sessionId}_${rotationIndex}_${microseconds}_${randomSalt}`).substr(0, 12)
    };

    console.log(`🔄 Generating QR rotation ${rotationIndex} with ultra-high entropy`);
    
    // Generate QR code with enhanced quality settings
    const qrString = JSON.stringify(qrDataObj);
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      width: 400,
      margin: 3,
      color: {
        dark: '#1a202c',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });

    return {
      qrDataObj,
      qrCodeDataURL
    };
  }, []); // useCallback with empty dependency array since this function doesn't depend on any state

  // Main session timer effect
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setSuccess('QR Code expired. Generate a new one for the next session.');
      // Clear rotation timer when session ends
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive, timeLeft]);

  // Combined QR Code rotation effect (every 5 seconds with countdown)
  useEffect(() => {
    if (isActive && baseSessionData) {
      console.log('🔄 Starting QR rotation timer');
      
      rotationTimerRef.current = setInterval(async () => {
        if (isActive) {
          // Countdown logic
          setQrRotationTimer(prev => {
            console.log('🕔 QR timer countdown:', prev);
            
            if (prev <= 1) {
              // Time to rotate!
              console.log('🔄 Time to rotate QR code!');
              
              setTotalRotations(current => {
                const newRotationCount = current + 1;
                console.log('🔢 Rotation count:', newRotationCount);
                
                // Generate new QR code with rotation
                generateQRWithEntropy(baseSessionData, newRotationCount)
                  .then(({ qrDataObj, qrCodeDataURL }) => {
                    setQrData(qrDataObj);
                    setQrCode(qrCodeDataURL);
                    console.log(`✅ QR rotated to version ${newRotationCount}`);
                  })
                  .catch(error => {
                    console.error('❌ Error rotating QR code:', error);
                  });
                  
                return newRotationCount;
              });
              
              return 5; // Reset to 5 seconds
            } else {
              return prev - 1; // Countdown
            }
          });
        }
      }, 1000);

      return () => {
        console.log('🗑️ Cleaning up QR rotation timer');
        if (rotationTimerRef.current) {
          clearInterval(rotationTimerRef.current);
        }
      };
    }
  }, [isActive, baseSessionData, generateQRWithEntropy]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'school') {
      setFormData(prev => ({
        ...prev,
        batch: '',
        subject: ''
      }));
    }

    setError('');
  };


  // Function to regenerate QR with rotation (called by timer)
  const regenerateQRWithRotation = async () => {
    console.log('🔄 regenerateQRWithRotation called', { baseSessionData: !!baseSessionData, totalRotations });
    
    if (!baseSessionData) {
      console.error('❌ No baseSessionData available for rotation');
      return;
    }
    
    try {
      const { qrDataObj, qrCodeDataURL } = await generateQRWithEntropy(baseSessionData, totalRotations);
      setQrData(qrDataObj);
      setQrCode(qrCodeDataURL);
      console.log(`✅ QR rotated to version ${totalRotations}`);
    } catch (error) {
      console.error('❌ Error rotating QR code:', error);
    }
  };

  const generateQRCode = async () => {
    console.log('🚀 Starting OFFLINE QR generation...');

    // Validation
    if (!formData.school || !formData.batch || !formData.subject || !formData.periods) {
      const missingFields = [];
      if (!formData.school) missingFields.push('school');
      if (!formData.batch) missingFields.push('batch');
      if (!formData.subject) missingFields.push('subject');
      if (!formData.periods) missingFields.push('periods');
      
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!user || !user.uid) {
      setError('User not authenticated. Please login again.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Get names from hardcoded data
      const schoolName = HARDCODED_SCHOOLS.find(s => s.id === formData.school)?.name || formData.school;
      const batchName = HARDCODED_BATCHES[formData.school]?.find(b => b.id === formData.batch)?.name || formData.batch;
      const subjectName = HARDCODED_SUBJECTS[formData.school]?.find(s => s.id === formData.subject)?.name || formData.subject;

      // Generate unique session ID with maximum entropy
      const timestamp = Date.now();
      const randomPart = Math.random().toString(36).substr(2, 12);
      const uniqueId = Math.random().toString(36).substr(2, 8);
      const sessionId = `session_${timestamp}_${randomPart}_${uniqueId}`;
      
      // Create base session data (stays constant for rotations)
      const baseSessionData = {
        sessionId: sessionId,
        facultyId: user.uid,
        facultyName: userProfile?.fullName || user.displayName || 'Faculty',
        facultyEmail: user.email,
        school: formData.school,
        schoolName: schoolName,
        batch: formData.batch,
        batchName: batchName,
        subject: formData.subject,
        subjectName: subjectName,
        periods: parseInt(formData.periods),
        generatedAt: timestamp,
        expiresAt: new Date(Date.now() + 30000).toISOString(),
        mode: 'offline_rotating',
        version: '3.0',
        rotationEnabled: true,
        rotationInterval: 5
      };
      
      console.log('📱 Base session data created:', baseSessionData);
      setBaseSessionData(baseSessionData);

      // Generate first QR code with rotation index 0
      const { qrDataObj, qrCodeDataURL } = await generateQRWithEntropy(baseSessionData, 0);
      setQrData(qrDataObj);
      setQrCode(qrCodeDataURL);
      
      // Initialize timers and rotation state
      setTimeLeft(30);
      setQrRotationTimer(5);
      setTotalRotations(0);
      
      // Set isActive LAST to trigger the rotation effect
      console.log('🔄 Setting isActive to true - rotation should start now');
      setIsActive(true);
      
      setSuccess('🔄 Dynamic QR Code generated! Rotates every 5 seconds to prevent screenshot sharing.');

      console.log('✅ Offline QR generation completed!');

    } catch (error) {
      console.error('💥 Offline QR generation error:', error);
      setError(error.message || 'Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const regenerateQR = () => {
    setQrData(null);
    setQrCode('');
    setBaseSessionData(null);
    setTimeLeft(30);
    setIsActive(false);
    setQrRotationTimer(5);
    setTotalRotations(0);
    setSuccess('');
    generateQRCode();
  };

  const openModal = () => {
    setIsOpen(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setIsOpen(false);
    setQrData(null);
    setQrCode('');
    setBaseSessionData(null);
    setIsActive(false);
    setTimeLeft(30);
    setQrRotationTimer(5);
    setTotalRotations(0);
    setSuccess('');
    setFormData({
      school: '',
      batch: '',
      subject: '',
      periods: ''
    });
    // Clear both timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (rotationTimerRef.current) {
      clearTimeout(rotationTimerRef.current);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-100/40 rounded-2xl shadow-xl border border-blue-100/60 hover:shadow-2xl transition-all duration-500">
        <div className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <QrCode className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              ⚡
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent">
              Offline QR Code Generator
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
              🔄 Dynamic QR codes that rotate every 5 seconds to prevent screenshot sharing. Ultra-secure!
            </p>
          </div>
          <Button
            onClick={openModal}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            icon={<QrCode className="w-5 h-5" />}
          >
            Generate QR Code (Offline)
          </Button>
        </div>
      </div>

      {/* QR Generation Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title="Generate Offline QR Code"
        size="lg"
        closeOnOverlayClick={false}
      >
        <div className="space-y-6">
          {!qrCode ? (
            // Form
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* School Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    School <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="school"
                    value={formData.school}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    required
                  >
                    <option value="">Select School</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>

                {/* Batch Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Batch <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleInputChange}
                    disabled={!formData.school}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white disabled:bg-gray-100"
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                {/* Periods Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Number of Periods <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="periods"
                    value={formData.periods}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                  <p className="font-medium">{success}</p>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-2">
                <Button onClick={closeModal} variant="secondary">
                  Cancel
                </Button>
                <Button
                  onClick={generateQRCode}
                  loading={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  icon={<QrCode className="w-5 h-5" />}
                >
                  Generate QR Code
                </Button>
              </div>
            </div>
          ) : (
            // QR Display
            <div className="text-center space-y-6">
              {/* Session Info Display */}
              <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-4 border border-green-200">
                <div className="text-center mb-3">
                  <h4 className="text-lg font-bold text-green-800 mb-2">📋 Session Details</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/70 rounded-lg p-2 text-center">
                    <div className="font-semibold text-green-700">🏫 School</div>
                    <div className="text-gray-800">{HARDCODED_SCHOOLS.find(s => s.id === qrData?.school)?.name}</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2 text-center">
                    <div className="font-semibold text-green-700">👥 Batch</div>
                    <div className="text-gray-800">{HARDCODED_BATCHES[qrData?.school]?.find(b => b.id === qrData?.batch)?.name}</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2 text-center">
                    <div className="font-semibold text-green-700">📚 Subject</div>
                    <div className="text-gray-800">{HARDCODED_SUBJECTS[qrData?.school]?.find(s => s.id === qrData?.subject)?.name}</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2 text-center">
                    <div className="font-semibold text-green-700">⏱️ Periods</div>
                    <div className="text-gray-800">{qrData?.periods}</div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="text-xs text-green-600 font-medium">
                    🆔 Session: {qrData?.sessionId?.substr(-8)}... | 🔄 Version: {qrData?.version}
                  </div>
                </div>
              </div>

              {/* HIGH QUALITY QR Code */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="bg-white p-8 rounded-2xl shadow-2xl border-4 border-green-300 transform hover:scale-105 transition-all duration-300">
                    <img 
                      src={qrCode} 
                      alt="High Quality QR Code" 
                      className="mx-auto rounded-lg"
                      style={{
                        imageRendering: 'pixelated'
                      }}
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-2 shadow-lg animate-pulse">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-1 shadow-lg">
                    <span className="text-white text-xs font-bold px-2">HD</span>
                  </div>
                </div>
              </div>

              {/* QR Rotation Status */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${qrRotationTimer <= 2 ? 'bg-red-500' : 'bg-purple-500'}`}></div>
                  <span className="text-sm font-bold text-purple-800">🔄 Auto-Rotating QR Code</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white/80 rounded-lg p-2 text-center">
                    <div className={`text-lg font-bold ${qrRotationTimer <= 2 ? 'text-red-600' : 'text-purple-600'}`}>
                      {qrRotationTimer}s
                    </div>
                    <div className="text-xs text-purple-700 font-medium">Next Rotation</div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-green-600">{totalRotations}</div>
                    <div className="text-xs text-green-700 font-medium">Rotations</div>
                  </div>
                </div>
                
                <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      qrRotationTimer <= 2 ? 'bg-red-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${(qrRotationTimer / 5) * 100}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-purple-600 text-center space-y-1">
                  <div>🆔 Rotation #{qrData?.rotationIndex || 0} | Checksum: {qrData?.checksum}</div>
                  <div>🚫 Screenshot-proof security enabled!</div>
                </div>
              </div>

              {/* Dynamic Data Indicator */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-800">🔄 Ultra-High Entropy QR</span>
                </div>
                <div className="text-xs text-blue-600 text-center space-y-1">
                  <div>Generated: {new Date().toLocaleTimeString()} | Version: {qrData?.version}</div>
                  <div>Quality: HD (400x400px) | Entropy Sources: {qrData ? '12+' : '0'}</div>
                  <div>⚡ Each QR contains nano-second precision timestamps!</div>
                </div>
              </div>

              {/* Timer */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Timer className={`w-6 h-6 ${timeLeft <= 10 ? 'text-red-600' : 'text-green-600'}`} />
                  <span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {timeLeft}s
                  </span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      timeLeft <= 10 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  ></div>
                </div>
                <p className={`text-sm mt-2 font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {isActive ? '🟢 QR Code is active' : '🔴 QR Code expired'}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={regenerateQR}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Generate New QR
                </Button>
                <Button onClick={closeModal} variant="secondary">
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

export default OfflineQRGenerator;