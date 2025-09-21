/**
 * Firebase Connection Test Utility
 * 
 * This utility helps diagnose Firebase connectivity issues
 */

import { auth, db, storage } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase Connection...');
  
  try {
    // Test Firebase Auth
    console.log('🔐 Testing Firebase Auth...');
    console.log('Auth current user:', auth.currentUser);
    console.log('Auth app:', auth.app);
    
    // Test Firestore
    console.log('💾 Testing Firestore...');
    console.log('Database app:', db.app);
    
    // Try to read from a collection
    try {
      const testCollection = collection(db, 'test');
      const snapshot = await getDocs(testCollection);
      console.log('✅ Firestore connection successful, docs:', snapshot.size);
    } catch (firestoreError) {
      console.error('❌ Firestore error:', firestoreError);
    }
    
    // Test Storage
    console.log('☁️ Testing Firebase Storage...');
    console.log('Storage app:', storage.app);
    console.log('Storage bucket:', storage.app.options.storageBucket);
    
    console.log('🎉 Firebase connection test completed!');
    
    return { success: true };
    
  } catch (error) {
    console.error('💥 Firebase connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Quick auth check
export const checkAuthStatus = () => {
  console.log('👤 Current Auth Status:');
  console.log('User:', auth.currentUser);
  console.log('Is signed in:', !!auth.currentUser);
  if (auth.currentUser) {
    console.log('User ID:', auth.currentUser.uid);
    console.log('User email:', auth.currentUser.email);
    console.log('Display name:', auth.currentUser.displayName);
  }
};