/**
 * Role-Based Permission Middleware
 * Defines what each role can do
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
    users: ['read'],
    analytics: ['view_own'],
    comments: ['create', 'read', 'update_own', 'delete_own'],
  },
};

/**
 * Check if user has permission for an action
 */
const hasPermission = (userRole, resource, action) => {
  if (!PERMISSIONS[userRole]) {
    return false;
  }

  const resourcePermissions = PERMISSIONS[userRole][resource];
  return resourcePermissions && resourcePermissions.includes(action);
};

/**
 * Middleware to check permissions
 */
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ error: 'User role not found' });
    }

    if (!hasPermission(userRole, resource, action)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: `${resource}:${action}`,
        userRole
      });
    }

    next();
  };
};

module.exports = {
  PERMISSIONS,
  hasPermission,
  checkPermission,
};
