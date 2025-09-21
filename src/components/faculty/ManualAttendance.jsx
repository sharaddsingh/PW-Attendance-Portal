// components/ManualAttendance.jsx
import React, { useState } from 'react';
import {
  BATCH_OPTIONS,
  SUBJECTS_BY_DEPARTMENT,
  ATTENDANCE_STATUS,
  PERIOD_OPTIONS
} from '../../utils/constants';

const ManualAttendance = () => {
  const [department, setDepartment] = useState('School of Technology');
  const [batch, setBatch] = useState('');
  const [subject, setSubject] = useState('');
  const [period, setPeriod] = useState('1');
  const [attendance, setAttendance] = useState({}); // { studentId: 'present' }

  // Sample students for demonstration
  const students = [
    { id: 'stu1', name: 'John Doe' },
    { id: 'stu2', name: 'Jane Smith' },
    { id: 'stu3', name: 'Alice Johnson' }
  ];

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = () => {
    console.log('Attendance Data:', { department, batch, subject, period, attendance });
    alert('Attendance submitted successfully!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manual Attendance</h2>

      {/* Department */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Department:</label>
        <select
          className="border rounded p-2 w-full"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          {Object.keys(BATCH_OPTIONS).map(dep => (
            <option key={dep} value={dep}>{dep}</option>
          ))}
        </select>
      </div>

      {/* Batch */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Batch:</label>
        <select
          className="border rounded p-2 w-full"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        >
          <option value="">Select Batch</option>
          {BATCH_OPTIONS[department].map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Subject:</label>
        <select
          className="border rounded p-2 w-full"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="">Select Subject</option>
          {SUBJECTS_BY_DEPARTMENT[department].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Period */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Period:</label>
        <select
          className="border rounded p-2 w-full"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          {PERIOD_OPTIONS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Attendance Table */}
      <table className="w-full border-collapse border mb-4">
        <thead>
          <tr>
            <th className="border px-2 py-1">Student</th>
            <th className="border px-2 py-1">Present</th>
            <th className="border px-2 py-1">Absent</th>
            <th className="border px-2 py-1">Late</th>
            <th className="border px-2 py-1">Excused</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td className="border px-2 py-1">{student.name}</td>
              {Object.values(ATTENDANCE_STATUS).map(status => (
                <td key={status} className="border px-2 py-1 text-center">
                  <input
                    type="radio"
                    name={student.id}
                    checked={attendance[student.id] === status}
                    onChange={() => handleAttendanceChange(student.id, status)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Attendance
      </button>
    </div>
  );
};

export default ManualAttendance;
