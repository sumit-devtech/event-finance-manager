import { useState } from 'react';
import { Menu, X, Crown } from './Icons';
import Dashboard from './DashboardConnected';
import EventsList from './EventsListConnected';
import BudgetManager from './BudgetManager';
import ExpenseTracker from './ExpenseTracker';
import VendorManager from './VendorManager';
import Analytics from './Analytics';
import TeamManagement from './TeamManagement';
import UsersManagerConnected from './UsersManagerConnected';
import Sidebar from './Sidebar';
import ConnectionStatus from './ConnectionStatus';
import { AdvancedFeaturesDemo } from './AdvancedFeaturesDemo';
import { RBACProvider } from './RoleBasedAccess';
import owlLogo from 'figma:asset/b7a364ada17311fe746c2f96585045a6b43c2583.png';

interface MainAppProps {
  user: any;
  organization: any;
  isDemo: boolean;
  onLogout: () => void;
  onUpgrade: () => void;
}

export default function MainApp({ user, organization, isDemo, onLogout, onUpgrade }: MainAppProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isFreeUser = user?.subscription === 'free' || isDemo;
  const showUpgradeBanner = isFreeUser && !isDemo;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} organization={organization} isDemo={isDemo} />;
      case 'events':
        return <EventsList user={user} organization={organization} isDemo={isDemo} onUpgrade={onUpgrade} />;
      case 'budgets':
        return <BudgetManager user={user} organization={organization} isDemo={isDemo} />;
      case 'expenses':
        return <ExpenseTracker user={user} organization={organization} isDemo={isDemo} />;
      case 'vendors':
        return <VendorManager user={user} organization={organization} isDemo={isDemo} />;
      case 'analytics':
        return <Analytics user={user} organization={organization} isDemo={isDemo} />;
      case 'team':
        return <TeamManagement user={user} organization={organization} onUpgrade={onUpgrade} />;
      case 'users':
        return <UsersManagerConnected user={user} organization={organization} isDemo={isDemo} />;
      case 'advanced':
        return <AdvancedFeaturesDemo user={user} organization={organization} isDemo={isDemo} onUpgrade={onUpgrade} />;
      default:
        return <Dashboard user={user} organization={organization} isDemo={isDemo} />;
    }
  };

  return (
    <RBACProvider>
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="lg:ml-64 bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center">
          <p className="text-xs md:text-sm text-yellow-800">
            <strong>Demo Mode:</strong> You're viewing demo data. Changes won't be saved.
            <button onClick={onLogout} className="ml-2 md:ml-4 text-yellow-900 underline hover:no-underline">
              Exit Demo
            </button>
          </p>
        </div>
      )}

      {/* Upgrade Banner */}
      {showUpgradeBanner && (
        <div className="lg:ml-64 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <Crown size={18} className="flex-shrink-0 md:w-5 md:h-5" />
              <p className="text-sm md:text-base">
                <strong>Free Trial:</strong> {user?.freeEventsRemaining || 0} event(s) remaining
              </p>
            </div>
            <button
              onClick={onUpgrade}
              className="w-full sm:w-auto px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base whitespace-nowrap"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src={owlLogo} alt="Simplifi Logo" className="w-8 h-8" />
          <div>
            <h1 className="text-blue-600">Simplifi</h1>
            {organization && (
              <p className="text-sm text-gray-600">{organization.name}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        user={user}
        organization={organization}
        isDemo={isDemo}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="lg:ml-64">
        <div className="p-4 md:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Connection Status Indicator */}
      {!isDemo && <ConnectionStatus />}
    </div>
    </RBACProvider>
  );
}
