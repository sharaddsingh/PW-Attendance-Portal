/**
 * Firebase Service Configuration
 *
 * This module handles all Firebase-related operations for the PW Attendance Portal.
 * It provides a centralized service layer for authentication, database operations,
 * file storage, and analytics.
 *
 * Key Features:
 * - Firebase Authentication (Google OAuth)
 * - Firestore database operations
 * - Firebase Storage for file uploads
 * - Firebase Analytics
 * - User and profile management
 * - Attendance session management
 * - Academic data management
 *
 * @author PW Attendance Portal Team
 * @version 1.0.0
 */

import { initializeApp, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

/**
 * Firebase Configuration
 *
 * Production Firebase project configuration for PW Attendance Portal.
 * These credentials connect to the main Firebase project instance.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDxfX7g9a9H-skqP10z-aj-JPI4-9-8078",
  authDomain: "pw-attendance-portal.firebaseapp.com",
  projectId: "pw-attendance-portal",
  storageBucket: "pw-attendance-portal.firebasestorage.app",
  messagingSenderId: "205349770163",
  appId: "1:205349770163:web:d792a6a75aaa77e92b71c6",
  measurementId: "G-Y1NJV2C6DX",
};

/**
 * Initialize Firebase App
 *
 * Initializes the Firebase app instance with error handling for duplicate initialization.
 * This ensures the app is only initialized once across the entire application.
 */
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // If app already exists, get the existing one
  if (error.code === "app/duplicate-app") {
    app = getApp();
  } else {
    throw error;
  }
}

/**
 * Firebase Service Instances
 *
 * Export configured Firebase service instances for use throughout the application.
 */
export const auth = getAuth(app); // Authentication service
export const db = getFirestore(app); // Firestore database
export const storage = getStorage(app); // Cloud Storage
export const analytics = getAnalytics(app); // Analytics service

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Firebase Auth Functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    if (error.code === "auth/popup-blocked") {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { success: true, redirect: true };
      } catch (redirectError) {
        return { success: false, error: "Popup blocked and redirect failed" };
      }
    }
    return { success: false, error: error.message };
  }
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return { success: true, user: result.user };
    }
    return { success: false, error: "No redirect result" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Firestore Helper Functions
export const createUserDocument = async (uid, userData) => {
  try {
    await setDoc(doc(db, "users", uid), {
      ...userData,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserDocument = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: "User document not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserDocument = async (uid, updateData) => {
  try {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, updateData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createProfileDocument = async (uid, profileData) => {
  try {
    await setDoc(doc(db, "profiles", uid), {
      ...profileData,
      createdAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getProfileDocument = async (uid) => {
  try {
    const docRef = doc(db, "profiles", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: "Profile not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Storage Helper Functions
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Attendance Functions
export const createAttendanceSession = async (sessionData) => {
  try {
    const docRef = await addDoc(collection(db, "attendance_sessions"), {
      ...sessionData,
      createdAt: new Date(),
      isActive: true,
      qrCodeGenerated: true,
      studentsPresent: [],
      totalStudents: 0,
    });
    return { success: true, sessionId: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const markAttendance = async (attendanceData) => {
  try {
    // Add attendance record
    await addDoc(collection(db, "attendance"), {
      ...attendanceData,
      timestamp: new Date(),
      markedAt: new Date().toISOString(),
      deviceInfo: navigator.userAgent,
    });

    // Update attendance session with student info
    if (attendanceData.sessionId) {
      const sessionRef = doc(
        db,
        "attendance_sessions",
        attendanceData.sessionId,
      );
      const sessionDoc = await getDoc(sessionRef);

      if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data();
        const studentsPresent = sessionData.studentsPresent || [];

        // Add student if not already present
        if (
          !studentsPresent.some((s) => s.studentId === attendanceData.studentId)
        ) {
          studentsPresent.push({
            studentId: attendanceData.studentId,
            studentName: attendanceData.studentName,
            markedAt: new Date(),
            photoUrl: attendanceData.photoUrl,
          });

          await updateDoc(sessionRef, {
            studentsPresent,
            totalPresent: studentsPresent.length,
            lastUpdated: new Date(),
          });
        }
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// QR Code Management
export const saveQRCodeToStorage = async (qrCodeDataUrl, sessionId) => {
  try {
    // Convert data URL to blob
    const response = await fetch(qrCodeDataUrl);
    const blob = await response.blob();

    // Upload to Firebase Storage
    const qrPath = `qr_codes/${sessionId}_${Date.now()}.png`;
    const uploadResult = await uploadFile(blob, qrPath);

    if (uploadResult.success) {
      // Update session document with QR code URL
      const sessionRef = doc(db, "attendance_sessions", sessionId);
      await updateDoc(sessionRef, {
        qrCodeUrl: uploadResult.url,
        qrCodePath: qrPath,
        qrCodeGenerated: true,
      });

      return { success: true, url: uploadResult.url };
    }

    return { success: false, error: "Failed to upload QR code" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get Active Sessions
export const getActiveSessions = async (facultyId) => {
  try {
    const sessionsRef = collection(db, "attendance_sessions");
    const q = query(
      sessionsRef,
      where("facultyId", "==", facultyId),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const sessions = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const now = new Date();
      const expiresAt =
        data.expiresAt?.toDate() ||
        new Date(data.createdAt.toDate().getTime() + 30000);

      // Check if session is still active
      if (expiresAt > now) {
        sessions.push({ id: doc.id, ...data });
      } else {
        // Auto-expire old sessions
        updateDoc(doc.ref, { isActive: false });
      }
    });

    return { success: true, data: sessions };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get Session Details
export const getSessionDetails = async (sessionId) => {
  try {
    const sessionRef = doc(db, "attendance_sessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (sessionDoc.exists()) {
      return {
        success: true,
        data: { id: sessionDoc.id, ...sessionDoc.data() },
      };
    } else {
      return { success: false, error: "Session not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Deactivate Session
export const deactivateSession = async (sessionId) => {
  try {
    const sessionRef = doc(db, "attendance_sessions", sessionId);
    await updateDoc(sessionRef, {
      isActive: false,
      deactivatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Validation Functions
export const validateEmailRole = (email, role) => {
  const studentRegex = /@pwioi\.com$/i;
  const facultyRegex = /@gmail\.com$/i;

  if (role === "student") {
    return studentRegex.test(email);
  } else if (role === "faculty") {
    return facultyRegex.test(email);
  }
  return false;
};

// Mobile Detection
export const isMobileDevice = () => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) || window.innerWidth <= 768
  );
};

// Device ID Generation
export const generateDeviceId = () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "top";
  ctx.font = "14px Arial";
  ctx.fillText("Device fingerprint", 2, 2);

  const fingerprint =
    canvas.toDataURL() + navigator.userAgent + screen.width + screen.height;

  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString();
};

export const provider = new GoogleAuthProvider();

// School and Academic Data Management
export const academicDataService = {
  /**
   * Get all available schools
   * @returns {Promise<object>} Schools data
   */
  getSchools: async () => {
    try {
      const schoolsRef = collection(db, "schools");
      const snapshot = await getDocs(schoolsRef);
      const schools = [];
      snapshot.forEach((doc) => {
        schools.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: schools };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get batches for a specific school
   * @param {string} schoolId - School identifier
   * @returns {Promise<object>} Batches data
   */
  getBatchesBySchool: async (schoolId) => {
    try {
      const batchesRef = collection(db, "batches");
      const q = query(batchesRef, where("schoolId", "==", schoolId));
      const snapshot = await getDocs(q);
      const batches = [];
      snapshot.forEach((doc) => {
        batches.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: batches };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get subjects for a specific school
   * @param {string} schoolId - School identifier
   * @returns {Promise<object>} Subjects data
   */
  getSubjectsBySchool: async (schoolId) => {
    try {
      const subjectsRef = collection(db, "subjects");
      const q = query(subjectsRef, where("schoolId", "==", schoolId));
      const snapshot = await getDocs(q);
      const subjects = [];
      snapshot.forEach((doc) => {
        subjects.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: subjects };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get students by school and batch
   * @param {string} schoolId - School identifier
   * @param {string} batchId - Batch identifier
   * @returns {Promise<object>} Students data
   */
  getStudentsByBatch: async (schoolId, batchId) => {
    try {
      const studentsRef = collection(db, "profiles");
      const q = query(
        studentsRef,
        where("role", "==", "student"),
        where("schoolId", "==", schoolId),
        where("batchId", "==", batchId),
      );
      const snapshot = await getDocs(q);
      const students = [];
      snapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: students };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Add a new school
   */
  addSchool: async (schoolData) => {
    try {
      await setDoc(doc(db, "schools", schoolData.id), {
        ...schoolData,
        createdAt: new Date(),
        isActive: true,
      });
      return { success: true, message: "School added successfully" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Add a new batch
   */
  addBatch: async (batchData) => {
    try {
      await setDoc(doc(db, "batches", batchData.id), {
        ...batchData,
        createdAt: new Date(),
        isActive: true,
      });
      return { success: true, message: "Batch added successfully" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Add a new subject
   */
  addSubject: async (subjectData) => {
    try {
      await setDoc(doc(db, "subjects", subjectData.id), {
        ...subjectData,
        createdAt: new Date(),
        isActive: true,
      });
      return { success: true, message: "Subject added successfully" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Get faculty subjects (subjects they can teach)
   */
  getFacultySubjects: async (facultyId) => {
    try {
      const profileRef = doc(db, "profiles", facultyId);
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        const facultySubjects = profileData.subjects || [];

        // Get full subject details
        const subjectsData = [];
        for (const subjectId of facultySubjects) {
          const subjectRef = doc(db, "subjects", subjectId);
          const subjectDoc = await getDoc(subjectRef);
          if (subjectDoc.exists()) {
            subjectsData.push({ id: subjectDoc.id, ...subjectDoc.data() });
          }
        }

        return { success: true, data: subjectsData };
      }

      return { success: false, error: "Faculty profile not found" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Initialize default schools and batches data
   */
  initializeAcademicData: async () => {
    try {
      // Create Schools
      const schools = [
        {
          id: "sot",
          name: "School of Technology",
          shortName: "SOT",
          description: "Technology and Computer Science Programs",
        },
        {
          id: "som",
          name: "School of Management",
          shortName: "SOM",
          description: "Business and Management Programs",
        },
      ];

      // Create Batches
      const batches = [
        {
          id: "sot24b1",
          name: "SOT 2024 Batch 1",
          schoolId: "sot",
          year: 2024,
          semester: 1,
        },
        {
          id: "sot24b2",
          name: "SOT 2024 Batch 2",
          schoolId: "sot",
          year: 2024,
          semester: 2,
        },
        {
          id: "sot23b1",
          name: "SOT 2023 Batch 1",
          schoolId: "sot",
          year: 2023,
          semester: 1,
        },
        {
          id: "som23b1",
          name: "SOM 2023 Batch 1",
          schoolId: "som",
          year: 2023,
          semester: 1,
        },
        {
          id: "som24b1",
          name: "SOM 2024 Batch 1",
          schoolId: "som",
          year: 2024,
          semester: 1,
        },
      ];

      // Create Subjects
      const subjects = [
        // SOT Subjects
        { id: "java", name: "Java", schoolId: "sot", code: "CS101" },
        { id: "python-sot", name: "Python", schoolId: "sot", code: "CS102" },
        { id: "database", name: "Database", schoolId: "sot", code: "CS201" },
        {
          id: "javascript",
          name: "JavaScript",
          schoolId: "sot",
          code: "CS301",
        },
        { id: "sql", name: "SQL", schoolId: "sot", code: "CS202" },

        // SOM Subjects
        { id: "economics", name: "Economics", schoolId: "som", code: "MG101" },
        { id: "python-som", name: "Python", schoolId: "som", code: "MG201" },
      ];

      // Add schools to Firebase
      for (const school of schools) {
        await setDoc(doc(db, "schools", school.id), school);
      }

      // Add batches to Firebase
      for (const batch of batches) {
        await setDoc(doc(db, "batches", batch.id), batch);
      }

      // Add subjects to Firebase
      for (const subject of subjects) {
        await setDoc(doc(db, "subjects", subject.id), subject);
      }

      return {
        success: true,
        message: "Academic data initialized successfully",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
