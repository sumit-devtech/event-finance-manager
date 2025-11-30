import { Link } from '@remix-run/react';
import { ArrowRight, CheckCircle, BarChart3, Users, DollarSign, Zap, Shield, Globe } from 'lucide-react';
import logoImage from '~/assets/logo.png';

export function LandingPage() {
  const features = [
    { icon: BarChart3, title: 'Real-time Analytics', description: 'Track ROI and performance metrics across all events' },
    { icon: Users, title: 'Team Collaboration', description: 'Assign events to team members and manage permissions' },
    { icon: DollarSign, title: 'Budget Control', description: 'Version-controlled budgets with approval workflows' },
    { icon: Zap, title: 'Fast Setup', description: 'Get started in minutes with intuitive interfaces' },
    { icon: Shield, title: 'Secure & Reliable', description: 'Enterprise-grade security for your data' },
    { icon: Globe, title: 'Multi-Organization', description: 'Manage multiple organizations from one account' },
  ];

  const plans = [
    {
      name: 'Free Trial',
      price: '$0',
      description: 'Try EventBudget Pro',
      features: ['1 Event', 'Basic budgeting', 'Email support', '7-day access'],
      cta: 'Start Free Trial',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$49',
      description: 'For growing teams',
      features: ['Unlimited Events', 'Advanced analytics', 'Team collaboration', 'Priority support', 'Custom reports'],
      cta: 'Get Started',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: '$199',
      description: 'For large organizations',
      features: ['Everything in Pro', 'Unlimited users', 'API access', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoImage} alt="EventBudget Pro Logo" className="w-8 h-8 md:w-10 md:h-10" />
              <h1 className="text-blue-600 text-lg md:text-2xl font-bold">EventBudget Pro</h1>
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
              <Link
                to="/dashboard?demo=true"
                className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base text-gray-700 hover:text-blue-600 transition-colors"
              >
                Try Demo
              </Link>
              <Link
                to="/login"
                className="px-4 py-1.5 md:px-6 md:py-2 text-sm md:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-100 text-blue-700 rounded-full mb-4 md:mb-6">
              <Zap size={14} className="md:w-4 md:h-4" />
              <span className="text-xs md:text-sm">Now with AI-powered insights</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold leading-tight">
              Event Budget Planning Made Simple
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8">
              Plan, track, and optimize your event budgets with powerful analytics and team collaboration tools.
            </p>
            <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3 md:gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <span>Get Started Free</span>
                <ArrowRight size={18} className="md:w-5 md:h-5" />
              </Link>
              <Link
                to="/dashboard?demo=true"
                className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm md:text-base"
              >
                Try Demo Mode
              </Link>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">No credit card required • 7-day free trial</p>
          </div>
          <div className="flex justify-center">
            <img 
              src={logoImage} 
              alt="EventBudget Pro - Your Event Budget OS" 
              className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain" 
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-8 md:mb-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Everything you need to manage events</h3>
          <p className="text-gray-600 text-sm md:text-base lg:text-lg px-4">Powerful features to streamline your event budgeting workflow</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                  <Icon className="text-blue-600 md:w-6 md:h-6" size={20} />
                </div>
                <h4 className="font-semibold mb-2 text-base md:text-lg">{feature.title}</h4>
                <p className="text-gray-600 text-sm md:text-base">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-8 md:mb-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Simple, transparent pricing</h3>
          <p className="text-gray-600 text-sm md:text-base lg:text-lg px-4">Choose the plan that's right for your team</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl border-2 p-6 md:p-8 ${
                plan.highlighted
                  ? 'border-blue-600 shadow-xl md:scale-105'
                  : 'border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <div className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-xs md:text-sm mb-3 md:mb-4">
                  Most Popular
                </div>
              )}
              <h4 className="text-lg md:text-xl font-bold mb-2">{plan.name}</h4>
              <div className="mb-2">
                <span className="text-3xl md:text-4xl font-bold">{plan.price}</span>
                {plan.price !== '$0' && <span className="text-gray-600 text-sm md:text-base">/month</span>}
              </div>
              <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">{plan.description}</p>
              <Link
                to="/login"
                className={`w-full py-2.5 md:py-3 rounded-lg mb-4 md:mb-6 transition-colors block text-center text-sm md:text-base ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                }`}
              >
                {plan.cta}
              </Link>
              <ul className="space-y-2 md:space-y-3">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5 md:w-5 md:h-5" size={18} />
                    <span className="text-gray-700 text-sm md:text-base">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl md:rounded-2xl p-6 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Ready to get started?</h3>
          <p className="text-base md:text-xl mb-6 md:mb-8 opacity-90 px-4">
            Join thousands of event planners who trust EventBudget Pro
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm md:text-base"
            >
              Start Free Trial
            </Link>
            <Link
              to="/dashboard?demo=true"
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-medium text-sm md:text-base"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 EventBudget Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

