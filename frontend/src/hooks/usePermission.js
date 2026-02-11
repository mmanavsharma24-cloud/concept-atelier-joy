import { useAuth } from './useAuth';
import { hasPermission, hasAllPermissions, hasAnyPermission } from '../utils/permissions';

/**
 * Custom hook for checking permissions
 * Usage: const { can } = usePermission();
 *        if (can('projects', 'create')) { ... }
 */
export const usePermission = () => {
  const { user } = useAuth();
  const userRole = user?.role;

  return {
    /**
     * Check single permission
     */
    can: (resource, action) => {
      return hasPermission(userRole, resource, action);
    },

    /**
     * Check all permissions
     */
    canAll: (permissions) => {
      return hasAllPermissions(userRole, permissions);
    },

    /**
     * Check any permission
     */
    canAny: (permissions) => {
      return hasAnyPermission(userRole, permissions);
    },

    /**
     * Check if user is admin
     */
    isAdmin: () => userRole === 'admin',

    /**
     * Check if user is manager
     */
    isManager: () => userRole === 'manager',

    /**
     * Check if user is regular user
     */
    isUser: () => userRole === 'user',

    /**
     * Get user role
     */
    role: userRole,
  };
};
