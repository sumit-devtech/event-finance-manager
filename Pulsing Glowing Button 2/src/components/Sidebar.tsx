import { LayoutDashboard, Calendar, DollarSign, Receipt, Users, BarChart3, UserCog, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  user: any;
  organization: any;
  isDemo: boolean;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, user, organization, isDemo, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'budgets', label: 'Budgets', icon: DollarSign },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ...(organization ? [{ id: 'team', label: 'Team', icon: UserCog }] : []),
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 w-64 z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:top-0
      `}
    >
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-blue-600">EventBudget Pro</h1>
      </div>

      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1
                transition-colors duration-200
                ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-2">
        {organization && (
          <div className="px-4 py-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Organization</p>
            <p className="text-sm truncate">{organization.name}</p>
          </div>
        )}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
            {isDemo ? 'D' : (user?.name?.[0] || 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate">{isDemo ? 'Demo User' : user?.name}</p>
            <p className="text-gray-500 text-sm truncate">{isDemo ? 'demo@example.com' : user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>{isDemo ? 'Exit Demo' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
}
