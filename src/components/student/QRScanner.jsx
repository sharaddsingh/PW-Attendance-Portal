/**
 * QR Scanner Component for Students
 * 
 * This component allows students to scan faculty-generated QR codes for attendance.
 * It includes a multi-step process: QR scanning, confirmation, photo capture, and submission.
 * 
 * Key Features:
 * - QR code scanning using device camera
 * - QR code validation and expiration check (30 seconds)
 * - Photo capture for attendance verification
 * - Real-time attendance submission to Firebase
 * - Multi-step modal workflow
 * - Error handling and user feedback
 * 
 * Attendance Flow:
 * 1. Student opens QR scanner
 * 2. Scans QR code from faculty
 * 3. Validates QR data and expiration
 * 4. Shows confirmation with session details
 * 5. Captures verification photo
 * 6. Submits attendance with photo to Firebase
 * 
 * @author PW Attendance Portal Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'; // QR code scanning library
import { QrCode, Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { markAttendance, uploadFile } from '../../services/firebase';

/**
 * QRScanner Component
 * 
 * Main component for student attendance QR code scanning and photo verification.
 * 
 * @returns {JSX.Element} QR Scanner interface with multi-step modal workflow
 */
const QRScanner = () => {
  // Modal and scanning states
  const [isOpen, setIsOpen] = useState(false);                    // Main modal visibility
  const [scanning, setScanning] = useState(false);               // QR scanning active state
  const [scannedData, setScannedData] = useState(null);          // Parsed QR code data
  const [showConfirmation, setShowConfirmation] = useState(false); // Confirmation step visibility
  const [showPhotoCapture, setShowPhotoCapture] = useState(false); // Photo capture step visibility
  const [error, setError] = useState('');                        // Error message state
  const [success, setSuccess] = useState('');                    // Success message state
  const [loading, setLoading] = useState(false);                 // Loading state for submission

  // Photo capture states
  const [photoStream, setPhotoStream] = useState(null);          // Camera media stream
  const [capturedPhoto, setCapturedPhoto] = useState(null);      // Captured photo blob
  const [photoPreview, setPhotoPreview] = useState(null);        // Photo preview data URL

  const scannerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { user, userProfile } = useAuth();

  const openScanner = () => {
    setIsOpen(true);
    setError('');
    setSuccess('');
  };

  const closeScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }
    if (photoStream) {
      photoStream.getTracks().forEach(track => track.stop());
      setPhotoStream(null);
    }
    setIsOpen(false);
    setScanning(false);
    setScannedData(null);
    setShowConfirmation(false);
    setShowPhotoCapture(false);
    setCapturedPhoto(null);
    setPhotoPreview(null);
    setError('');
    setSuccess('');
  };

  const startScanning = async () => {
    try {
      setScanning(true);
      setError('');

      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        }
      );

      scannerRef.current = scanner;

      scanner.render(onScanSuccess, onScanError);
    } catch (err) {
      console.error('Scanner start error:', err);
      setError('Failed to start camera. Please check permissions.');
      setScanning(false);
    }
  };

  const onScanSuccess = (decodedText) => {
    try {
      const qrData = JSON.parse(decodedText);
      
      // Validate QR code structure
      if (!qrData.sessionId || !qrData.facultyId || !qrData.timestamp) {
        throw new Error('Invalid QR code format');
      }

      // Check if QR code is expired (30 seconds)
      const now = new Date().getTime();
      const qrTime = new Date(qrData.timestamp).getTime();
      const timeDiff = (now - qrTime) / 1000;

      if (timeDiff > 30) {
        setError('QR code has expired. Please ask your faculty to generate a new one.');
        return;
      }

      setScannedData(qrData);
      setShowConfirmation(true);
      
      // Stop scanner
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      setScanning(false);

    } catch (err) {
      console.error('QR parsing error:', err);
      setError('Invalid QR code. Please scan the attendance QR code from your faculty.');
    }
  };

  const onScanError = (errorMessage) => {
    // Don't show every scan error, just log them
    console.log('Scan error:', errorMessage);
  };

  const confirmAttendance = () => {
    setShowConfirmation(false);
    setShowPhotoCapture(true);
    startPhotoCapture();
  };

  const startPhotoCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setPhotoStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Photo capture error:', err);
      setError('Failed to access camera for photo verification.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      setCapturedPhoto(blob);
      setPhotoPreview(canvas.toDataURL('image/jpeg', 0.8));
      
      // Stop video stream
      if (photoStream) {
        photoStream.getTracks().forEach(track => track.stop());
        setPhotoStream(null);
      }
    }, 'image/jpeg', 0.8);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setPhotoPreview(null);
    startPhotoCapture();
  };

  const submitAttendance = async () => {
    if (!capturedPhoto || !scannedData) return;

    try {
      setLoading(true);
      setError('');

      // Upload photo
      const photoPath = `attendance_photos/${scannedData.sessionId}/${user.uid}_${Date.now()}.jpg`;
      const uploadResult = await uploadFile(capturedPhoto, photoPath);

      if (!uploadResult.success) {
        throw new Error('Failed to upload photo');
      }

      // Submit attendance
      const attendanceData = {
        studentId: user.uid,
        sessionId: scannedData.sessionId,
        facultyId: scannedData.facultyId,
        school: scannedData.school,
        batch: scannedData.batch,
        subject: scannedData.subject,
        periods: scannedData.periods,
        photoUrl: uploadResult.url,
        studentName: userProfile.fullName,
        studentEmail: user.email,
        regNumber: userProfile.regNumber,
        timestamp: new Date(),
        status: 'present'
      };

      const markResult = await markAttendance(attendanceData);

      if (!markResult.success) {
        throw new Error('Failed to mark attendance');
      }

      setSuccess('Attendance marked successfully!');
      
      setTimeout(() => {
        closeScanner();
      }, 2000);

    } catch (err) {
      console.error('Attendance submission error:', err);
      setError(err.message || 'Failed to submit attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
      if (photoStream) {
        photoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [photoStream]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <QrCode className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Scan QR for Attendance
            </h3>
            <p className="text-gray-600 text-sm">
              Scan the QR code displayed by your faculty to mark attendance
            </p>
          </div>
          <Button
            onClick={openScanner}
            variant="primary"
            className="w-full"
            icon={<Camera className="w-5 h-5" />}
          >
            Open QR Scanner
          </Button>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <Modal
        isOpen={isOpen && !showConfirmation && !showPhotoCapture}
        onClose={closeScanner}
        title="QR Code Scanner"
        size="lg"
      >
        <div className="space-y-4">
          {!scanning ? (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <QrCode className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to Scan</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Position the QR code within the camera frame to scan
                </p>
              </div>
              <Button onClick={startScanning} variant="primary">
                Start Camera
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div id="qr-reader" className="mx-auto"></div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Position the QR code within the frame
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Make sure you're in the correct class and the QR code is not expired
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </Modal>

      {/* Attendance Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={closeScanner}
        title="Confirm Attendance"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              QR Code Scanned Successfully!
            </h3>
          </div>

          {scannedData && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Subject:</strong> {scannedData.subject}</div>
                <div><strong>School:</strong> {scannedData.school}</div>
                <div><strong>Batch:</strong> {scannedData.batch}</div>
                <div><strong>Periods:</strong> {scannedData.periods}</div>
                <div className="col-span-2">
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={closeScanner}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAttendance}
              variant="success"
              className="flex-1"
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>

      {/* Photo Capture Modal */}
      <Modal
        isOpen={showPhotoCapture}
        onClose={closeScanner}
        title="Photo Verification"
        size="lg"
      >
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Photo Verification Required
            </h3>
            <p className="text-gray-600 text-sm">
              Please take a photo for attendance verification
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              {!capturedPhoto ? (
                <div className="w-80 h-60 bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                </div>
              ) : (
                <div className="w-80 h-60 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photoPreview}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex justify-center gap-3">
            {!capturedPhoto ? (
              <>
                <Button onClick={closeScanner} variant="secondary">
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  variant="primary"
                  icon={<Camera className="w-4 h-4" />}
                >
                  Capture Photo
                </Button>
              </>
            ) : (
              <>
                <Button onClick={retakePhoto} variant="secondary">
                  Retake
                </Button>
                <Button
                  onClick={submitAttendance}
                  variant="success"
                  loading={loading}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Mark Attendance
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default QRScanner;