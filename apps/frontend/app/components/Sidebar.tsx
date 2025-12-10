import { Link, useLocation, Form } from "@remix-run/react";
import { LayoutDashboard, Calendar, DollarSign, Receipt, Users, BarChart3, UserCog, LogOut, Store, Bell } from 'lucide-react';
import type { User } from "~/lib/auth";
import logoImage from '~/assets/owl-logo.png';

interface SidebarProps {
  user: User | null;
  organization?: any;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isDemo?: boolean;
}

export function Sidebar({ user, organization, isMobileMenuOpen, setIsMobileMenuOpen, isDemo = false }: SidebarProps) {
  const location = useLocation();
  
  // Debug: Log user role to help troubleshoot
  if (typeof window !== 'undefined') {
    console.log('[Sidebar] User:', user);
    console.log('[Sidebar] User role:', user?.role);
    console.log('[Sidebar] Is Admin?', user?.role === 'Admin' || user?.role === 'admin');
  }
  
  // Role-based menu item visibility
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin' || isDemo;
  const isEventManager = user?.role === 'EventManager' || isDemo;
  const isFinance = user?.role === 'Finance' || isDemo;
  const isViewer = user?.role === 'Viewer' && !isDemo;

  // Base menu items - filtered by role
  const baseMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['Admin', 'EventManager', 'Finance', 'Viewer'] },
    { id: 'events', label: 'Events', icon: Calendar, href: '/events', roles: ['Admin', 'EventManager', 'Finance', 'Viewer'] },
    // Budget Planning - not available to Viewers
    ...(!isViewer ? [{ id: 'budgets', label: 'Budget Planning', icon: DollarSign, href: '/budget', roles: ['Admin', 'EventManager', 'Finance'] }] : []),
    // Expenses - not available to Viewers
    ...(!isViewer ? [{ id: 'expenses', label: 'Expenses & Approvals', icon: Receipt, href: '/expenses', roles: ['Admin', 'EventManager', 'Finance'] }] : []),
    // Vendors - Admin, EventManager, Finance only
    ...((isAdmin || isEventManager || isFinance) ? [{ id: 'vendors', label: 'Vendors', icon: Store, href: '/vendors', roles: ['Admin', 'EventManager', 'Finance'] }] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/notifications', roles: ['Admin', 'EventManager', 'Finance', 'Viewer'] },
    // Analytics - Admin, EventManager, Finance only
    ...((isAdmin || isEventManager || isFinance) ? [{ id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics', roles: ['Admin', 'EventManager', 'Finance'] }] : []),
    // Reports - Admin, EventManager, Finance only
    ...((isAdmin || isEventManager || isFinance) ? [{ id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports', roles: ['Admin', 'EventManager', 'Finance'] }] : []),
    // Users - Admin only
    ...(isAdmin ? [{ id: 'users', label: 'Users', icon: UserCog, href: '/users', roles: ['Admin'] }] : []),
    // Team - Admin only (if organization exists)
    ...(isAdmin && organization && !isDemo ? [{ id: 'team', label: 'Team', icon: UserCog, href: '/team', roles: ['Admin'] }] : []),
  ];

  // Append ?demo=true to all routes if in demo mode
  const menuItems = baseMenuItems.map(item => ({
    ...item,
    href: isDemo ? `${item.href}${item.href.includes('?') ? '&' : '?'}demo=true` : item.href
  }));

  const isActive = (href: string) => {
    // Remove query params for comparison
    const comparePath = href.split('?')[0];
    const currentPath = location.pathname;
    
    if (comparePath === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(comparePath);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-[#E2E2E2] w-[240px] z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:top-0
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-[#E2E2E2]">
            <Link to={isDemo ? "/dashboard?demo=true" : "/dashboard"} onClick={handleLinkClick} className="flex items-center gap-3">
              <img src={logoImage} alt="Simplifi Logo" className="w-10 h-10" />
              <h1 className="text-[#1A1A1A] font-bold text-xl">Simplifi</h1>
            </Link>
            {organization && (
              <p className="text-sm text-[#5E5E5E] mt-1">{organization.name}</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={handleLinkClick}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-[6px] mb-1
                    transition-colors duration-200
                    ${
                      active
                    ? 'bg-[#F3F3F6] text-[#672AFA] font-medium'
                    : 'text-[#5E5E5E] hover:bg-[#F3F3F6]'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#E2E2E2] space-y-2">
            {organization && (
              <div className="px-4 py-2 bg-[#F9F9FC] rounded-[6px]">
                <p className="text-xs text-[#5E5E5E]">Organization</p>
                <p className="text-sm truncate text-[#1A1A1A]">{organization.name}</p>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 bg-[#672AFA] rounded-full flex items-center justify-center text-white text-sm font-medium">
                {isDemo ? 'D' : (user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-[#1A1A1A]">{isDemo ? 'Demo User' : (user?.name || user?.email?.split('@')[0] || 'User')}</p>
                <p className="text-[#5E5E5E] text-xs truncate">{isDemo ? 'demo@example.com' : (user?.email || '')}</p>
              </div>
            </div>
            {isDemo ? (
              <Link
                to="/"
                className="w-full flex items-center gap-2 px-4 py-2 text-[#FF751F] hover:bg-[#FF751F]/10 rounded-[6px] transition-colors text-sm"
              >
                <LogOut size={18} />
                <span>Exit Demo</span>
              </Link>
            ) : (
              <Form action="/logout" method="post">
                <button
                  type="submit"
                    className="w-full flex items-center gap-2 px-4 py-2 text-[#5E5E5E] hover:bg-[#F3F3F6] rounded-[6px] transition-colors text-sm"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </Form>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

