/**
 * Application Constants
 * 
 * This file contains all static data and configuration constants used throughout
 * the PW Attendance Portal application. It provides centralized management of
 * academic data, system settings, and configuration values.
 * 
 * Key Categories:
 * - Academic data (schools, batches, subjects)
 * - User roles and authentication settings
 * - File upload configurations
 * - Attendance system settings
 * - Error messages and validation rules
 * 
 * @author PW Attendance Portal Team
 * @version 1.0.0
 */

/**
 * Batch Options by School
 * 
 * Defines available batch options for each school.
 * Used in forms and dropdowns for batch selection.
 * 
 * Structure: { 'School Name': ['Batch 1', 'Batch 2', ...] }
 */
export const BATCH_OPTIONS = {
  'School of Technology': [
    'BCA 2022-25',    // Bachelor of Computer Applications
    'BCA 2023-26', 
    'BCA 2024-27',
    'MCA 2023-25',    // Master of Computer Applications
    'MCA 2024-26',
    'B.Tech 2022-26', // Bachelor of Technology
    'B.Tech 2023-27',
    'B.Tech 2024-28'
  ],
  'School of Management': [
    'BBA 2022-25',    // Bachelor of Business Administration
    'BBA 2023-26',
    'BBA 2024-27', 
    'MBA 2023-25',    // Master of Business Administration
    'MBA 2024-26',
    'PGDM 2023-25',   // Post Graduate Diploma in Management
    'PGDM 2024-26'
  ]
};

/**
 * Subjects by Department/School
 * 
 * Comprehensive list of subjects available for each school.
 * Used for faculty profile completion and attendance session creation.
 */
export const SUBJECTS_BY_DEPARTMENT = {
  'School of Technology': [
    'JAVA', 'PYTHON', 'JAVASCRIPT',           // Programming Languages
    'DSA',                                     // Data Structures & Algorithms
    'DBMS',                                   // Database Management Systems
    'Web Development', 'Mobile App Development', // Development Tracks
    'Data Science', 'Machine Learning',       // AI/ML Track
    'Cybersecurity', 'Cloud Computing',       // Infrastructure & Security
    'Software Engineering', 'Software Testing', // Software Development
    'Computer Networks', 'Operating Systems'   // System Administration
  ],
  'School of Management': [
    'BUSINESS COMMUNICATION', 'CRITICAL COMMUNICATION', 'EXCEL', // Core Skills
    'Marketing Management', 'Financial Management',              // Core Management
    'Human Resource Management', 'Operations Management',        // Specialized Management
    'Strategic Management', 'Business Analytics',               // Advanced Management
    'Digital Marketing', 'Entrepreneurship',                    // Modern Business
    'Project Management', 'International Business',             // Specialized Areas
    'Business Ethics', 'Leadership Skills'                      // Soft Skills
  ]
};

/**
 * User Roles
 * 
 * Defines the two main user types in the system.
 */
export const USER_ROLES = { 
  STUDENT: 'student',   // Students who mark attendance
  FACULTY: 'faculty'    // Faculty who take attendance
};

/**
 * Attendance Status Options
 * 
 * Available status options for attendance marking.
 */
export const ATTENDANCE_STATUS = { 
  PRESENT: 'present',   // Student is present
  ABSENT: 'absent',     // Student is absent
  LATE: 'late',         // Student arrived late
  EXCUSED: 'excused'    // Student has valid excuse
};

/**
 * Email Domain Validation
 * 
 * Domain requirements for different user roles.
 */
export const EMAIL_DOMAINS = { 
  STUDENT: '@pwioi.com',  // Students must use institutional email
  FACULTY: '@gmail.com'   // Faculty can use any non-institutional email
};

/**
 * File Upload Configuration
 * 
 * Settings for file upload functionality (profile photos, attendance photos).
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB maximum file size
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg','image/jpg','image/png','image/gif'],
    DOCUMENTS: ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain']
  }
};

/**
 * Attendance Percentage Thresholds
 * 
 * Grade thresholds for attendance percentage calculation.
 */
export const ATTENDANCE_THRESHOLDS = { 
  EXCELLENT: 95,      // 95% and above
  GOOD: 85,          // 85-94%
  SATISFACTORY: 75,  // 75-84%
  POOR: 65           // Below 75%
};

/**
 * Device Type Detection
 * 
 * Used for responsive design and device-specific features.
 */
export const DEVICE_TYPES = { 
  MOBILE: 'mobile', 
  TABLET: 'tablet', 
  DESKTOP: 'desktop' 
};

/**
 * Period Options
 * 
 * Available options for number of periods in a session.
 */
export const PERIOD_OPTIONS = [
  { value: '1', label: '1 Period' },
  { value: '2', label: '2 Periods' },
  { value: '3', label: '3 Periods' },
  { value: '4', label: '4 Periods' },
  { value: '5', label: '5 Periods' },
  { value: '6', label: '6 Periods' }
];

/**
 * Academic Year Configuration
 * 
 * Current academic year settings and calendar configuration.
 */
export const ACADEMIC_YEAR = { 
  CURRENT: '2024-25',  // Current academic year
  START_MONTH: 7,      // July (academic year starts)
  END_MONTH: 6         // June (academic year ends)
};

/**
 * Standard Error Messages
 * 
 * Reusable error messages for common validation scenarios.
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.'
};

/**
 * Default Export
 * 
 * Consolidated export of all constants for easy importing.
 */
export default {
  BATCH_OPTIONS,
  SUBJECTS_BY_DEPARTMENT,
  USER_ROLES,
  ATTENDANCE_STATUS,
  EMAIL_DOMAINS,
  FILE_UPLOAD,
  ATTENDANCE_THRESHOLDS,
  DEVICE_TYPES,
  PERIOD_OPTIONS,
  ACADEMIC_YEAR,
  ERROR_MESSAGES
};
