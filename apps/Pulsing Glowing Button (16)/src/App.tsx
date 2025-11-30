import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import OrganizationSetup from './components/OrganizationSetup';
import SubscriptionPage from './components/SubscriptionPage';
import MainApp from './components/MainApp';
import { supabase } from './utils/supabase/client';
import { setAccessToken, profileAPI } from './utils/api';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'org-setup' | 'subscription' | 'app'>('landing');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check for demo mode
      const savedDemo = localStorage.getItem('eventbudget_demo');
      if (savedDemo) {
        setIsDemo(true);
        // Set demo organization so all features are visible
        const demoOrg = {
          id: 'demo-org',
          name: 'Demo Organization',
          industry: 'Events',
          size: '1-10',
        };
        setOrganization(demoOrg);
        setCurrentView('app');
        setLoading(false);
        return;
      }

      // Check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        setAccessToken(session.access_token);
        
        // Fetch user profile from backend
        const { profile, organization: org } = await profileAPI.get();
        
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: profile.name || session.user.email?.split('@')[0],
          ...profile,
        });

        if (org) {
          setOrganization(org);
        }

        setCurrentView('app');
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    setIsDemo(true);
    localStorage.setItem('eventbudget_demo', 'true');
    
    // Set demo organization so all features are visible
    const demoOrg = {
      id: 'demo-org',
      name: 'Demo Organization',
      industry: 'Events',
      size: '1-10',
    };
    setOrganization(demoOrg);
    
    setCurrentView('app');
  };

  const handleAuth = async (userData: any, type: 'login' | 'register') => {
    try {
      // Set access token for API calls
      if (userData.accessToken) {
        setAccessToken(userData.accessToken);
      }

      // Fetch full profile from backend
      const { profile, organization: org } = await profileAPI.get();
      
      const fullUser = {
        ...userData,
        ...profile,
      };

      setUser(fullUser);

      if (org) {
        setOrganization(org);
      }

      if (type === 'register' && userData.accountType === 'organization') {
        setCurrentView('org-setup');
      } else if (fullUser.subscription === 'free') {
        setCurrentView('subscription');
      } else {
        setCurrentView('app');
      }
    } catch (error) {
      console.error('Error handling auth:', error);
      setUser(userData);
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAccessToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    
    setUser(null);
    setOrganization(null);
    setIsDemo(false);
    localStorage.removeItem('eventbudget_demo');
    setCurrentView('landing');
  };

  const handleUpgrade = () => {
    setCurrentView('subscription');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
