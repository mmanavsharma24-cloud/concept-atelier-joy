/**
 * Centralized API Service
 * All API calls go through this service for consistency and error handling
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api';

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, status, originalError) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.originalError = originalError;
  }
}

/**
 * Get user-friendly error message based on error type
 */
const getErrorMessage = (error, endpoint) => {
  // Network error
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Network error: Unable to connect to server. Please check your internet connection.';
  }

  // API error with status code
  if (error instanceof APIError) {
    switch (error.status) {
      case 400:
        return 'Bad request: Please check your input and try again.';
      case 404:
        return 'Not found: The requested resource does not exist.';
      case 500:
        return 'Server error: Something went wrong on the server. Please try again later.';
      case 503:
        return 'Service unavailable: The server is temporarily down. Please try again later.';
      default:
        return `Error: ${error.message}`;
    }
  }

  // Generic error
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Helper function for API requests with comprehensive error handling
 */
const apiCall = async (endpoint, options = {}) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // Response is not JSON
      }

      const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new APIError(errorMessage, response.status, new Error(errorMessage));
    }

    return await response.json();
  } catch (error) {
    // Log error for debugging
    console.error(`API Call Failed: ${endpoint}`, error);

    // Re-throw with user-friendly message
    if (error instanceof APIError) {
      throw error;
    }

    // Wrap other errors
    throw new APIError(
      getErrorMessage(error, endpoint),
      error.status || 500,
      error
    );
  }
};

// ============ USERS API ============
export const userService = {
  getAll: () => apiCall('/users'),
  getById: (id) => apiCall(`/users/${id}`),
  create: (data) => apiCall('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/users/${id}`, { method: 'DELETE' }),
};

// ============ PROJECTS API ============
export const projectService = {
  getAll: () => apiCall('/projects'),
  getUserAnalytics: () => apiCall('/projects/user/analytics'),
  getById: (id) => apiCall(`/projects/${id}`),
  getProjectTasks: (projectId) => apiCall(`/projects/${projectId}/tasks`),
  create: (data) => apiCall('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/projects/${id}`, { method: 'DELETE' }),
  createTask: (data) => apiCall('/tasks', { method: 'POST', body: JSON.stringify(data) }),
};

// ============ TASKS API ============
export const taskService = {
  getAll: () => apiCall('/tasks'),
  getUserAnalytics: () => apiCall('/tasks/user/analytics'),
  getById: (id) => apiCall(`/tasks/${id}`),
  getByProject: (projectId) => apiCall(`/tasks/project/${projectId}`),
  create: (data) => apiCall('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/tasks/${id}`, { method: 'DELETE' }),
};

// ============ SUBTASKS API ============
export const subtaskService = {
  getAll: (parentTaskId) => apiCall(`/tasks/${parentTaskId}/subtasks`),
  getProgress: (parentTaskId) => apiCall(`/tasks/${parentTaskId}/subtasks/progress`),
  create: (parentTaskId, data) => apiCall(`/tasks/${parentTaskId}/subtasks`, { method: 'POST', body: JSON.stringify(data) }),
  update: (parentTaskId, subtaskId, data) => apiCall(`/tasks/${parentTaskId}/subtasks/${subtaskId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (parentTaskId, subtaskId) => apiCall(`/tasks/${parentTaskId}/subtasks/${subtaskId}`, { method: 'DELETE' }),
};

// ============ COMMENTS API ============
export const commentService = {
  getByTask: (taskId) => apiCall(`/comments/task/${taskId}`),
  add: (taskId, data) => apiCall(`/comments/task/${taskId}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (commentId, data) => apiCall(`/comments/${commentId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (commentId) => apiCall(`/comments/${commentId}`, { method: 'DELETE' }),
};

// ============ ACTIVITY API ============
export const activityService = {
  getByTask: (taskId) => apiCall(`/activity/task/${taskId}`),
};

// ============ NOTIFICATIONS API ============
export const notificationService = {
  getAll: (type = 'all', priority = 'all') => {
    let query = '';
    if (type !== 'all') {
      query += `type=${type}`;
    }
    if (priority !== 'all') {
      query += (query ? '&' : '') + `priority=${priority}`;
    }
    
    if (query) {
      return apiCall(`/notifications?${query}`);
    }
    return apiCall('/notifications');
  },
  getArchived: () => apiCall('/notifications/archived/list'),
  getUnreadCount: () => apiCall('/notifications/unread/count'),
  markAsRead: (id) => apiCall(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () => apiCall('/notifications/read/all', { method: 'PUT' }),
  archive: (id) => apiCall(`/notifications/${id}/archive`, { method: 'PUT' }),
  restore: (id) => apiCall(`/notifications/${id}/restore`, { method: 'PUT' }),
  clearAll: () => apiCall('/notifications/clear/all', { method: 'PUT' }),
};

// ============ ATTACHMENTS API ============
export const attachmentService = {
  getByProject: (projectId) => apiCall(`/attachments/project/${projectId}`),
  getByTask: (taskId) => apiCall(`/attachments/task/${taskId}`),
  upload: (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}/attachments/task/${taskId}`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    });
  },
  uploadProject: (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}/attachments/project/${projectId}`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    });
  },
  download: (attachmentId) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found');
      return;
    }

    // Use fetch to download with proper headers
    fetch(`${API_BASE_URL}/attachments/${attachmentId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      return response.blob().then(blob => ({ blob, filename }));
    })
    .then(({ blob, filename }) => {
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Download error:', error);
      alert('Failed to download attachment');
    });
  },
  delete: (attachmentId) => apiCall(`/attachments/${attachmentId}`, { method: 'DELETE' }),
};

// ============ LEGACY EXPORTS (for backward compatibility) ============
// These will be deprecated - use services above instead
export const getUsers = () => userService.getAll();
export const getUserById = (id) => userService.getById(id);
export const getProjects = () => projectService.getAll();
export const getProjectById = (id) => projectService.getById(id);
export const createProject = (data) => projectService.create(data);
export const updateProject = (id, data) => projectService.update(id, data);
export const deleteProject = (id) => projectService.delete(id);
export const getTasks = () => taskService.getAll();
export const getTasksByProject = (projectId) => taskService.getByProject(projectId);
export const getTaskById = (id) => taskService.getById(id);
export const createTask = (data) => taskService.create(data);
export const updateTask = (id, data) => taskService.update(id, data);
export const deleteTask = (id) => taskService.delete(id);
