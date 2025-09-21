import { API_ENDPOINTS } from './constants';

/**
 * API Response wrapper class
 */
export class ApiResponse {
  constructor(data, error = null, message = '') {
    this.data = data;
    this.error = error;
    this.message = message;
    this.success = !error;
  }

  static success(data, message = '') {
    return new ApiResponse(data, null, message);
  }

  static error(error, message = '') {
    return new ApiResponse(null, error, message);
  }
}

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(message, status = 500, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * HTTP Client configuration
 */
const DEFAULT_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000 // 1 second
};

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after the delay
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create headers with auth token if available
 * @param {object} customHeaders - Custom headers
 * @returns {object} Headers object
 */
const createHeaders = (customHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handle API response
 * @param {Response} response - Fetch response
 * @returns {Promise} Processed response
 */
const handleResponse = async (response) => {
  let data;
  
  try {
    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `HTTP ${response.status}`;
    throw new ApiError(errorMessage, response.status, data?.code);
  }

  return data;
};

/**
 * Make HTTP request with retry logic
 * @param {string} url - Request URL
 * @param {object} options - Request options
 * @param {number} attempt - Current attempt number
 * @returns {Promise} Response data
 */
const makeRequest = async (url, options = {}, attempt = 1) => {
  const config = { ...DEFAULT_CONFIG, ...options };
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(url, {
      ...options,
      headers: createHeaders(options.headers),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return await handleResponse(response);

  } catch (error) {
    // Handle abort/timeout
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408, 'TIMEOUT');
    }

    // Handle network errors
    if (!navigator.onLine) {
      throw new ApiError('Network unavailable', 0, 'NETWORK_ERROR');
    }

    // Retry logic for certain errors
    const shouldRetry = attempt < config.retries && (
      error.status >= 500 || 
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT'
    );

    if (shouldRetry) {
      await sleep(config.retryDelay * attempt);
      return makeRequest(url, options, attempt + 1);
    }

    throw error;
  }
};

/**
 * HTTP Methods
 */
export const api = {
  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Promise<ApiResponse>} API response
   */
  get: async (endpoint, options = {}) => {
    try {
      const data = await makeRequest(endpoint, {
        method: 'GET',
        ...options
      });
      return ApiResponse.success(data);
    } catch (error) {
      return ApiResponse.error(error, error.message);
    }
  },

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {any} body - Request body
   * @param {object} options - Request options
   * @returns {Promise<ApiResponse>} API response
   */
  post: async (endpoint, body = null, options = {}) => {
    try {
      const data = await makeRequest(endpoint, {
        method: 'POST',
        body: body ? JSON.stringify(body) : null,
        ...options
      });
      return ApiResponse.success(data);
    } catch (error) {
      return ApiResponse.error(error, error.message);
    }
  },

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {any} body - Request body
   * @param {object} options - Request options
   * @returns {Promise<ApiResponse>} API response
   */
  put: async (endpoint, body = null, options = {}) => {
    try {
      const data = await makeRequest(endpoint, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : null,
        ...options
      });
      return ApiResponse.success(data);
    } catch (error) {
      return ApiResponse.error(error, error.message);
    }
  },

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Promise<ApiResponse>} API response
   */
  delete: async (endpoint, options = {}) => {
    try {
      const data = await makeRequest(endpoint, {
        method: 'DELETE',
        ...options
      });
      return ApiResponse.success(data);
    } catch (error) {
      return ApiResponse.error(error, error.message);
    }
  },

  /**
   * Upload file
   * @param {string} endpoint - API endpoint
   * @param {File} file - File to upload
   * @param {object} options - Request options
   * @returns {Promise<ApiResponse>} API response
   */
  upload: async (endpoint, file, options = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add additional fields if provided
      if (options.fields) {
        Object.entries(options.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const data = await makeRequest(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
          ...options.headers,
          'Content-Type': undefined
        },
        ...options
      });
      return ApiResponse.success(data);
    } catch (error) {
      return ApiResponse.error(error, error.message);
    }
  }
};

/**
 * Specific API endpoints
 */
export const authApi = {
  /**
   * Login with Google
   * @param {string} idToken - Google ID token
   * @returns {Promise<ApiResponse>} Login response
   */
  login: async (idToken) => {
    return api.post(API_ENDPOINTS.AUTH.LOGIN, { idToken });
  },

  /**
   * Refresh auth token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<ApiResponse>} Token response
   */
  refresh: async (refreshToken) => {
    return api.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
  },

  /**
   * Logout
   * @returns {Promise<ApiResponse>} Logout response
   */
  logout: async () => {
    return api.post(API_ENDPOINTS.AUTH.LOGOUT);
  }
};

export const studentApi = {
  /**
   * Get student profile
   * @returns {Promise<ApiResponse>} Profile data
   */
  getProfile: async () => {
    return api.get(API_ENDPOINTS.STUDENT.PROFILE);
  },

  /**
   * Update student profile
   * @param {object} profileData - Profile data
   * @returns {Promise<ApiResponse>} Update response
   */
  updateProfile: async (profileData) => {
    return api.put(API_ENDPOINTS.STUDENT.PROFILE, profileData);
  },

  /**
   * Upload profile photo
   * @param {File} photo - Profile photo file
   * @returns {Promise<ApiResponse>} Upload response
   */
  uploadProfilePhoto: async (photo) => {
    return api.upload(API_ENDPOINTS.STUDENT.UPLOAD_PHOTO, photo);
  },

  /**
   * Mark attendance via QR
   * @param {object} attendanceData - Attendance data
   * @returns {Promise<ApiResponse>} Attendance response
   */
  markAttendance: async (attendanceData) => {
    return api.post(API_ENDPOINTS.STUDENT.ATTENDANCE, attendanceData);
  },

  /**
   * Get attendance history
   * @param {object} filters - Filter parameters
   * @returns {Promise<ApiResponse>} Attendance history
   */
  getAttendanceHistory: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `${API_ENDPOINTS.STUDENT.ATTENDANCE}?${queryParams}`;
    return api.get(endpoint);
  },

  /**
   * Apply for leave
   * @param {object} leaveData - Leave application data
   * @returns {Promise<ApiResponse>} Leave application response
   */
  applyLeave: async (leaveData) => {
    return api.post(API_ENDPOINTS.STUDENT.LEAVE, leaveData);
  },

  /**
   * Get leave applications
   * @returns {Promise<ApiResponse>} Leave applications
   */
  getLeaveApplications: async () => {
    return api.get(API_ENDPOINTS.STUDENT.LEAVE);
  }
};

export const facultyApi = {
  /**
   * Get faculty profile
   * @returns {Promise<ApiResponse>} Profile data
   */
  getProfile: async () => {
    return api.get(API_ENDPOINTS.FACULTY.PROFILE);
  },

  /**
   * Update faculty profile
   * @param {object} profileData - Profile data
   * @returns {Promise<ApiResponse>} Update response
   */
  updateProfile: async (profileData) => {
    return api.put(API_ENDPOINTS.FACULTY.PROFILE, profileData);
  },

  /**
   * Generate QR code for attendance
   * @param {object} qrData - QR generation data
   * @returns {Promise<ApiResponse>} QR code response
   */
  generateQR: async (qrData) => {
    return api.post(API_ENDPOINTS.FACULTY.QR_GENERATE, qrData);
  },

  /**
   * Mark manual attendance
   * @param {object} attendanceData - Manual attendance data
   * @returns {Promise<ApiResponse>} Attendance response
   */
  markManualAttendance: async (attendanceData) => {
    return api.post(API_ENDPOINTS.FACULTY.MANUAL_ATTENDANCE, attendanceData);
  },

  /**
   * Get attendance reports
   * @param {object} filters - Filter parameters
   * @returns {Promise<ApiResponse>} Attendance reports
   */
  getAttendanceReports: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `${API_ENDPOINTS.FACULTY.REPORTS}?${queryParams}`;
    return api.get(endpoint);
  },

  /**
   * Get students by batch
   * @param {string} school - School name
   * @param {string} batch - Batch name
   * @returns {Promise<ApiResponse>} Students list
   */
  getStudentsByBatch: async (school, batch) => {
    const endpoint = `${API_ENDPOINTS.FACULTY.STUDENTS}?school=${school}&batch=${batch}`;
    return api.get(endpoint);
  },

  /**
   * Process leave applications
   * @param {string} applicationId - Leave application ID
   * @param {string} status - Approval status
   * @param {string} remarks - Optional remarks
   * @returns {Promise<ApiResponse>} Processing response
   */
  processLeaveApplication: async (applicationId, status, remarks = '') => {
    return api.put(`${API_ENDPOINTS.FACULTY.LEAVE}/${applicationId}`, {
      status,
      remarks
    });
  },

  /**
   * Get pending leave applications
   * @returns {Promise<ApiResponse>} Leave applications
   */
  getPendingLeaves: async () => {
    return api.get(`${API_ENDPOINTS.FACULTY.LEAVE}?status=pending`);
  }
};

/**
 * Request interceptor for adding common headers/auth
 */
export const interceptors = {
  request: [],
  response: []
};

/**
 * Add request interceptor
 * @param {Function} interceptor - Interceptor function
 */
export const addRequestInterceptor = (interceptor) => {
  interceptors.request.push(interceptor);
};

/**
 * Add response interceptor
 * @param {Function} interceptor - Interceptor function
 */
export const addResponseInterceptor = (interceptor) => {
  interceptors.response.push(interceptor);
};

/**
 * Network status utilities
 */
export const networkUtils = {
  /**
   * Check if online
   * @returns {boolean} Online status
   */
  isOnline: () => navigator.onLine,

  /**
   * Listen to network status changes
   * @param {Function} callback - Status change callback
   * @returns {Function} Cleanup function
   */
  onNetworkChange: (callback) => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
};

/**
 * Cache utilities for offline support
 */
export const cacheUtils = {
  /**
   * Cache response data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set: (key, data, ttl = 5 * 60 * 1000) => { // 5 minutes default
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(`api_cache_${key}`, JSON.stringify(item));
  },

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null
   */
  get: (key) => {
    try {
      const item = JSON.parse(localStorage.getItem(`api_cache_${key}`));
      if (!item) return null;

      const isExpired = Date.now() - item.timestamp > item.ttl;
      if (isExpired) {
        cacheUtils.delete(key);
        return null;
      }

      return item.data;
    } catch {
      return null;
    }
  },

  /**
   * Delete cached data
   * @param {string} key - Cache key
   */
  delete: (key) => {
    localStorage.removeItem(`api_cache_${key}`);
  },

  /**
   * Clear all cache
   */
  clear: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('api_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

export default api;