import { EMAIL_DOMAINS, FILE_UPLOAD } from './constants';
import { isValidEmail, isValidPhone, validateFileUpload } from './helpers';

/**
 * Validation rule types
 */
export const VALIDATION_RULES = {
  REQUIRED: 'required',
  EMAIL: 'email',
  PHONE: 'phone',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  PATTERN: 'pattern',
  CUSTOM: 'custom',
  FILE: 'file',
  EMAIL_DOMAIN: 'emailDomain'
};

/**
 * Create a validation rule
 * @param {string} type - Rule type
 * @param {any} value - Rule value (optional)
 * @param {string} message - Error message (optional)
 * @returns {object} Validation rule
 */
export const createRule = (type, value = null, message = null) => ({
  type,
  value,
  message
});

/**
 * Common validation rules
 */
export const commonRules = {
  required: (message = 'This field is required') => 
    createRule(VALIDATION_RULES.REQUIRED, null, message),
  
  email: (message = 'Please enter a valid email address') => 
    createRule(VALIDATION_RULES.EMAIL, null, message),
  
  phone: (message = 'Please enter a valid phone number') => 
    createRule(VALIDATION_RULES.PHONE, null, message),
  
  minLength: (length, message = `Must be at least ${length} characters`) => 
    createRule(VALIDATION_RULES.MIN_LENGTH, length, message),
  
  maxLength: (length, message = `Must not exceed ${length} characters`) => 
    createRule(VALIDATION_RULES.MAX_LENGTH, length, message),
  
  pattern: (regex, message = 'Invalid format') => 
    createRule(VALIDATION_RULES.PATTERN, regex, message),
  
  file: (type = 'images', message = 'Invalid file') => 
    createRule(VALIDATION_RULES.FILE, type, message),
  
  emailDomain: (role, message = 'Invalid email domain for this role') => 
    createRule(VALIDATION_RULES.EMAIL_DOMAIN, role, message),
  
  custom: (validator, message = 'Validation failed') => 
    createRule(VALIDATION_RULES.CUSTOM, validator, message)
};

/**
 * Validate a single field
 * @param {any} value - Field value
 * @param {Array} rules - Array of validation rules
 * @returns {object} Validation result
 */
export const validateField = (value, rules = []) => {
  const errors = [];
  
  for (const rule of rules) {
    const error = validateRule(value, rule);
    if (error) {
      errors.push(error);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    error: errors[0] || null // Return first error
  };
};

/**
 * Validate a single rule
 * @param {any} value - Value to validate
 * @param {object} rule - Validation rule
 * @returns {string|null} Error message or null
 */
export const validateRule = (value, rule) => {
  const { type, value: ruleValue, message } = rule;
  
  switch (type) {
    case VALIDATION_RULES.REQUIRED:
      if (!value || (typeof value === 'string' && !value.trim())) {
        return message;
      }
      break;
      
    case VALIDATION_RULES.EMAIL:
      if (value && !isValidEmail(value)) {
        return message;
      }
      break;
      
    case VALIDATION_RULES.PHONE:
      if (value && !isValidPhone(value)) {
        return message;
      }
      break;
      
    case VALIDATION_RULES.MIN_LENGTH:
      if (value && value.length < ruleValue) {
        return message;
      }
      break;
      
    case VALIDATION_RULES.MAX_LENGTH:
      if (value && value.length > ruleValue) {
        return message;
      }
      break;
      
    case VALIDATION_RULES.PATTERN:
      if (value && !ruleValue.test(value)) {
        return message;
      }
      break;
      
    case VALIDATION_RULES.FILE:
      if (value) {
        const fileValidation = validateFileUpload(value, ruleValue);
        if (!fileValidation.isValid) {
          return fileValidation.error;
        }
      }
      break;
      
    case VALIDATION_RULES.EMAIL_DOMAIN:
      if (value) {
        const domain = ruleValue === 'student' ? EMAIL_DOMAINS.STUDENT : EMAIL_DOMAINS.FACULTY;
        if (!value.toLowerCase().endsWith(domain.toLowerCase())) {
          return message;
        }
      }
      break;
      
    case VALIDATION_RULES.CUSTOM:
      if (value && typeof ruleValue === 'function') {
        const customResult = ruleValue(value);
        if (customResult !== true) {
          return typeof customResult === 'string' ? customResult : message;
        }
      }
      break;
      
    default:
      console.warn(`Unknown validation rule type: ${type}`);
  }
  
  return null;
};

/**
 * Validate multiple fields (form validation)
 * @param {object} data - Form data object
 * @param {object} schema - Validation schema
 * @returns {object} Validation result
 */
export const validateForm = (data, schema) => {
  const errors = {};
  let isValid = true;
  
  // Validate each field in the schema
  for (const [fieldName, rules] of Object.entries(schema)) {
    const fieldValue = data[fieldName];
    const fieldResult = validateField(fieldValue, rules);
    
    if (!fieldResult.isValid) {
      errors[fieldName] = fieldResult.error;
      isValid = false;
    }
  }
  
  return {
    isValid,
    errors,
    hasErrors: Object.keys(errors).length > 0
  };
};

/**
 * Predefined validation schemas
 */
export const validationSchemas = {
  // Login validation
  login: {
    role: [commonRules.required('Please select your role')]
  },
  
  // Student profile validation
  studentProfile: {
    fullName: [
      commonRules.required('Full name is required'),
      commonRules.minLength(2, 'Name must be at least 2 characters'),
      commonRules.maxLength(50, 'Name must not exceed 50 characters')
    ],
    regNumber: [
      commonRules.required('Registration number is required'),
      commonRules.pattern(/^[A-Z]{2,4}\d{2}\d{3}$/, 'Invalid registration number format')
    ],
    school: [commonRules.required('School selection is required')],
    batch: [commonRules.required('Batch selection is required')],
    phone: [
      commonRules.required('Phone number is required'),
      commonRules.phone()
    ],
    profilePhoto: [commonRules.required('Profile photo is required')]
  },
  
  // Faculty profile validation
  facultyProfile: {
    fullName: [
      commonRules.required('Full name is required'),
      commonRules.minLength(2, 'Name must be at least 2 characters'),
      commonRules.maxLength(50, 'Name must not exceed 50 characters')
    ],
    employeeId: [
      commonRules.required('Employee ID is required'),
      commonRules.pattern(/^[A-Z]{2,4}\d{4}$/, 'Invalid employee ID format')
    ],
    departments: [
      commonRules.custom(
        (value) => value && value.length > 0,
        'Please select at least one department'
      )
    ],
    subjects: [
      commonRules.custom(
        (value) => value && value.length > 0,
        'Please select at least one subject'
      )
    ],
    phone: [
      commonRules.required('Phone number is required'),
      commonRules.phone()
    ]
  },
  
  // Leave application validation
  leaveApplication: {
    date: [commonRules.required('Leave date is required')],
    periods: [
      commonRules.required('Number of periods is required'),
      commonRules.pattern(/^[1-6]$/, 'Periods must be between 1 and 6')
    ],
    subject: [commonRules.required('Subject is required')],
    reason: [
      commonRules.required('Reason is required'),
      commonRules.minLength(10, 'Reason must be at least 10 characters'),
      commonRules.maxLength(500, 'Reason must not exceed 500 characters')
    ]
  },
  
  // QR generation validation
  qrGeneration: {
    school: [commonRules.required('School is required')],
    batch: [commonRules.required('Batch is required')],
    subject: [commonRules.required('Subject is required')],
    periods: [
      commonRules.required('Number of periods is required'),
      commonRules.pattern(/^[1-6]$/, 'Periods must be between 1 and 6')
    ]
  },
  
  // Manual attendance validation
  manualAttendance: {
    school: [commonRules.required('School is required')],
    batch: [commonRules.required('Batch is required')],
    subject: [commonRules.required('Subject is required')],
    periods: [
      commonRules.required('Number of periods is required'),
      commonRules.pattern(/^[1-6]$/, 'Periods must be between 1 and 6')
    ]
  }
};

/**
 * Real-time field validation hook helper
 * @param {any} value - Field value
 * @param {Array} rules - Validation rules
 * @param {number} debounceMs - Debounce time in milliseconds
 * @returns {object} Validation state
 */
export const useFieldValidation = (value, rules, debounceMs = 300) => {
  const [validationState, setValidationState] = useState({
    isValid: true,
    error: null,
    isValidating: false
  });
  
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  // Debounce the value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [value, debounceMs]);
  
  // Validate when debounced value changes
  useEffect(() => {
    if (debouncedValue !== undefined) {
      setValidationState(prev => ({ ...prev, isValidating: true }));
      
      const result = validateField(debouncedValue, rules);
      
      setTimeout(() => {
        setValidationState({
          isValid: result.isValid,
          error: result.error,
          isValidating: false
        });
      }, 50); // Small delay to show validation feedback
    }
  }, [debouncedValue, rules]);
  
  return validationState;
};

/**
 * Form validation hook helper
 * @param {object} initialData - Initial form data
 * @param {object} schema - Validation schema
 * @returns {object} Form validation utilities
 */
export const useFormValidation = (initialData, schema) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const validate = (dataToValidate = data) => {
    const result = validateForm(dataToValidate, schema);
    setErrors(result.errors);
    return result;
  };
  
  const validateField = (fieldName, value = data[fieldName]) => {
    const fieldRules = schema[fieldName] || [];
    const result = validateField(value, fieldRules);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.error
    }));
    
    return result;
  };
  
  const updateField = (fieldName, value) => {
    setData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Validate field if it has been touched
    if (touched[fieldName]) {
      validateField(fieldName, value);
    }
  };
  
  const touchField = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
    
    // Validate field when touched
    validateField(fieldName);
  };
  
  const reset = () => {
    setData(initialData);
    setErrors({});
    setTouched({});
  };
  
  const isFieldValid = (fieldName) => {
    return !errors[fieldName];
  };
  
  const isFormValid = () => {
    const result = validate();
    return result.isValid;
  };
  
  return {
    data,
    errors,
    touched,
    validate,
    validateField,
    updateField,
    touchField,
    reset,
    isFieldValid,
    isFormValid,
    hasErrors: Object.keys(errors).length > 0,
    setData,
    setErrors
  };
};

export default {
  VALIDATION_RULES,
  createRule,
  commonRules,
  validateField,
  validateRule,
  validateForm,
  validationSchemas,
  useFieldValidation,
  useFormValidation
};