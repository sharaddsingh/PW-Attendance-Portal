import React, { useState } from 'react';
import { LogOut, QrCode, List, BarChart3, Camera, Users, UserCheck } from 'lucide-react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import QRGenerator from './QRGenerator';
import ManualAttendance from './ManualAttendance';
import PhotoVerification from './PhotoVerification';
import AttendanceReports from './AttendanceReports';
import SimpleQRTest from '../debug/SimpleQRTest';
import OfflineQRGenerator from './OfflineQRGenerator';
import { useAuth } from '../../contexts/AuthContext';

const FacultyDashboard = () => {
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
    { id: 'qr-generator', label: 'Generate QR', icon: QrCode },
    { id: 'manual-attendance', label: 'Manual Entry', icon: List },
    { id: 'photo-verification', label: 'Photo Review', icon: Camera },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Faculty Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {userProfile.fullName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile.fullName}</p>
                <p className="text-xs text-gray-600">{userProfile.employeeId}</p>
                <p className="text-xs text-gray-500">
                  {userProfile.departments?.join(', ')}
                </p>
              </div>
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
                    ? 'border-green-600 text-green-600'
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
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Faculty Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Subjects:</strong></p>
                  <div className="space-y-1">
                    {userProfile.subjects?.slice(0, 3).map((subject, index) => (
                      <p key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {subject}
                      </p>
                    ))}
                    {userProfile.subjects?.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{userProfile.subjects.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {activeSection === 'dashboard' && (
              <>
                {/* Quick Actions */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <OfflineQRGenerator />

                    {/* Manual Attendance Quick Access */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                          <List className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Manual Attendance
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Manually mark attendance for students in your class
                          </p>
                        </div>
                        <Button
                          onClick={() => setActiveSection('manual-attendance')}
                          variant="primary"
                          className="w-full"
                          icon={<List className="w-5 h-5" />}
                        >
                          Mark Attendance
                        </Button>
                      </div>
                    </div>

                    {/* Photo Verification Quick Access */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                          <Camera className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Photo Verification
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Review and verify student attendance photos
                          </p>
                        </div>
                        <Button
                          onClick={() => setActiveSection('photo-verification')}
                          variant="primary"
                          className="w-full"
                          icon={<Camera className="w-5 h-5" />}
                        >
                          Review Photos
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Debug Section */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Debug Tools</h2>
                  <SimpleQRTest />
                </div>

                {/* Recent Activity */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Recent activity will appear here</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'qr-generator' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">QR Code Generator</h2>
                <div className="space-y-6">
                  <OfflineQRGenerator />
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-yellow-800 text-sm">
                      ⚡ <strong>Using Offline Mode:</strong> QR codes work but won't be saved to database until Firebase permissions are fixed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'manual-attendance' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Manual Attendance Entry</h2>
                <ManualAttendance />
              </div>
            )}

            {activeSection === 'photo-verification' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Photo Verification</h2>
                <PhotoVerification />
              </div>
            )}

            {activeSection === 'reports' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendance Reports</h2>
                <AttendanceReports />
              </div>
            )}

            {activeSection === 'students' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Management</h2>
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                  <div className="text-center text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Student Management</h3>
                    <p>Student management features will be available soon</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
