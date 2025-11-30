import React, { createContext, useContext, useState, useEffect } from 'react';

// Role-based access control context and components

type UserRole = 'Admin' | 'EventManager' | 'Finance' | 'Viewer';

interface RBACContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
  canEdit: boolean;
  canApprove: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
}

const RBACContext = createContext<RBACContextType | null>(null);

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) throw new Error('useRBAC must be used within RBACProvider');
  return context;
};

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  Admin: ['*'], // All permissions
  EventManager: ['event:create', 'event:edit', 'event:delete', 'budget:create', 'budget:edit', 'expense:approve', 'vendor:manage'],
  Finance: ['expense:view', 'expense:approve', 'budget:view', 'report:generate'],
  Viewer: ['event:view', 'budget:view', 'expense:view'],
};

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('EventManager');

  const hasPermission = (permission: string): boolean => {
    const permissions = ROLE_PERMISSIONS[userRole];
    return permissions.includes('*') || permissions.includes(permission);
  };

  const canEdit = hasPermission('event:edit') || hasPermission('*');
  const canApprove = hasPermission('expense:approve') || hasPermission('*');
  const canDelete = hasPermission('event:delete') || hasPermission('*');
  const canManageUsers = hasPermission('*');

  return (
    <RBACContext.Provider value={{ userRole, setUserRole, hasPermission, canEdit, canApprove, canDelete, canManageUsers }}>
      {children}
    </RBACContext.Provider>
  );
};

// Role Badge Component
export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const colors = {
    Admin: 'bg-purple-100 text-purple-800',
    EventManager: 'bg-blue-100 text-blue-800',
    Finance: 'bg-green-100 text-green-800',
    Viewer: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${colors[role]}`}>
      {role}
    </span>
  );
};

// Role Selector Component
export const RoleSelector: React.FC = () => {
  const { userRole, setUserRole } = useRBAC();

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gray-600">Current Role:</label>
      <select
        value={userRole}
        onChange={(e) => setUserRole(e.target.value as UserRole)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="Admin">Admin</option>
        <option value="EventManager">Event Manager</option>
        <option value="Finance">Finance</option>
        <option value="Viewer">Viewer</option>
      </select>
    </div>
  );
};

// Protected Component Wrapper
export const ProtectedAction: React.FC<{ permission: string; children: React.ReactNode; fallback?: React.ReactNode }> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { hasPermission } = useRBAC();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
