/**
 * Validation Middleware
 * Validates request data before processing
 */

// Valid status values for tasks
const VALID_TASK_STATUSES = ['pending', 'in_progress', 'completed'];

// Valid priority values for tasks
const VALID_TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'];

// Valid status values for projects
const VALID_PROJECT_STATUSES = ['active', 'in_progress', 'planning'];

/**
 * Validate task data
 */
const validateTask = (data) => {
  const errors = [];

  // Validate title
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('Task title is required and must be a non-empty string');
  }

  // Validate project_id
  if (!data.project_id || typeof data.project_id !== 'number') {
    errors.push('Project ID is required and must be a number');
  }

  // Validate status if provided
  if (data.status && !VALID_TASK_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${VALID_TASK_STATUSES.join(', ')}`);
  }

  // Validate priority if provided
  if (data.priority && !VALID_TASK_PRIORITIES.includes(data.priority)) {
    errors.push(`Priority must be one of: ${VALID_TASK_PRIORITIES.join(', ')}`);
  }

  // Validate assigned_to if provided
  if (data.assigned_to && typeof data.assigned_to !== 'number') {
    errors.push('Assigned to must be a user ID (number)');
  }

  // Validate due_date if provided
  if (data.due_date && isNaN(Date.parse(data.due_date))) {
    errors.push('Due date must be a valid date');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate project data
 */
const validateProject = (data) => {
  const errors = [];

  // Validate name
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Project name is required and must be a non-empty string');
  }

  // Validate owner_id
  if (!data.owner_id || typeof data.owner_id !== 'number') {
    errors.push('Owner ID is required and must be a number');
  }

  // Validate status if provided
  if (data.status && !VALID_PROJECT_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${VALID_PROJECT_STATUSES.join(', ')}`);
  }

  // Validate start_date if provided
  if (data.start_date && isNaN(Date.parse(data.start_date))) {
    errors.push('Start date must be a valid date');
  }

  // Validate end_date if provided
  if (data.end_date && isNaN(Date.parse(data.end_date))) {
    errors.push('End date must be a valid date');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate user data
 */
const validateUser = (data) => {
  const errors = [];

  // Validate username
  if (!data.username || typeof data.username !== 'string' || !data.username.trim()) {
    errors.push('Username is required and must be a non-empty string');
  }

  // Validate email
  if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
    errors.push('Email is required and must be a non-empty string');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Email must be a valid email address');
  }

  // Validate password_hash
  if (!data.password_hash || typeof data.password_hash !== 'string' || !data.password_hash.trim()) {
    errors.push('Password is required');
  }

  // Validate full_name
  if (!data.full_name || typeof data.full_name !== 'string' || !data.full_name.trim()) {
    errors.push('Full name is required and must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateTask,
  validateProject,
  validateUser,
  VALID_TASK_STATUSES,
  VALID_TASK_PRIORITIES,
  VALID_PROJECT_STATUSES,
};
