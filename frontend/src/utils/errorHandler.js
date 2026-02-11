/**
 * Error Handler Utility
 * Provides consistent error handling across the application
 */

/**
 * Handle API errors and show user-friendly messages
 */
export const handleAPIError = (error, defaultMessage = 'An error occurred') => {
  let message = defaultMessage;
  let status = 500;

  if (error.name === 'APIError') {
    message = error.message;
    status = error.status;
  } else if (error instanceof TypeError) {
    message = 'Network error: Unable to connect to server';
    status = 0;
  } else if (error.message) {
    message = error.message;
  }

  console.error('Error:', { message, status, error });
  return { message, status };
};

/**
 * Show error notification to user
 */
export const showError = (message) => {
  // Using alert for now - can be replaced with toast notifications later
  alert(`❌ Error: ${message}`);
};

/**
 * Show success notification to user
 */
export const showSuccess = (message) => {
  // Using alert for now - can be replaced with toast notifications later
  alert(`✅ ${message}`);
};

/**
 * Validate form data before submission
 */
export const validateFormData = (data, requiredFields) => {
  const errors = {};

  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors[field] = `${field} is required`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
