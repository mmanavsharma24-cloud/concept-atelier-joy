import { usePermission } from '../../hooks/usePermission';

/**
 * Component to conditionally render based on permissions
 * Usage: <PermissionGuard resource="projects" action="create">
 *          <button>Create Project</button>
 *        </PermissionGuard>
 */
export const PermissionGuard = ({ 
  resource, 
  action, 
  children, 
  fallback = null,
  requireAll = false,
  permissions = []
}) => {
  const { can, canAll, canAny } = usePermission();

  let hasAccess = false;

  if (permissions.length > 0) {
    // Check multiple permissions
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  } else if (resource && action) {
    // Check single permission
    hasAccess = can(resource, action);
  }

  return hasAccess ? children : fallback;
};

export default PermissionGuard;
