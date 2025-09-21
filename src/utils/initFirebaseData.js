import { academicDataService, createUserDocument, createProfileDocument } from '../services/firebase';

/**
 * Initialize complete Firebase data structure
 * This includes schools, batches, subjects, and sample users
 */
export const initializeCompleteFirebaseData = async () => {
  try {
    console.log('🚀 Initializing complete Firebase data...');
    
    // Initialize academic data first
    await academicDataService.initializeAcademicData();
    console.log('✅ Academic data initialized');
    
    // Create sample faculty profiles
    await createSampleFacultyProfiles();
    console.log('✅ Sample faculty profiles created');
    
    // Create sample student profiles  
    await createSampleStudentProfiles();
    console.log('✅ Sample student profiles created');
    
    console.log('🎉 Complete Firebase data initialization successful!');
    return { success: true, message: 'All data initialized successfully' };
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create sample faculty profiles
 */
const createSampleFacultyProfiles = async () => {
  const sampleFaculty = [
    {
      uid: 'faculty_1',
      email: 'john.doe@faculty.com',
      fullName: 'Dr. John Doe',
      role: 'faculty',
      department: 'sot',
      subjects: ['java', 'python-sot', 'database'],
      designation: 'Professor',
      experience: '10 years',
      qualification: 'Ph.D in Computer Science'
    },
    {
      uid: 'faculty_2', 
      email: 'jane.smith@faculty.com',
      fullName: 'Prof. Jane Smith',
      role: 'faculty',
      department: 'som',
      subjects: ['economics', 'python-som'],
      designation: 'Associate Professor',
      experience: '8 years',
      qualification: 'MBA, Ph.D in Economics'
    },
    {
      uid: 'faculty_3',
      email: 'mike.wilson@faculty.com', 
      fullName: 'Dr. Mike Wilson',
      role: 'faculty',
      department: 'sot',
      subjects: ['javascript', 'sql'],
      designation: 'Assistant Professor',
      experience: '5 years',
      qualification: 'M.Tech, Ph.D in Software Engineering'
    }
  ];

  for (const faculty of sampleFaculty) {
    // Create user document
    await createUserDocument(faculty.uid, {
      email: faculty.email,
      displayName: faculty.fullName,
      role: faculty.role,
      isActive: true
    });
    
    // Create profile document
    await createProfileDocument(faculty.uid, faculty);
  }
};

/**
 * Create sample student profiles
 */
const createSampleStudentProfiles = async () => {
  const sampleStudents = [
    // SOT Students
    {
      uid: 'student_sot_1',
      email: 'alice.johnson@pwioi.com',
      fullName: 'Alice Johnson',
      role: 'student',
      schoolId: 'sot',
      batchId: 'sot24b1',
      regNumber: 'SOT2024001',
      phone: '9876543210',
      address: 'Mumbai, Maharashtra'
    },
    {
      uid: 'student_sot_2',
      email: 'bob.brown@pwioi.com',
      fullName: 'Bob Brown', 
      role: 'student',
      schoolId: 'sot',
      batchId: 'sot24b1',
      regNumber: 'SOT2024002',
      phone: '9876543211',
      address: 'Delhi, India'
    },
    {
      uid: 'student_sot_3',
      email: 'charlie.davis@pwioi.com',
      fullName: 'Charlie Davis',
      role: 'student', 
      schoolId: 'sot',
      batchId: 'sot24b2',
      regNumber: 'SOT2024003',
      phone: '9876543212',
      address: 'Bangalore, Karnataka'
    },
    // SOM Students
    {
      uid: 'student_som_1',
      email: 'diana.miller@pwioi.com',
      fullName: 'Diana Miller',
      role: 'student',
      schoolId: 'som',
      batchId: 'som24b1', 
      regNumber: 'SOM2024001',
      phone: '9876543213',
      address: 'Chennai, Tamil Nadu'
    },
    {
      uid: 'student_som_2',
      email: 'edward.wilson@pwioi.com',
      fullName: 'Edward Wilson',
      role: 'student',
      schoolId: 'som',
      batchId: 'som24b1',
      regNumber: 'SOM2024002', 
      phone: '9876543214',
      address: 'Pune, Maharashtra'
    }
  ];

  for (const student of sampleStudents) {
    // Create user document
    await createUserDocument(student.uid, {
      email: student.email,
      displayName: student.fullName,
      role: student.role,
      isActive: true
    });
    
    // Create profile document
    await createProfileDocument(student.uid, student);
  }
};

/**
 * Clear all data (use with caution!)
 */
export const clearAllFirebaseData = async () => {
  console.warn('⚠️  This will delete all Firebase data! Use with caution.');
  // Implementation would go here - for safety, we'll leave this empty
  // You can implement this if needed for development/testing
};

/**
 * Get Firebase data statistics
 */
export const getFirebaseDataStats = async () => {
  try {
    const [schoolsResult, batchesResult, subjectsResult] = await Promise.all([
      academicDataService.getSchools(),
      academicDataService.getBatchesBySchool('sot'),
      academicDataService.getSubjectsBySchool('sot')
    ]);

    return {
      schools: schoolsResult.success ? schoolsResult.data.length : 0,
      batches: batchesResult.success ? batchesResult.data.length : 0,
      subjects: subjectsResult.success ? subjectsResult.data.length : 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get stats:', error);
    return null;
  }
};