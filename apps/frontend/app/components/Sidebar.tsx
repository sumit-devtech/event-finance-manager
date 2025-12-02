import { Link, useLocation, Form } from "@remix-run/react";
import { LayoutDashboard, Calendar, DollarSign, Receipt, Users, BarChart3, UserCog, LogOut, Store } from 'lucide-react';
import { CheckCircle } from './Icons';
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
  
  // Base menu items - append ?demo=true if in demo mode
  const baseMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'events', label: 'Events', icon: Calendar, href: '/events' },
    { id: 'budgets', label: 'Budgets', icon: DollarSign, href: '/budget' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, href: '/expenses' },
    { id: 'vendors', label: 'Vendors', icon: Store, href: '/vendors' },
    // Show Approvals for Admin and EventManager
    ...(user && (user.role === 'Admin' || user.role === 'admin' || user.role === 'EventManager' || isDemo)
      ? [{ id: 'approvals', label: 'Approvals', icon: CheckCircle, href: '/approvals' }]
      : []),
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports' },
    // Show Users menu for Admin users (check both 'Admin' and 'admin' case variations)
    // Also show in demo mode for testing
    ...(user && (user.role === 'Admin' || user.role === 'admin' || isDemo) ? [{ id: 'users', label: 'Users', icon: UserCog, href: '/users' }] : []),
    ...(organization && !isDemo ? [{ id: 'team', label: 'Team', icon: UserCog, href: '/team' }] : []),
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
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 w-64 z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:top-0
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-gray-200">
            <Link to={isDemo ? "/dashboard?demo=true" : "/dashboard"} onClick={handleLinkClick} className="flex items-center gap-3">
              <img src={logoImage} alt="Simplifi Logo" className="w-10 h-10" />
              <h1 className="text-blue-600 font-bold text-xl" style={{ color: '#002640' }}>Simplifi</h1>
            </Link>
            {organization && (
              <p className="text-sm text-gray-600 mt-1">{organization.name}</p>
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
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1
                    transition-colors duration-200
                    ${
                      active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {organization && (
              <div className="px-4 py-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Organization</p>
                <p className="text-sm truncate">{organization.name}</p>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                {isDemo ? 'D' : (user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{isDemo ? 'Demo User' : (user?.name || user?.email?.split('@')[0] || 'User')}</p>
                <p className="text-gray-500 text-xs truncate">{isDemo ? 'demo@example.com' : (user?.email || '')}</p>
              </div>
            </div>
            {isDemo ? (
              <Link
                to="/"
                className="w-full flex items-center gap-2 px-4 py-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Exit Demo</span>
              </Link>
            ) : (
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

