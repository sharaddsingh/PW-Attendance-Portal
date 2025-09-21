import { 
  EMAIL_DOMAINS, 
  FILE_UPLOAD, 
  ATTENDANCE_THRESHOLDS,
  TIME_FORMATS,
  DEVICE_TYPES 
} from './constants';

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (optional)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'default') => {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const options = {
    default: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    },
    long: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    },
    time: { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    },
    datetime: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }
  };
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.default);
};

/**
 * Format time to readable string
 * @param {Date|string} time - Time to format
 * @returns {string} Formatted time string
 */
export const formatTime = (time) => {
  if (!time) return 'N/A';
  
  const timeObj = time instanceof Date ? time : new Date(time);
  
  if (isNaN(timeObj.getTime())) return 'Invalid Time';
  
  return timeObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return 'Unknown';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is email valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate email domain for role
 * @param {string} email - Email to validate
 * @param {string} role - User role (student/faculty)
 * @returns {boolean} Is email domain valid for role
 */
export const validateEmailDomain = (email, role) => {
  if (!email || !role) return false;
  
  const domain = role === 'student' ? EMAIL_DOMAINS.STUDENT : EMAIL_DOMAINS.FACULTY;
  return email.toLowerCase().endsWith(domain.toLowerCase());
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is phone number valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {string} type - File type category ('images' or 'documents')
 * @returns {object} Validation result
 */
export const validateFileUpload = (file, type = 'images') => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  // Check file size
  if (file.size > FILE_UPLOAD.MAX_SIZE) {
    return { 
      isValid: false, 
      error: `File size exceeds ${formatFileSize(FILE_UPLOAD.MAX_SIZE)} limit` 
    };
  }
  
  // Check file type
  const allowedTypes = type === 'images' ? FILE_UPLOAD.ALLOWED_TYPES.IMAGES : FILE_UPLOAD.ALLOWED_TYPES.DOCUMENTS;
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Invalid file type. Allowed: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}` 
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Format file size to readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Detect device type
 * @returns {string} Device type (mobile/tablet/desktop)
 */
export const detectDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || (window.innerWidth >= 768 && window.innerWidth <= 1024);
  
  if (isMobile) return DEVICE_TYPES.MOBILE;
  if (isTablet) return DEVICE_TYPES.TABLET;
  return DEVICE_TYPES.DESKTOP;
};

/**
 * Check if device is mobile
 * @returns {boolean} Is mobile device
 */
export const isMobileDevice = () => {
  return detectDeviceType() === DEVICE_TYPES.MOBILE || window.innerWidth <= 768;
};

/**
 * Generate device fingerprint
 * @returns {string} Device fingerprint
 */
export const generateDeviceFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = [
    canvas.toDataURL(),
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString();
};

/**
 * Calculate attendance percentage
 * @param {number} present - Number of present days
 * @param {number} total - Total number of days
 * @returns {number} Attendance percentage
 */
export const calculateAttendancePercentage = (present, total) => {
  if (total === 0) return 0;
  return Math.round((present / total) * 100 * 100) / 100; // Round to 2 decimal places
};

/**
 * Get attendance status based on percentage
 * @param {number} percentage - Attendance percentage
 * @returns {object} Status object with color and label
 */
export const getAttendanceStatus = (percentage) => {
  if (percentage >= ATTENDANCE_THRESHOLDS.EXCELLENT) {
    return { color: 'green', label: 'Excellent', bgColor: 'bg-green-100', textColor: 'text-green-600' };
  }
  if (percentage >= ATTENDANCE_THRESHOLDS.GOOD) {
    return { color: 'blue', label: 'Good', bgColor: 'bg-blue-100', textColor: 'text-blue-600' };
  }
  if (percentage >= ATTENDANCE_THRESHOLDS.SATISFACTORY) {
    return { color: 'yellow', label: 'Satisfactory', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' };
  }
  if (percentage >= ATTENDANCE_THRESHOLDS.POOR) {
    return { color: 'orange', label: 'Poor', bgColor: 'bg-orange-100', textColor: 'text-orange-600' };
  }
  return { color: 'red', label: 'Critical', bgColor: 'bg-red-100', textColor: 'text-red-600' };
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Generate random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID
 */
export const generateRandomId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Failed to copy text: ', error);
    return false;
  }
};

/**
 * Download data as file
 * @param {string|Blob} data - Data to download
 * @param {string} filename - File name
 * @param {string} type - MIME type
 */
export const downloadFile = (data, filename, type = 'text/plain') => {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Convert data to CSV format
 * @param {Array} data - Array of objects
 * @param {Array} headers - Column headers (optional)
 * @returns {string} CSV string
 */
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';
  
  const csvHeaders = headers || Object.keys(data[0]);
  const csvRows = data.map(row => 
    csvHeaders.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(',')
  );
  
  return [csvHeaders.join(','), ...csvRows].join('\n');
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Get contrast color for background
 * @param {string} backgroundColor - Background color in hex
 * @returns {string} Contrast color (white or black)
 */
export const getContrastColor = (backgroundColor) => {
  if (!backgroundColor) return '#000000';
  
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export default {
  formatDate,
  formatTime,
  getRelativeTime,
  isValidEmail,
  validateEmailDomain,
  isValidPhone,
  validateFileUpload,
  formatFileSize,
  detectDeviceType,
  isMobileDevice,
  generateDeviceFingerprint,
  calculateAttendancePercentage,
  getAttendanceStatus,
  debounce,
  throttle,
  generateRandomId,
  copyToClipboard,
  downloadFile,
  convertToCSV,
  getInitials,
  capitalizeWords,
  truncateText,
  getContrastColor
};