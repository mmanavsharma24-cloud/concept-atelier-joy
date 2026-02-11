/**
 * Frontend Permission Utilities
 * Mirror of backend permissions for UI control
 */

const PERMISSIONS = {
  admin: {
    projects: ['create', 'read', 'update', 'delete', 'manage_members'],
    tasks: ['create', 'read', 'update', 'delete', 'assign'],
    users: ['create', 'read', 'update', 'delete', 'change_role'],
    analytics: ['view_all'],
    comments: ['create', 'read', 'update', 'delete'],
  },
  manager: {
    projects: ['create', 'read', 'update', 'manage_members'],
    tasks: ['create', 'read', 'update', 'assign'],
    users: ['read'],
    analytics: ['view_team'],
    comments: ['create', 'read', 'update', 'delete'],
  },
  user: {
    projects: ['read'],
    tasks: ['read', 'update_status'],
    users: [],
    analytics: ['view_own'],
    comments: ['create', 'read', 'update_own', 'delete_own'],
  },
};

/**
 * Check if user has permission
 */
export const hasPermission = (userRole, resource, action) => {
  if (!userRole || !PERMISSIONS[userRole]) {
    return false;
  }

  const resourcePermissions = PERMISSIONS[userRole][resource];
  return resourcePermissions && resourcePermissions.includes(action);
};

/**
 * Check if user can perform multiple actions
 */
export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(({ resource, action }) =>
    hasPermission(userRole, resource, action)
  );
};

/**
 * Check if user has any of the permissions
 */
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(({ resource, action }) =>
    hasPermission(userRole, resource, action)
  );
};

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    admin: 'Administrator',
    manager: 'Manager',
    user: 'Team Member',
  };
  return roleNames[role] || role;
};

/**
 * Get role badge color
 */
export const getRoleBadgeColor = (role) => {
  const colors = {
    admin: '#e74c3c',
    manager: '#f39c12',
    user: '#3498db',
  };
  return colors[role] || '#95a5a6';
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role) => {
  return PERMISSIONS[role] || {};
};
