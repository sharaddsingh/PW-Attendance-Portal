/**
 * Manual Attendance Component for Faculty
 * 
 * This component allows faculty to manually mark attendance for students
 * in their classes with Firebase integration.
 * 
 * @author PW Attendance Portal Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Users, Save, CheckCircle, XCircle, Clock, UserCheck, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useNotify } from '../../contexts/NotificationContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db, academicDataService } from '../../services/firebase';

const ManualAttendance = () => {
  const [school, setSchool] = useState('');
  const [batch, setBatch] = useState('');
  const [subject, setSubject] = useState('');
  const [periods, setPeriods] = useState('1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  
  const { user, userProfile } = useAuth();
  const notify = useNotify();
  
  // Fetch schools on mount
  useEffect(() => {
    fetchSchools();
  }, []);
  
  // Fetch batches when school changes
  useEffect(() => {
    if (school) {
      fetchBatches(school);
    }
  }, [school]);
  
  // Fetch subjects when school changes
  useEffect(() => {
    if (school) {
      fetchSubjects(school);
    }
  }, [school]);
  
  // Fetch students when batch is selected
  useEffect(() => {
    if (school && batch) {
      fetchStudents();
    }
  }, [school, batch]);
  
  const fetchSchools = async () => {
    try {
      const result = await academicDataService.getSchools();
      if (result.success) {
        setSchools(result.data);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      notify.error('Failed to fetch schools');
    }
  };
  
  const fetchBatches = async (schoolId) => {
    try {
      const result = await academicDataService.getBatchesBySchool(schoolId);
      if (result.success) {
        setBatches(result.data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      notify.error('Failed to fetch batches');
    }
  };
  
  const fetchSubjects = async (schoolId) => {
    try {
      const result = await academicDataService.getSubjectsBySchool(schoolId);
      if (result.success) {
        setSubjects(result.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      notify.error('Failed to fetch subjects');
    }
  };
  
  const fetchStudents = async () => {
    try {
      setFetchingStudents(true);
      const schoolId = school;
      const batchId = batch;
      
      const result = await academicDataService.getStudentsByBatch(schoolId, batchId);
      if (result.success) {
        setStudents(result.data);
        // Initialize attendance with all present
        const initialAttendance = {};
        result.data.forEach(student => {
          initialAttendance[student.id] = 'present';
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      notify.error('Failed to fetch students');
    } finally {
      setFetchingStudents(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!school || !batch || !subject || !date) {
      notify.error('Please fill all required fields');
      return;
    }
    
    if (students.length === 0) {
      notify.error('No students found for the selected batch');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create attendance session
      const sessionData = {
        facultyId: user.uid,
        facultyName: userProfile.fullName,
        school,
        batch,
        subject,
        date,
        periods: parseInt(periods),
        type: 'manual',
        createdAt: new Date(),
        totalStudents: students.length,
        presentCount: Object.values(attendance).filter(s => s === 'present').length,
        absentCount: Object.values(attendance).filter(s => s === 'absent').length,
        lateCount: Object.values(attendance).filter(s => s === 'late').length
      };
      
      const sessionRef = await addDoc(collection(db, 'attendance_sessions'), sessionData);
      
      // Submit individual attendance records
      const attendancePromises = students.map(student => {
        const status = attendance[student.id] || 'absent';
        return addDoc(collection(db, 'attendance'), {
          sessionId: sessionRef.id,
          studentId: student.id,
          studentName: student.fullName,
          regNumber: student.regNumber,
          facultyId: user.uid,
          school,
          batch,
          subject,
          date,
          periods: parseInt(periods),
          status,
          markedBy: 'manual',
          timestamp: new Date()
        });
      });
      
      await Promise.all(attendancePromises);
      
      notify.success(`Attendance marked successfully for ${students.length} students`);
      
      // Reset form
      setAttendance({});
      setStudents([]);
      setBatch('');
      setSubject('');
      
    } catch (error) {
      console.error('Error submitting attendance:', error);
      notify.error('Failed to submit attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'absent': return 'text-red-600 bg-red-50';
      case 'late': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Manual Attendance</h3>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* School */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School <span className="text-red-500">*</span>
            </label>
            <select
              value={school}
              onChange={(e) => {
                setSchool(e.target.value);
                setBatch('');
                setSubject('');
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select School</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch <span className="text-red-500">*</span>
            </label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={!school}
            >
              <option value="">Select Batch</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={!school}
            >
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Periods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Periods <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={periods}
              onChange={(e) => setPeriods(e.target.value)}
              min="1"
              max="8"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>

        {/* Students Table */}
        {fetchingStudents ? (
          <LoadingSpinner text="Loading students..." />
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">
                    Student Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border border-gray-200">
                    Reg. Number
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border border-gray-200">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Present
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border border-gray-200">
                    <div className="flex items-center justify-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Absent
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border border-gray-200">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      Late
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm text-gray-900 border border-gray-200">
                      {student.fullName || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">
                      {student.regNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center border border-gray-200">
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        checked={attendance[student.id] === 'present'}
                        onChange={() => handleAttendanceChange(student.id, 'present')}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center border border-gray-200">
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        checked={attendance[student.id] === 'absent'}
                        onChange={() => handleAttendanceChange(student.id, 'absent')}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center border border-gray-200">
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        checked={attendance[student.id] === 'late'}
                        onChange={() => handleAttendanceChange(student.id, 'late')}
                        className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total Students: <span className="font-semibold text-gray-900">{students.length}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">
                    Present: {Object.values(attendance).filter(s => s === 'present').length}
                  </span>
                  <span className="text-red-600">
                    Absent: {Object.values(attendance).filter(s => s === 'absent').length}
                  </span>
                  <span className="text-yellow-600">
                    Late: {Object.values(attendance).filter(s => s === 'late').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSubmit}
                variant="primary"
                loading={loading}
                disabled={loading || students.length === 0}
                icon={<Save className="w-4 h-4" />}
              >
                Submit Attendance
              </Button>
            </div>
          </div>
        ) : (
          school && batch && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No students found for the selected batch</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ManualAttendance;
