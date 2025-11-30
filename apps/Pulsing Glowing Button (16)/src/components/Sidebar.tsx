import { LayoutDashboard, Calendar, DollarSign, Receipt, Users, BarChart3, UserCog, LogOut, UserPlus, Sparkles } from './Icons';
import owlLogo from 'figma:asset/b7a364ada17311fe746c2f96585045a6b43c2583.png';

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
    ...(organization ? [{ id: 'users', label: 'Users', icon: UserPlus }] : []),
    ...(organization ? [{ id: 'team', label: 'Team', icon: UserCog }] : []),
    { id: 'advanced', label: 'Advanced Features', icon: Sparkles, highlight: true },
  ];

  const handleMenuClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex-col">
        {/* Header - Fixed */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <img src={owlLogo} alt="Simplifi Logo" className="w-10 h-10" />
            <h1 className="text-blue-600">Simplifi</h1>
          </div>
          {organization && (
            <p className="text-sm text-gray-600 mt-1">{organization.name}</p>
          )}
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <nav className="p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isHighlight = 'highlight' in item && item.highlight;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    activeTab === item.id
                      ? isHighlight
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                        : 'bg-blue-50 text-blue-600'
                      : isHighlight
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 hover:from-purple-100 hover:to-blue-100'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className={isHighlight ? 'font-medium' : ''}>{item.label}</span>
                  {isHighlight && !activeTab.includes('advanced') && (
                    <span className="ml-auto px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">NEW</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer - Fixed at Bottom */}
        <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0 bg-white">
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

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300 flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header - Fixed */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <img src={owlLogo} alt="Simplifi Logo" className="w-10 h-10" />
            <h1 className="text-blue-600">Simplifi</h1>
          </div>
          {organization && (
            <p className="text-sm text-gray-600 mt-1">{organization.name}</p>
          )}
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <nav className="p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isHighlight = 'highlight' in item && item.highlight;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    activeTab === item.id
                      ? isHighlight
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                        : 'bg-blue-50 text-blue-600'
                      : isHighlight
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 hover:from-purple-100 hover:to-blue-100'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className={isHighlight ? 'font-medium' : ''}>{item.label}</span>
                  {isHighlight && !activeTab.includes('advanced') && (
                    <span className="ml-auto px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">NEW</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer - Fixed at Bottom */}
        <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0 bg-white">
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
            onClick={() => {
              onLogout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>{isDemo ? 'Exit Demo' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
