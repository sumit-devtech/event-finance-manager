import { useState, useEffect } from 'react';
import { Form, Link, useSearchParams } from '@remix-run/react';
import { ArrowLeft, Mail, Lock, User, Building2 } from 'lucide-react';
import logoImage from '~/assets/logo.png';
import illustrationImage from '~/assets/illustration.png';

interface AuthPageProps {
  actionData?: { error?: string };
}

export function AuthPage({ actionData }: AuthPageProps = {}) {
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState<'individual' | 'organization'>('individual');
  const [error, setError] = useState('');

  // Update error from server response
  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error);
    } else {
      setError(''); // Clear error when no error in response
    }
  }, [actionData]);

  // Clear error when switching between login/register
  useEffect(() => {
    setError('');
  }, [isLogin]);

  // Handle demo login
  if (isDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-5xl w-full">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 md:mb-6 transition-colors text-sm md:text-base"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
            <span>Back to home</span>
          </button>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="hidden lg:block bg-gradient-to-br from-purple-600 to-blue-600 p-12 relative">
                <div className="flex items-center gap-3 mb-8">
                  <img src={logoImage} alt="EventBudget Pro Logo" className="w-12 h-12" />
                  <h2 className="text-white text-2xl">EventBudget Pro</h2>
                </div>
                <h3 className="text-white text-3xl mb-4">Welcome to EventBudget Pro</h3>
                <p className="text-white/90 text-lg mb-8">Built for the teams behind great events.</p>
                <div className="flex justify-center items-center h-64">
                  <img
                    src={illustrationImage}
                    alt="EventBudget Pro Illustration"
                    className="w-64 h-auto object-contain"
                  />
                </div>
              </div>
              <div className="p-6 md:p-8 lg:p-12">
                <div className="lg:hidden text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <img src={logoImage} alt="EventBudget Pro Logo" className="w-10 h-10" />
                    <h2 className="text-blue-600 text-2xl">EventBudget Pro</h2>
                  </div>
                </div>
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="mb-2 text-lg md:text-xl font-semibold">Demo Mode</h3>
                  <p className="text-gray-600 text-sm md:text-base">Experience EventBudget Pro with sample data</p>
                </div>
                <Link
                  to="/dashboard?demo=true"
                  className="w-full py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors block text-center text-sm md:text-base mb-4"
                >
                  Enter Demo Mode
                </Link>
                <Link
                  to="/"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors justify-center text-sm md:text-base"
                >
                  <ArrowLeft size={18} className="md:w-5 md:h-5" />
                  <span>Back to home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
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
                <img src={logoImage} alt="EventBudget Pro Logo" className="w-12 h-12" />
                <h2 className="text-white text-2xl">EventBudget Pro</h2>
              </div>
              <h3 className="text-white text-3xl mb-4">Welcome to EventBudget Pro</h3>
              <p className="text-white/90 text-lg mb-8">Built for the teams behind great events.</p>
              <div className="flex justify-center items-center h-64">
                <img
                  src={illustrationImage}
                  alt="EventBudget Pro Illustration"
                  className="w-64 h-auto object-contain"
                />
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-6 md:p-8 lg:p-12">
              <div className="lg:hidden text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <img src={logoImage} alt="EventBudget Pro Logo" className="w-10 h-10" />
                  <h2 className="text-blue-600 text-2xl">EventBudget Pro</h2>
                </div>
              </div>
              <div className="text-center mb-6 md:mb-8">
                <h3 className="mb-2 text-lg md:text-xl font-semibold">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
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
                  <label className="block text-gray-700 mb-2 md:mb-3 text-sm md:text-base font-medium">Account Type</label>
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
                      <User className={`mx-auto mb-1 md:mb-2 md:w-6 md:h-6 ${accountType === 'individual' ? 'text-blue-600' : 'text-gray-400'}`} size={20} />
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
                      <Building2 className={`mx-auto mb-1 md:mb-2 md:w-6 md:h-6 ${accountType === 'organization' ? 'text-blue-600' : 'text-gray-400'}`} size={20} />
                      <p className="text-xs md:text-sm">Organization</p>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
              <Form method="post" action="/login" className="space-y-3 md:space-y-4">
            <input type="hidden" name="intent" value={isLogin ? "login" : "register"} />
            <input type="hidden" name="accountType" value={accountType} />

            {!isLogin && (
              <div>
                    <label className="block text-gray-700 mb-1.5 md:mb-2 text-sm md:text-base font-medium">Full Name</label>
                <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 md:w-5 md:h-5" size={18} />
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    required
                        className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  />
                </div>
              </div>
            )}

            <div>
                  <label className="block text-gray-700 mb-1.5 md:mb-2 text-sm md:text-base font-medium">Email Address</label>
              <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 md:w-5 md:h-5" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                      className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
            </div>

            <div>
                  <label className="block text-gray-700 mb-1.5 md:mb-2 text-sm md:text-base font-medium">Password</label>
              <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 md:w-5 md:h-5" size={18} />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                      className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                    <label className="block text-gray-700 mb-1.5 md:mb-2 text-sm md:text-base font-medium">Confirm Password</label>
                <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 md:w-5 md:h-5" size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                        className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
                  className="w-full py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base font-medium"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </Form>

          {/* Divider */}
              <div className="flex items-center gap-4 my-4 md:my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-gray-500 text-xs md:text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Demo Button */}
          <Link
                to="/dashboard?demo=true"
                className="w-full py-2.5 md:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors block text-center text-sm md:text-base font-medium"
          >
            Continue with Demo Account
          </Link>

          {/* Toggle Auth Mode */}
              <div className="text-center mt-4 md:mt-6">
            <button
              type="button"
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

