import { useState } from 'react';
import { Form, Link, useSearchParams } from '@remix-run/react';
import { ArrowLeft, Mail, Lock, User, Building2 } from 'lucide-react';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState<'individual' | 'organization'>('individual');

  // Handle demo login
  if (isDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-blue-600 text-2xl font-bold mb-2">EventBudget Pro</h2>
              <h3 className="text-xl font-semibold mb-2">Demo Mode</h3>
              <p className="text-gray-600">Experience EventBudget Pro with sample data</p>
            </div>
            <Form method="post" action="/login">
              <input type="hidden" name="intent" value="demo" />
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
              >
                Enter Demo Mode
              </button>
            </Form>
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors justify-center"
            >
              <ArrowLeft size={20} />
              <span>Back to home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to home</span>
        </Link>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-blue-600 text-2xl font-bold mb-2">EventBudget Pro</h2>
            <h3 className="text-xl font-semibold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to your account' : 'Get started with your free trial'}
            </p>
          </div>

          {/* Account Type Selection (Register Only) */}
          {!isLogin && (
            <div className="mb-6">
              <label className="block text-gray-700 mb-3 font-medium">Account Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAccountType('individual')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    accountType === 'individual'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <User className={`mx-auto mb-2 ${accountType === 'individual' ? 'text-blue-600' : 'text-gray-400'}`} size={24} />
                  <p className="text-sm font-medium">Individual</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('organization')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    accountType === 'organization'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Building2 className={`mx-auto mb-2 ${accountType === 'organization' ? 'text-blue-600' : 'text-gray-400'}`} size={24} />
                  <p className="text-sm font-medium">Organization</p>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <Form method="post" action="/login" className="space-y-4">
            <input type="hidden" name="intent" value={isLogin ? "login" : "register"} />
            <input type="hidden" name="accountType" value={accountType} />

            {!isLogin && (
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </Form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Demo Button */}
          <Link
            to="/demo/dashboard"
            className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors block text-center font-medium"
          >
            Continue with Demo Account
          </Link>

          {/* Toggle Auth Mode */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {!isLogin && (
            <p className="text-xs text-gray-500 text-center mt-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

