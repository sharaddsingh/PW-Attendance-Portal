import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const AttendanceChart = ({ detailed = false }) => {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({
    overall: 85,
    subjects: [
      { name: 'JAVA', percentage: 90, present: 18, total: 20 },
      { name: 'DSA', percentage: 85, present: 17, total: 20 },
      { name: 'DBMS', percentage: 80, present: 16, total: 20 },
    ]
  });

  const { userProfile } = useAuth();

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <LoadingSpinner size="sm" text="Loading attendance data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Attendance */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <PieChart className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Overall Attendance</h3>
        </div>
        
        <div className="text-center">
          <div className={`text-4xl font-bold mb-2 ${getPercentageColor(attendanceData.overall)}`}>
            {attendanceData.overall}%
          </div>
          <p className="text-gray-600">Total Attendance Percentage</p>
          
          {attendanceData.overall < 75 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Low Attendance Warning</span>
              </div>
              <p className="text-red-600 text-sm mt-1">
                Your attendance is below 75%. Please attend more classes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subject-wise Attendance */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Subject-wise Attendance</h3>
        </div>
        
        <div className="space-y-4">
          {attendanceData.subjects.map((subject, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">{subject.name}</h4>
                <span className={`font-bold ${getPercentageColor(subject.percentage)}`}>
                  {subject.percentage}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(subject.percentage)}`}
                  style={{ width: `${subject.percentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>Present: {subject.present}</span>
                <span>Total: {subject.total}</span>
              </div>
              
              {detailed && subject.percentage < 75 && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                  Need to attend more classes to reach 75%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {detailed && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Attendance Trend</h3>
          </div>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Attendance trend chart coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceChart;