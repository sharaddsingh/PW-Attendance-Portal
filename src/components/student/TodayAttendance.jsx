import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const TodayAttendance = ({ detailed = false }) => {
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, userProfile } = useAuth();

  useEffect(() => {
    if (!user || !userProfile) return;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    try {
      // Query attendance for today
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('studentId', '==', user.uid),
        where('timestamp', '>=', todayStart),
        where('timestamp', '<', todayEnd),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
        const attendanceData = [];
        snapshot.forEach((doc) => {
          attendanceData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setTodayAttendance(attendanceData);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching today\'s attendance:', err);
        setError('Failed to load today\'s attendance');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up attendance listener:', err);
      setError('Failed to load today\'s attendance');
      setLoading(false);
    }
  }, [user, userProfile]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <LoadingSpinner size="sm" text="Loading today's attendance..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Today's Classes - {new Date().toLocaleDateString()}
            </h3>
            <p className="text-sm text-gray-600">
              Your attendance status for today's classes
            </p>
          </div>
        </div>

        {todayAttendance.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-500 mb-2">
              No Classes Today
            </h4>
            <p className="text-gray-400 text-sm">
              Today's attendance will appear here once marked by faculty
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayAttendance.map((attendance) => (
              <div
                key={attendance.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(attendance.status)}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {attendance.subject}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(attendance.timestamp)}
                      </span>
                      {detailed && (
                        <>
                          <span>School: {attendance.school}</span>
                          <span>Batch: {attendance.batch}</span>
                          <span>Periods: {attendance.periods}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(attendance.status)}`}>
                    {attendance.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {todayAttendance.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Today's Summary:</span>
              <div className="flex gap-4">
                <span className="text-green-600 font-medium">
                  Present: {todayAttendance.filter(a => a.status === 'present').length}
                </span>
                <span className="text-red-600 font-medium">
                  Absent: {todayAttendance.filter(a => a.status === 'absent').length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayAttendance;