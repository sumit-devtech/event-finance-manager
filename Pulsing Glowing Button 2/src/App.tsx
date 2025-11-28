import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import OrganizationSetup from './components/OrganizationSetup';
import SubscriptionPage from './components/SubscriptionPage';
import MainApp from './components/MainApp';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'org-setup' | 'subscription' | 'app'>('landing');

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('eventbudget_user');
    const savedOrg = localStorage.getItem('eventbudget_org');
    const savedDemo = localStorage.getItem('eventbudget_demo');

    if (savedDemo) {
      setIsDemo(true);
      setCurrentView('app');
    } else if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      if (savedOrg) {
        setOrganization(JSON.parse(savedOrg));
        setCurrentView('app');
      } else if (parsedUser.role === 'org_admin') {
        setCurrentView('org-setup');
      } else {
        setCurrentView('app');
      }
    }
  }, []);

  const handleDemoMode = () => {
    setIsDemo(true);
    localStorage.setItem('eventbudget_demo', 'true');
    setCurrentView('app');
  };

  const handleAuth = (userData: any, type: 'login' | 'register') => {
    setUser(userData);
    localStorage.setItem('eventbudget_user', JSON.stringify(userData));

    if (type === 'register' && userData.accountType === 'organization') {
      setCurrentView('org-setup');
    } else if (userData.subscription === 'free') {
      setCurrentView('subscription');
    } else {
      setCurrentView('app');
    }
  };

  const handleOrgSetup = (orgData: any) => {
    setOrganization(orgData);
    localStorage.setItem('eventbudget_org', JSON.stringify(orgData));
    
    if (user?.subscription === 'free') {
      setCurrentView('subscription');
    } else {
      setCurrentView('app');
    }
  };

  const handleSubscriptionComplete = () => {
    setCurrentView('app');
  };

  const handleLogout = () => {
    setUser(null);
    setOrganization(null);
    setIsDemo(false);
    localStorage.removeItem('eventbudget_user');
    localStorage.removeItem('eventbudget_org');
    localStorage.removeItem('eventbudget_demo');
    setCurrentView('landing');
  };

  const handleUpgrade = () => {
    setCurrentView('subscription');
  };

  if (currentView === 'landing') {
    return (
      <LandingPage
        onDemoMode={handleDemoMode}
        onGetStarted={() => setCurrentView('auth')}
      />
    );
  }

  if (currentView === 'auth') {
    return (
      <AuthPage
        onAuth={handleAuth}
        onBack={() => setCurrentView('landing')}
      />
    );
  }

  if (currentView === 'org-setup') {
    return (
      <OrganizationSetup
        user={user}
        onComplete={handleOrgSetup}
        onSkip={() => setCurrentView('app')}
      />
    );
  }

  if (currentView === 'subscription') {
    return (
      <SubscriptionPage
        user={user}
        organization={organization}
        onComplete={handleSubscriptionComplete}
        onSkip={() => setCurrentView('app')}
      />
    );
  }

  return (
    <MainApp
      user={user}
      organization={organization}
      isDemo={isDemo}
      onLogout={handleLogout}
      onUpgrade={handleUpgrade}
    />
  );
}
