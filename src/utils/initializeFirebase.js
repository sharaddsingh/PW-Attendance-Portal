/**
 * Firebase Database Initialization Script
 * 
 * This script initializes the Firebase database with essential data
 * including schools, batches, subjects, and system configuration.
 * 
 * Run this script once after setting up a new Firebase project.
 */

import { 
  db, 
  setDoc, 
  doc, 
  collection, 
  getDocs,
  Timestamp 
} from '../services/firebase';

// Import data files
import academicData from '../../firebase-data/academic-data.json';
import systemConfig from '../../firebase-data/system-config.json';

/**
 * Check if a collection exists and has data
 */
const collectionExists = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return !snapshot.empty;
  } catch (error) {
    console.error(`Error checking ${collectionName}:`, error);
    return false;
  }
};

/**
 * Initialize Schools Collection
 */
const initializeSchools = async () => {
  console.log('Initializing schools...');
  
  for (const school of academicData.schools) {
    try {
      await setDoc(doc(db, 'schools', school.id), {
        ...school,
        createdAt: Timestamp.fromDate(new Date(school.createdAt))
      });
      console.log(`✅ Added school: ${school.name}`);
    } catch (error) {
      console.error(`❌ Error adding school ${school.name}:`, error);
    }
  }
};

/**
 * Initialize Batches Collection
 */
const initializeBatches = async () => {
  console.log('Initializing batches...');
  
  for (const batch of academicData.batches) {
    try {
      await setDoc(doc(db, 'batches', batch.id), {
        ...batch,
        createdAt: Timestamp.fromDate(new Date(batch.createdAt))
      });
      console.log(`✅ Added batch: ${batch.name}`);
    } catch (error) {
      console.error(`❌ Error adding batch ${batch.name}:`, error);
    }
  }
};

/**
 * Initialize Subjects Collection
 */
const initializeSubjects = async () => {
  console.log('Initializing subjects...');
  
  for (const subject of academicData.subjects) {
    try {
      await setDoc(doc(db, 'subjects', subject.id), {
        ...subject,
        createdAt: Timestamp.fromDate(new Date(subject.createdAt))
      });
      console.log(`✅ Added subject: ${subject.name}`);
    } catch (error) {
      console.error(`❌ Error adding subject ${subject.name}:`, error);
    }
  }
};

/**
 * Initialize System Configuration
 */
const initializeSystemConfig = async () => {
  console.log('Initializing system configuration...');
  
  try {
    const config = systemConfig.system_config;
    await setDoc(doc(db, 'system_config', 'config'), {
      ...config,
      holidays: config.holidays.map(date => new Date(date)),
      semesterStartDate: new Date(config.semesterStartDate),
      semesterEndDate: new Date(config.semesterEndDate),
      updatedAt: Timestamp.fromDate(new Date(config.updatedAt))
    });
    console.log('✅ System configuration initialized');
  } catch (error) {
    console.error('❌ Error initializing system config:', error);
  }
};

/**
 * Create Sample Users (Optional - for testing)
 */
const createSampleUsers = async () => {
  console.log('Creating sample users...');
  
  // Sample Faculty
  const sampleFaculty = {
    uid: 'sample-faculty-001',
    email: 'faculty.demo@gmail.com',
    displayName: 'Demo Faculty',
    role: 'faculty',
    profileComplete: false,
    createdAt: Timestamp.now(),
    isActive: true
  };
  
  // Sample Student
  const sampleStudent = {
    uid: 'sample-student-001',
    email: 'student.demo@pwioi.com',
    displayName: 'Demo Student',
    role: 'student',
    profileComplete: false,
    createdAt: Timestamp.now(),
    isActive: true
  };
  
  try {
    await setDoc(doc(db, 'users', sampleFaculty.uid), sampleFaculty);
    console.log('✅ Created sample faculty user');
    
    await setDoc(doc(db, 'users', sampleStudent.uid), sampleStudent);
    console.log('✅ Created sample student user');
  } catch (error) {
    console.error('❌ Error creating sample users:', error);
  }
};

/**
 * Main Initialization Function
 */
export const initializeFirebaseDatabase = async (options = {}) => {
  const {
    skipIfExists = true,
    includeSampleUsers = false
  } = options;
  
  console.log('🚀 Starting Firebase Database Initialization...');
  console.log('==================================================');
  
  try {
    // Check if data already exists
    if (skipIfExists) {
      const schoolsExist = await collectionExists('schools');
      if (schoolsExist) {
        console.log('⚠️ Database already initialized. Skipping...');
        return {
          success: true,
          message: 'Database already contains data',
          skipped: true
        };
      }
    }
    
    // Initialize collections in order
    await initializeSchools();
    await initializeBatches();
    await initializeSubjects();
    await initializeSystemConfig();
    
    // Optional: Create sample users
    if (includeSampleUsers) {
      await createSampleUsers();
    }
    
    console.log('==================================================');
    console.log('✅ Firebase Database Initialization Complete!');
    
    return {
      success: true,
      message: 'Database initialized successfully',
      collections: ['schools', 'batches', 'subjects', 'system_config']
    };
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Reset Database (Dangerous - Use with caution!)
 */
export const resetDatabase = async () => {
  console.warn('⚠️ WARNING: This will delete all data!');
  // Implementation would go here if needed
  // Should include proper authentication checks
};

/**
 * Verify Database Setup
 */
export const verifyDatabaseSetup = async () => {
  console.log('🔍 Verifying database setup...');
  
  const collections = ['schools', 'batches', 'subjects', 'system_config'];
  const results = {};
  
  for (const collectionName of collections) {
    const exists = await collectionExists(collectionName);
    results[collectionName] = exists;
    console.log(`${exists ? '✅' : '❌'} ${collectionName}: ${exists ? 'OK' : 'Missing'}`);
  }
  
  const allOk = Object.values(results).every(v => v === true);
  
  return {
    success: allOk,
    collections: results,
    message: allOk ? 'All collections verified' : 'Some collections are missing'
  };
};

// Export for use in components or admin panel
export default {
  initializeFirebaseDatabase,
  verifyDatabaseSetup,
  resetDatabase
};