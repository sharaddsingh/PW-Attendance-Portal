# 📊 Firebase Database Schema - PW Attendance Portal

## Database Overview

This document outlines the complete Firestore database structure for the PW Attendance Portal, including all collections, documents, fields, and relationships.

## 🗂️ Collections Structure

### 1. **users** (Authentication Data)
Primary collection for basic user authentication information.

```typescript
{
  // Document ID: User's UID from Firebase Auth
  uid: string,                    // Firebase Auth UID
  email: string,                   // User's email address
  displayName: string,             // User's display name
  photoURL: string,                // Google profile photo URL
  role: "student" | "faculty" | "admin", // User role
  profileComplete: boolean,        // Profile completion status
  createdAt: timestamp,            // Account creation time
  lastLogin: timestamp,            // Last login time
  isActive: boolean,               // Account active status
}
```

### 2. **profiles** (Detailed User Profiles)
Extended user information based on role.

#### Student Profile:
```typescript
{
  // Document ID: User's UID
  uid: string,                     // User's UID (reference)
  role: "student",                 // Fixed role
  
  // Personal Information
  fullName: string,                // Full legal name
  regNumber: string,               // Registration/Roll number
  email: string,                   // Email address
  phone: string,                   // 10-digit phone number
  profilePhotoUrl: string,         // Uploaded profile photo URL
  
  // Academic Information
  school: string,                  // "School of Technology" | "School of Management"
  batch: string,                   // e.g., "BCA 2024-27"
  section: string?,                // Optional section
  semester: number?,               // Current semester
  
  // System Information
  deviceId: string,                // Device fingerprint
  isProfileComplete: boolean,      // Profile completion status
  createdAt: timestamp,            // Profile creation time
  updatedAt: timestamp,            // Last update time
}
```

#### Faculty Profile:
```typescript
{
  // Document ID: User's UID
  uid: string,                     // User's UID (reference)
  role: "faculty",                 // Fixed role
  
  // Personal Information
  fullName: string,                // Full legal name
  employeeId: string,              // Employee ID
  email: string,                   // Email address
  phone: string,                   // 10-digit phone number
  profilePhotoUrl: string?,        // Optional profile photo
  
  // Academic Information
  departments: string[],           // Array of departments
  subjects: string[],              // Array of subjects teaching
  designation: string?,            // Professor, Assistant Professor, etc.
  
  // System Information
  isProfileComplete: boolean,      // Profile completion status
  createdAt: timestamp,            // Profile creation time
  updatedAt: timestamp,            // Last update time
}
```

### 3. **schools** (Academic Institutions)
Educational institutions/departments.

```typescript
{
  // Document ID: school_id (e.g., "sot", "som")
  id: string,                      // Unique school ID
  name: string,                    // Full name
  shortName: string,               // Abbreviation (SOT, SOM)
  description: string,             // School description
  departments: string[],           // List of departments
  isActive: boolean,               // Active status
  createdAt: timestamp,            // Creation time
}
```

### 4. **batches** (Student Batches)
Student batch/class information.

```typescript
{
  // Document ID: batch_id (e.g., "bca-2024-27")
  id: string,                      // Unique batch ID
  name: string,                    // Display name
  schoolId: string,                // Reference to school
  program: string,                 // BCA, MCA, BBA, MBA, etc.
  startYear: number,               // Batch start year
  endYear: number,                 // Batch end year
  currentSemester: number,         // Current semester
  totalStudents: number,           // Total enrolled students
  isActive: boolean,               // Active status
  createdAt: timestamp,            // Creation time
}
```

### 5. **subjects** (Academic Subjects)
Course/subject information.

```typescript
{
  // Document ID: subject_id (e.g., "java-programming")
  id: string,                      // Unique subject ID
  name: string,                    // Subject name
  code: string,                    // Subject code (CS101)
  schoolId: string,                // Reference to school
  credits: number,                 // Credit hours
  type: "theory" | "practical",   // Subject type
  semester: number,                // Offered in semester
  isActive: boolean,               // Active status
  createdAt: timestamp,            // Creation time
}
```

### 6. **attendance_sessions** (QR Code Sessions)
Faculty-created attendance sessions with QR codes.

```typescript
{
  // Document ID: Auto-generated
  sessionId: string,               // Auto-generated ID
  
  // Faculty Information
  facultyId: string,               // Faculty UID
  facultyName: string,             // Faculty name
  
  // Session Details
  school: string,                  // School name
  batch: string,                   // Batch name
  subject: string,                 // Subject name
  topic: string?,                  // Optional lecture topic
  periods: number,                 // Number of periods
  sessionType: "regular" | "extra" | "makeup", // Session type
  
  // QR Code Information
  qrCodeData: string,              // Encrypted QR data
  qrCodeUrl: string?,              // Storage URL for QR image
  qrCodeGenerated: boolean,        // Generation status
  rotationInterval: number,        // QR rotation in seconds
  
  // Attendance Tracking
  studentsPresent: [               // Array of present students
    {
      studentId: string,
      studentName: string,
      markedAt: timestamp,
      photoUrl: string?,
      location: geopoint?,
    }
  ],
  totalPresent: number,            // Count of present students
  totalStudents: number,           // Total expected students
  
  // Session Status
  isActive: boolean,               // Session active status
  createdAt: timestamp,            // Session creation time
  expiresAt: timestamp,            // Session expiry time
  deactivatedAt: timestamp?,       // Manual deactivation time
  lastUpdated: timestamp,          // Last update time
}
```

### 7. **attendance** (Individual Attendance Records)
Individual student attendance records.

```typescript
{
  // Document ID: Auto-generated
  attendanceId: string,            // Auto-generated ID
  
  // Student Information
  studentId: string,               // Student UID
  studentName: string,             // Student name
  regNumber: string,               // Registration number
  
  // Session Information
  sessionId: string,               // Reference to session
  facultyId: string,               // Faculty UID
  subject: string,                 // Subject name
  batch: string,                   // Batch name
  
  // Attendance Details
  markedAt: timestamp,             // Attendance marked time
  markedBy: "qr" | "manual",      // Marking method
  periods: number,                 // Number of periods
  status: "present" | "absent" | "late", // Attendance status
  
  // Verification Data
  photoUrl: string?,               // Selfie URL for verification
  location: geopoint?,             // GPS location
  deviceInfo: string,              // Device user agent
  ipAddress: string?,              // IP address
  
  // Additional Info
  remarks: string?,                // Optional remarks
  isVerified: boolean,             // Verification status
  timestamp: timestamp,            // Record creation time
}
```

### 8. **leave_applications** (Leave Requests)
Student leave applications.

```typescript
{
  // Document ID: Auto-generated
  applicationId: string,           // Auto-generated ID
  
  // Student Information
  studentId: string,               // Student UID
  studentName: string,             // Student name
  batch: string,                   // Student batch
  regNumber: string,               // Registration number
  
  // Leave Details
  date: string,                    // Leave date (YYYY-MM-DD)
  startDate: date?,                // For multi-day leave
  endDate: date?,                  // For multi-day leave
  periods: number,                 // Number of classes
  subject: string,                 // Subject missing
  reason: string,                  // Leave reason
  leaveType: "sick" | "personal" | "emergency", // Leave type
  
  // Attachments
  attachmentUrl: string?,          // Document URL
  medicalCertificate: string?,     // Medical certificate URL
  
  // Approval Workflow
  status: "pending" | "approved" | "rejected", // Application status
  reviewedBy: string?,             // Faculty UID who reviewed
  reviewedAt: timestamp?,          // Review timestamp
  reviewerComments: string?,       // Faculty comments
  
  // System Info
  appliedAt: timestamp,            // Application time
  updatedAt: timestamp,            // Last update time
}
```

### 9. **notifications** (User Notifications)
System and user notifications.

```typescript
{
  // Document ID: Auto-generated
  notificationId: string,          // Auto-generated ID
  
  // Recipient Information
  userId: string,                  // Recipient UID
  userRole: string,                // User role
  
  // Notification Content
  title: string,                   // Notification title
  message: string,                 // Notification body
  type: "attendance" | "leave" | "announcement" | "system", // Type
  priority: "low" | "medium" | "high", // Priority level
  
  // Action Data
  actionType: string?,             // Click action type
  actionData: object?,             // Additional action data
  link: string?,                   // Navigation link
  
  // Status
  isRead: boolean,                 // Read status
  readAt: timestamp?,              // Read timestamp
  
  // System Info
  createdAt: timestamp,            // Creation time
  expiresAt: timestamp?,           // Expiry time
}
```

### 10. **attendance_reports** (Analytics)
Aggregated attendance reports.

```typescript
{
  // Document ID: Auto-generated
  reportId: string,                // Auto-generated ID
  
  // Report Scope
  type: "daily" | "weekly" | "monthly", // Report type
  school: string,                  // School name
  batch: string,                   // Batch name
  subject: string?,                // Optional subject filter
  
  // Report Period
  startDate: date,                 // Report start date
  endDate: date,                   // Report end date
  reportDate: date,                // Generation date
  
  // Faculty Information
  facultyId: string?,              // Optional faculty filter
  facultyName: string?,            // Faculty name
  
  // Statistics
  totalClasses: number,            // Total classes conducted
  totalStudents: number,           // Total enrolled students
  averageAttendance: number,       // Average percentage
  
  // Detailed Data
  studentAttendance: [             // Per-student statistics
    {
      studentId: string,
      studentName: string,
      classesAttended: number,
      attendancePercentage: number,
      totalAbsent: number,
    }
  ],
  
  // Daily Breakdown
  dailyStats: [                    // Daily statistics
    {
      date: date,
      totalPresent: number,
      totalAbsent: number,
      percentage: number,
    }
  ],
  
  // System Info
  generatedAt: timestamp,          // Report generation time
  generatedBy: string,             // Generator UID
}
```

### 11. **system_config** (App Configuration)
System-wide configuration settings.

```typescript
{
  // Document ID: "config"
  configId: "config",              // Fixed ID
  
  // QR Settings
  qrExpiryTime: number,            // Default QR expiry (seconds)
  qrRotationInterval: number,      // QR rotation interval
  allowOfflineQR: boolean,         // Allow offline QR codes
  
  // Attendance Settings
  lateMarkThreshold: number,       // Minutes for late marking
  minAttendancePercentage: number, // Minimum attendance required
  allowManualMarking: boolean,     // Allow manual attendance
  
  // Leave Settings
  maxLeaveDays: number,            // Maximum leave days
  requireAttachment: boolean,      // Require leave attachment
  
  // Session Settings
  defaultSessionDuration: number,  // Default session duration
  maxActiveSessionsPerFaculty: number, // Max concurrent sessions
  
  // Security Settings
  requirePhotoVerification: boolean, // Require photo for attendance
  requireLocationVerification: boolean, // Require GPS location
  maxDevicesPerStudent: number,    // Device limit per student
  
  // Academic Calendar
  currentSemester: number,         // Current semester
  semesterStartDate: date,         // Semester start
  semesterEndDate: date,           // Semester end
  holidays: date[],                // Holiday list
  
  // System Info
  version: string,                 // App version
  updatedAt: timestamp,            // Last update
  updatedBy: string,               // Admin UID
}
```

### 12. **audit_logs** (System Audit Trail)
Security and audit logging.

```typescript
{
  // Document ID: Auto-generated
  logId: string,                   // Auto-generated ID
  
  // Actor Information
  userId: string,                  // User performing action
  userRole: string,                // User role
  userName: string,                // User name
  
  // Action Details
  action: string,                  // Action performed
  resource: string,                // Resource affected
  resourceId: string,              // Resource ID
  method: string,                  // HTTP method or operation
  
  // Change Details
  previousValue: object?,          // Previous state
  newValue: object?,               // New state
  changes: string[],               // List of changed fields
  
  // Context
  ipAddress: string,               // Client IP
  userAgent: string,               // Browser/device info
  location: geopoint?,             // GPS location
  
  // Status
  success: boolean,                // Operation success
  errorMessage: string?,           // Error if failed
  
  // System Info
  timestamp: timestamp,            // Action timestamp
  serverTimestamp: timestamp,      // Server processing time
}
```

## 🔗 Collection Relationships

### Primary Relationships:
1. **users** ↔ **profiles**: One-to-one (UID based)
2. **profiles** → **schools**: Many-to-one (student/faculty to school)
3. **profiles** → **batches**: Many-to-one (students to batch)
4. **attendance_sessions** → **attendance**: One-to-many
5. **profiles** → **attendance**: One-to-many (student attendance)
6. **profiles** → **leave_applications**: One-to-many
7. **profiles** → **notifications**: One-to-many

### Data Flow:
```
Authentication (users)
    ↓
Profile Creation (profiles)
    ↓
Academic Assignment (schools, batches, subjects)
    ↓
Attendance Tracking (attendance_sessions → attendance)
    ↓
Reports & Analytics (attendance_reports)
```

## 📊 Indexes Required

### Composite Indexes:
1. `attendance_sessions`: facultyId + isActive + createdAt
2. `attendance`: studentId + timestamp
3. `attendance`: sessionId + timestamp  
4. `leave_applications`: studentId + status + date
5. `notifications`: userId + isRead + createdAt
6. `profiles`: role + school + batch
7. `attendance_reports`: type + reportDate

## 🔐 Security Considerations

### Role-Based Access:
- **Students**: Read own data, create attendance/leave
- **Faculty**: Read student data, create sessions, approve leave
- **Admin**: Full access to all collections

### Data Validation:
- Email domain validation (students: @pwioi.com, faculty: @gmail.com)
- Phone number format validation
- Date/time range validations
- File size and type restrictions

### Privacy Protection:
- Personal data encryption
- Secure photo storage
- GPS data anonymization
- Audit log retention policies

## 📈 Performance Optimization

### Caching Strategy:
- Cache school/batch/subject data
- Cache user profiles
- Cache active sessions

### Data Aggregation:
- Pre-compute attendance percentages
- Generate daily/weekly reports
- Maintain running statistics

### Cleanup Policies:
- Archive old attendance records
- Purge expired sessions
- Remove old notifications
- Compress audit logs

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintained By**: PW Attendance Portal Team