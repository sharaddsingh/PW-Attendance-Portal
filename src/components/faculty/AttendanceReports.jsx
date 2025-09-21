import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Users, BookOpen, Search, Filter } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../contexts/AuthContext';

const BATCH_OPTIONS = {
  'School of Technology': [
    'BCA 2022-25',
    'BCA 2023-26', 
    'BCA 2024-27',
    'MCA 2023-25',
    'MCA 2024-26',
    'B.Tech 2022-26',
    'B.Tech 2023-27',
    'B.Tech 2024-28'
  ],
  'School of Management': [
    'BBA 2022-25',
    'BBA 2023-26',
    'BBA 2024-27', 
    'MBA 2023-25',
    'MBA 2024-26',
    'PGDM 2023-25',
    'PGDM 2024-26'
  ]
};

// Mock report data
const MOCK_REPORTS = [
  {
    id: '1',
    date: '2024-01-15',
    school: 'School of Technology',
    batch: 'BCA 2022-25',
    subject: 'JAVA',
    totalStudents: 30,
    presentStudents: 28,
    absentStudents: 2,
    percentage: 93.33
  },
  {
    id: '2',
    date: '2024-01-14', 
    school: 'School of Technology',
    batch: 'BCA 2023-26',
    subject: 'DSA',
    totalStudents: 25,
    presentStudents: 22,
    absentStudents: 3,
    percentage: 88.00
  },
  {
    id: '3',
    date: '2024-01-13',
    school: 'School of Management',
    batch: 'BBA 2023-26',
    subject: 'Business Communication',
    totalStudents: 35,
    presentStudents: 30,
    absentStudents: 5,
    percentage: 85.71
  }
];

const AttendanceReports = () => {
  const [filterData, setFilterData] = useState({
    school: '',
    batch: '',
    subject: '',
    startDate: '',
    endDate: ''
  });
  const [reports] = useState(MOCK_REPORTS);
  const [loading, setLoading] = useState(false);

  const { userProfile } = useAuth();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset batch when school changes
    if (name === 'school') {
      setFilterData(prev => ({
        ...prev,
        batch: ''
      }));
    }
  };

  const generateReport = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Report generated! In a real app, this would fetch filtered data.');
    }, 1000);
  };

  const exportReport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPercentageBgColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 75) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const availableBatches = filterData.school ? BATCH_OPTIONS[filterData.school] : [];
  const facultySubjects = userProfile?.subjects || [];

  // Summary calculations
  const totalClasses = reports.length;
  const averageAttendance = reports.length > 0 
    ? (reports.reduce((sum, report) => sum + report.percentage, 0) / reports.length).toFixed(1)
    : 0;
  const totalStudentsInReports = reports.reduce((sum, report) => sum + report.totalStudents, 0);
  const totalPresentInReports = reports.reduce((sum, report) => sum + report.presentStudents, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalClasses}</p>
              <p className="text-sm text-gray-600">Total Classes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{totalPresentInReports}</p>
              <p className="text-sm text-gray-600">Students Present</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-600">{averageAttendance}%</p>
              <p className="text-sm text-gray-600">Average Attendance</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-600">{facultySubjects.length}</p>
              <p className="text-sm text-gray-600">Your Subjects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Report Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {/* School Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
            <select
              name="school"
              value={filterData.school}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Schools</option>
              {userProfile?.departments?.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
            <select
              name="batch"
              value={filterData.batch}
              onChange={handleFilterChange}
              disabled={!filterData.school}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">All Batches</option>
              {availableBatches.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              name="subject"
              value={filterData.subject}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {facultySubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filterData.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filterData.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={generateReport}
            loading={loading}
            variant="primary"
            icon={<Search className="w-4 h-4" />}
          >
            Generate Report
          </Button>
          <Button
            onClick={() => exportReport('pdf')}
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
          >
            Export PDF
          </Button>
          <Button
            onClick={() => exportReport('excel')}
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance Reports</h3>
        
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-500 mb-2">No Reports Found</h4>
            <p className="text-gray-400 text-sm">Generate a report to see attendance data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">School</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Batch</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Subject</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Present</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Absent</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">
                      {new Date(report.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{report.school}</td>
                    <td className="py-3 px-4 text-gray-600">{report.batch}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{report.subject}</td>
                    <td className="py-3 px-4 text-center text-gray-900">{report.totalStudents}</td>
                    <td className="py-3 px-4 text-center text-green-600 font-medium">
                      {report.presentStudents}
                    </td>
                    <td className="py-3 px-4 text-center text-red-600 font-medium">
                      {report.absentStudents}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span 
                        className={`px-2 py-1 rounded-full text-sm font-medium ${getPercentageBgColor(report.percentage)} ${getPercentageColor(report.percentage)}`}
                      >
                        {report.percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceReports;