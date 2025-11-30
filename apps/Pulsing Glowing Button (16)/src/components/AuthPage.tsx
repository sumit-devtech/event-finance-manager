import { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Building2 } from './Icons';
import { supabase } from '../utils/supabase/client';
import { setAccessToken, profileAPI } from '../utils/api';
import owlLogo from 'figma:asset/b7a364ada17311fe746c2f96585045a6b43c2583.png';
import loginIllustration from 'figma:asset/0992497ae3e4e12eb1a506d07c7db2cf5296b86d.png';

interface AuthPageProps {
  onAuth: (userData: any, type: 'login' | 'register') => void;
  onBack: () => void;
}

export default function AuthPage({ onAuth, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState<'individual' | 'organization'>('individual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;

        if (data.session) {
          setAccessToken(data.session.access_token);
          
          const userData = {
            id: data.user.id,
            email: data.user.email,
            name: formData.name || data.user.email?.split('@')[0],
            accessToken: data.session.access_token,
          };

          onAuth(userData, 'login');
        }
      } else {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              accountType,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          setAccessToken(data.session.access_token);

          // Create user profile in backend
          await profileAPI.update({
            name: formData.name,
            accountType,
            subscription: 'free',
            freeEventsRemaining: 1,
          });

          const userData = {
            id: data.user.id,
            email: data.user.email,
            name: formData.name,
            role: accountType === 'organization' ? 'org_admin' : 'individual',
            accountType,
            subscription: 'free',
            freeEventsRemaining: 1,
            accessToken: data.session.access_token,
          };

          onAuth(userData, 'register');
        } else {
          setError('Please check your email to confirm your account');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'individual',
      accountType: 'individual',
      subscription: 'free',
      createdAt: new Date().toISOString(),
      freeEventsRemaining: 1,
    };
    onAuth(demoUser, 'login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 md:mb-6 transition-colors text-sm md:text-base"
        >
          <ArrowLeft size={18} className="md:w-5 md:h-5" />
          <span>Back to home</span>
        </button>

        {/* Auth Card */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Left Side - Illustration */}
            <div className="hidden lg:block bg-gradient-to-br from-purple-600 to-blue-600 p-12 relative">
              <div className="flex items-center gap-3 mb-8">
                <img src={owlLogo} alt="Simplifi Logo" className="w-12 h-12" />
                <h2 className="text-white text-2xl">Simplifi</h2>
              </div>
              <h3 className="text-white text-3xl mb-4">Welcome to Simplifi</h3>
              <p className="text-white/90 text-lg mb-8">Built for the teams behind great events.</p>
              <div className="flex justify-center items-center h-64">
                <img src={loginIllustration} alt="Simplifi Illustration" className="w-64 h-auto object-contain" />
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-6 md:p-8 lg:p-12">
              <div className="lg:hidden text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <img src={owlLogo} alt="Simplifi Logo" className="w-10 h-10" />
                  <h2 className="text-blue-600 text-2xl">Simplifi</h2>
                </div>
              </div>
              <div className="text-center mb-6 md:mb-8">
                <h3 className="mb-2 text-lg md:text-xl">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  {isLogin ? 'Sign in to your account' : 'Get started with your free trial'}
                </p>
              </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Account Type Selection (Register Only) */}
          {!isLogin && (
            <div className="mb-4 md:mb-6">
              <label className="block text-gray-700 mb-2 md:mb-3 text-sm md:text-base">Account Type</label>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={() => setAccountType('individual')}
                  className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                    accountType === 'individual'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <User size={20} className={`mx-auto mb-1 md:mb-2 md:w-6 md:h-6 ${accountType === 'individual' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="text-xs md:text-sm">Individual</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('organization')}
                  className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                    accountType === 'organization'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Building2 size={20} className={`mx-auto mb-1 md:mb-2 md:w-6 md:h-6 ${accountType === 'organization' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="text-xs md:text-sm">Organization</p>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-gray-700 mb-1.5 md:mb-2 text-sm md:text-base">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 md:w-5 md:h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-1.5 md:mb-2 text-sm md:text-base">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 md:w-5 md:h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1.5 md:mb-2 text-sm md:text-base">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 md:w-5 md:h-5" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-gray-700 mb-1.5 md:mb-2 text-sm md:text-base">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 md:w-5 md:h-5" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4 md:my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-xs md:text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Demo Button */}
          <button
            onClick={handleDemoLogin}
            className="w-full py-2.5 md:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors text-sm md:text-base"
          >
            Continue with Demo Account
          </button>

          {/* Toggle Auth Mode */}
          <div className="text-center mt-4 md:mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 transition-colors text-sm md:text-base"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {!isLogin && (
            <p className="text-xs text-gray-500 text-center mt-3 md:mt-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
