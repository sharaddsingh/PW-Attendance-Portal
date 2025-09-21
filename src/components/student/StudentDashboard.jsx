import React, { useState, useEffect } from 'react';
import { GraduationCap, LogOut, Calendar, BarChart3, FileText, Bell } from 'lucide-react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import QRScanner from './QRScanner';
import TodayAttendance from './TodayAttendance';
import AttendanceChart from './AttendanceChart';
import LeaveApplication from './LeaveApplication';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard = () => {
  const { user, userProfile, logout, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  if (!userProfile) {
    return <LoadingSpinner fullScreen text="Loading profile..." />;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'attendance', label: 'Today\'s Classes', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'leave', label: 'Leave Application', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {userProfile.fullName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile.fullName}</p>
                <p className="text-xs text-gray-600">{userProfile.regNumber}</p>
                <p className="text-xs text-gray-500">{userProfile.batch}</p>
              </div>
              {userProfile.profilePhotoUrl && (
                <img 
                  src={userProfile.profilePhotoUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
              )}
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                icon={<LogOut className="w-4 h-4" />}
                className="text-gray-600 hover:text-gray-900"
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="sm:hidden bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === item.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" />
                <span className="block text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden sm:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {activeSection === 'dashboard' && (
              <>
                {/* QR Scanner Section */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                  <QRScanner />
                </div>

                {/* Today's Attendance */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Classes</h2>
                  <TodayAttendance />
                </div>

                {/* Attendance Overview */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendance Overview</h2>
                  <AttendanceChart />
                </div>
              </>
            )}

            {activeSection === 'attendance' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Classes</h2>
                <TodayAttendance detailed={true} />
              </div>
            )}

            {activeSection === 'reports' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendance Reports</h2>
                <AttendanceChart detailed={true} />
              </div>
            )}

            {activeSection === 'leave' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Leave Application</h2>
                <LeaveApplication />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;