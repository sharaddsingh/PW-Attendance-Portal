/**
 * Simple QR Test Component
 * 
 * A simplified version to test QR generation without UI complexity
 */

import React, { useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../../contexts/AuthContext';
import { createAttendanceSession } from '../../services/firebase';

const SimpleQRTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, userProfile } = useAuth();

  const testQRGeneration = async () => {
    setLoading(true);
    setResult('Testing...');

    try {
      // Step 1: Check user authentication
      console.log('👤 User check:', user);
      if (!user) {
        throw new Error('User not authenticated');
      }
      setResult(prev => prev + '\n✅ User authenticated');

      // Step 2: Test QR code generation (without Firebase)
      const testData = {
        test: 'data',
        timestamp: new Date().toISOString()
      };
      
      const qrString = JSON.stringify(testData);
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      setResult(prev => prev + '\n✅ QR code library working');

      // Step 3: Test Firebase session creation
      const sessionData = {
        facultyId: user.uid,
        facultyName: userProfile?.fullName || user.displayName || 'Test Faculty',
        facultyEmail: user.email,
        schoolId: 'test-school',
        schoolName: 'Test School',
        batchId: 'test-batch',
        batchName: 'Test Batch',
        subjectId: 'test-subject',
        subjectName: 'Test Subject',
        periods: 1,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 30000),
        studentsCount: 25,
        academicYear: 2024,
        semester: 1
      };

      console.log('📝 Testing session creation with data:', sessionData);
      const sessionResult = await createAttendanceSession(sessionData);
      console.log('📄 Session result:', sessionResult);
      
      if (sessionResult.success) {
        setResult(prev => prev + '\n✅ Firebase session creation successful');
        setResult(prev => prev + `\n🆔 Session ID: ${sessionResult.sessionId}`);
      } else {
        throw new Error(`Firebase session failed: ${sessionResult.error}`);
      }

      setResult(prev => prev + '\n🎉 All tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error);
      setResult(prev => prev + `\n❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border">
      <h3 className="text-lg font-bold mb-4">🧪 QR Generation Test</h3>
      
      <button
        onClick={testQRGeneration}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '🔄 Testing...' : '🚀 Run Test'}
      </button>
      
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default SimpleQRTest;