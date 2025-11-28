import { useState } from 'react';
import { Menu, X, Crown, AlertCircle } from 'lucide-react';
import Dashboard from './Dashboard';
import EventsList from './EventsList';
import BudgetManager from './BudgetManager';
import ExpenseTracker from './ExpenseTracker';
import VendorManager from './VendorManager';
import Analytics from './Analytics';
import TeamManagement from './TeamManagement';
import Sidebar from './Sidebar';

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
      default:
        return <Dashboard user={user} organization={organization} isDemo={isDemo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center">
          <p className="text-yellow-800">
            <strong>Demo Mode:</strong> You're viewing demo data. Changes won't be saved.
            <button onClick={onLogout} className="ml-4 text-yellow-900 underline hover:no-underline">
              Exit Demo
            </button>
          </p>
        </div>
      )}

      {/* Upgrade Banner */}
      {showUpgradeBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown size={20} />
              <p>
                <strong>Free Trial:</strong> {user?.freeEventsRemaining || 0} event(s) remaining
              </p>
            </div>
            <button
              onClick={onUpgrade}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h1 className="text-blue-600">EventBudget Pro</h1>
          {organization && (
            <p className="text-sm text-gray-600">{organization.name}</p>
          )}
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
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
        <main className="flex-1 lg:ml-64">
          <div className="p-4 md:p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
