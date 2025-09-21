import { academicDataService } from '../services/firebase';

/**
 * Initialize academic data in Firebase
 * This should be run once to set up schools, batches, and subjects
 */
export const initializeAcademicData = async () => {
  try {
    console.log('Initializing academic data...');
    const result = await academicDataService.initializeAcademicData();
    
    if (result.success) {
      console.log('Academic data initialized successfully!');
      return { success: true, message: 'Academic data initialized successfully' };
    } else {
      console.error('Failed to initialize academic data:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error initializing academic data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if academic data exists
 */
export const checkAcademicData = async () => {
  try {
    const schoolsResult = await academicDataService.getSchools();
    return {
      exists: schoolsResult.success && schoolsResult.data.length > 0,
      schoolCount: schoolsResult.success ? schoolsResult.data.length : 0
    };
  } catch (error) {
    console.error('Error checking academic data:', error);
    return { exists: false, schoolCount: 0 };
  }
};