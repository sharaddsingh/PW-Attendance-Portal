# Firebase Setup Guide for PW Attendance Portal

## 📋 Overview

This comprehensive guide covers all Firebase configuration requirements for the PW Attendance Portal, including security rules, database structure, and deployment procedures.

## 🚀 Quick Start

### Prerequisites
- Node.js and npm installed
- Firebase CLI: `npm install -g firebase-tools`
- Access to Firebase Console

### Initial Setup Commands

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init

# Deploy all configurations
firebase deploy
```

## 📁 Project Structure

Your project now includes these Firebase configuration files:

```
PW-attendance-portal/
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules  
├── firestore.indexes.json # Firestore composite indexes
├── firebase.json          # Firebase project configuration
├── .firebaserc           # Firebase project aliases
└── FIREBASE_SETUP.md     # This documentation
```

## 🔐 Security Rules

### Firestore Security Rules

The `firestore.rules` file implements role-based access control:

#### Key Features:
- **Role-based permissions**: Student, Faculty, Admin roles
- **Email domain validation**: Students (@pwioi.com), Faculty (@gmail.com)
- **Document ownership verification**
- **Profile completion checks**
- **Secure attendance marking**

#### Collections Protected:
1. **users** - Basic authentication data
2. **profiles** - Detailed user profiles
3. **attendance_sessions** - QR code sessions
4. **attendance** - Attendance records
5. **leave_applications** - Student leave requests
6. **schools/batches/subjects** - Academic data
7. **notifications** - User notifications
8. **system_config** - App configuration

### Storage Security Rules

The `storage.rules` file secures file uploads:

#### Storage Paths:
- `/profile_pictures/` - User profile photos (5MB max)
- `/attendance_photos/` - Attendance verification photos
- `/qr_codes/` - Generated QR codes
- `/leave_attachments/` - Leave application documents
- `/reports/` - Generated reports
- `/academic_documents/` - Course materials

#### Security Features:
- File type validation (images, documents)
- Size limits (5MB images, 10MB documents)
- User-specific folder access
- Immutable attendance photos

## 🗄️ Database Structure

### Core Collections

#### 1. Users Collection
```javascript
{
  uid: "user-id",
  email: "user@email.com",
  displayName: "User Name",
  role: "student|faculty|admin",
  profileComplete: boolean,
  createdAt: Timestamp
}
```

#### 2. Profiles Collection
```javascript
{
  // Common fields
  uid: "user-id",
  role: "student|faculty",
  fullName: "Full Name",
  email: "email@domain.com",
  mobile: "phone-number",
  
  // Student specific
  rollNumber: "roll-number",
  schoolId: "school-id",
  batchId: "batch-id",
  
  // Faculty specific  
  employeeId: "emp-id",
  departments: ["dept1", "dept2"],
  subjects: ["subject1", "subject2"],
  
  createdAt: Timestamp
}
```

#### 3. Attendance Sessions
```javascript
{
  sessionId: "auto-generated",
  facultyId: "faculty-uid",
  facultyName: "Faculty Name",
  school: "School Name",
  batch: "Batch Name",
  subject: "Subject Name",
  periods: number,
  isActive: boolean,
  qrCodeUrl: "storage-url",
  studentsPresent: [],
  createdAt: Timestamp,
  expiresAt: Timestamp
}
```

#### 4. Attendance Records
```javascript
{
  studentId: "student-uid",
  studentName: "Student Name",
  sessionId: "session-id",
  subject: "Subject Name",
  timestamp: Timestamp,
  photoUrl: "storage-url",
  location: GeoPoint,
  deviceInfo: "user-agent"
}
```

## 📊 Firestore Indexes

The `firestore.indexes.json` file defines composite indexes for optimized queries:

### Key Indexes:
- Faculty sessions by status and date
- Student attendance by subject
- Leave applications by status
- Batch/subject filtering
- Notification queries

### Deploy Indexes:
```bash
firebase deploy --only firestore:indexes
```

## 🚀 Deployment

### Step 1: Build Application
```bash
npm run build
```

### Step 2: Deploy to Firebase

Deploy everything:
```bash
firebase deploy
```

Or deploy specific services:
```bash
# Deploy hosting only
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules  
firebase deploy --only storage:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Step 3: Verify Deployment
1. Visit: https://pw-attendance-portal.web.app
2. Test authentication
3. Verify database access
4. Check storage uploads

## 🔧 Firebase Console Configuration

### 1. Authentication Setup
1. Enable **Google Sign-In** provider
2. Add authorized domains
3. Configure OAuth consent screen

### 2. Firestore Setup
1. Create database in production mode
2. Select closest region to users
3. Deploy security rules

### 3. Storage Setup
1. Initialize Cloud Storage
2. Select storage region (same as Firestore)
3. Deploy storage rules

### 4. Hosting Setup
1. Enable Firebase Hosting
2. Configure custom domain (optional)
3. Set up SSL certificates

## 📝 Initial Data Setup

### Create Admin User
```javascript
// Add to Firestore Console - users collection
{
  uid: "admin-uid",
  email: "admin@gmail.com",
  role: "admin",
  displayName: "Administrator",
  profileComplete: true
}
```

### Add Schools
```javascript
// schools collection
{
  id: "school-of-technology",
  name: "School of Technology",
  departments: ["BCA", "MCA", "B.Tech"],
  isActive: true
}
```

### Add Batches
```javascript
// batches collection
{
  id: "bca-2024-27",
  name: "BCA 2024-27",
  schoolId: "school-of-technology",
  startYear: 2024,
  endYear: 2027,
  isActive: true
}
```

### Add Subjects
```javascript
// subjects collection
{
  id: "java",
  name: "JAVA Programming",
  code: "CS101",
  schoolId: "school-of-technology",
  credits: 4,
  isActive: true
}
```

## 🧪 Testing

### Local Testing with Emulators
```bash
# Start Firebase emulators
firebase emulators:start

# Access Emulator UI
# http://localhost:4000
```

### Emulator Ports:
- Auth: 9099
- Firestore: 8080
- Storage: 9199
- Hosting: 5000
- UI: 4000

## 🛡️ Security Best Practices

1. **Never expose API keys** in public repositories
2. **Regularly audit** security rules
3. **Monitor usage** in Firebase Console
4. **Enable budget alerts** in GCP Console
5. **Implement rate limiting** via Security Rules
6. **Use Firebase App Check** for additional security
7. **Regular backups** of Firestore data

## 📈 Monitoring

### Key Metrics to Monitor:
- Daily active users
- Firestore read/write operations
- Storage bandwidth usage
- Authentication attempts
- Security rule violations

### Set Up Alerts:
1. Budget alerts in Google Cloud Console
2. Error rate monitoring
3. Performance metrics
4. Security breach attempts

## 🐛 Troubleshooting

### Common Issues:

#### Permission Denied Errors
- Check user authentication status
- Verify security rules
- Ensure profile is completed
- Check role assignments

#### Index Errors
- Click error link to auto-create index
- Or add to firestore.indexes.json
- Deploy with `firebase deploy --only firestore:indexes`

#### Storage Upload Failures
- Verify file size limits
- Check file type validation
- Ensure storage rules are deployed
- Verify user permissions

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## 🔄 Next Steps

1. Enable Cloud Functions for automated tasks
2. Set up Cloud Messaging for notifications
3. Implement Performance Monitoring
4. Add Crashlytics for error tracking
5. Configure Remote Config for feature flags

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Project**: PW Attendance Portal