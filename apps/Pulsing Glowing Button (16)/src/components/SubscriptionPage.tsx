import { useState } from 'react';
import { Check, X, Zap, ArrowRight } from './Icons';

interface SubscriptionPageProps {
  user: any;
  organization: any;
  onComplete: () => void;
  onSkip: () => void;
}

export default function SubscriptionPage({ user, organization, onComplete, onSkip }: SubscriptionPageProps) {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect for trying out',
      features: [
        { text: '1 Event', included: true },
        { text: 'Basic budgeting', included: true },
        { text: 'Email support', included: true },
        { text: '7-day access', included: true },
        { text: 'Team collaboration', included: false },
        { text: 'Advanced analytics', included: false },
        { text: 'Priority support', included: false },
      ],
      popular: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: 49,
      yearlyPrice: 470,
      description: 'For growing teams',
      features: [
        { text: 'Unlimited Events', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Team collaboration (up to 10 users)', included: true },
        { text: 'Budget version control', included: true },
        { text: 'Expense approval workflows', included: true },
        { text: 'Custom reports', included: true },
        { text: 'Priority email support', included: true },
        { text: 'API access', included: false },
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 199,
      yearlyPrice: 1910,
      description: 'For large organizations',
      features: [
        { text: 'Everything in Professional', included: true },
        { text: 'Unlimited users', included: true },
        { text: 'Multiple organizations', included: true },
        { text: 'API access', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'SLA guarantee', included: true },
        { text: 'Advanced security features', included: true },
      ],
      popular: false,
    },
  ];

  const handleSubscribe = () => {
    const updatedUser = {
      ...user,
      subscription: selectedPlan,
      subscriptionCycle: billingCycle,
      subscribedAt: new Date().toISOString(),
    };
    localStorage.setItem('eventbudget_user', JSON.stringify(updatedUser));

    if (organization) {
      const updatedOrg = {
        ...organization,
        subscription: selectedPlan,
        subscriptionCycle: billingCycle,
      };
      localStorage.setItem('eventbudget_org', JSON.stringify(updatedOrg));
    }

    onComplete();
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const price = billingCycle === 'monthly' 
    ? selectedPlanData?.monthlyPrice 
    : selectedPlanData?.yearlyPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 text-lg mb-6">
            Select the plan that best fits your needs
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {plans.map((plan) => {
            const planPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const isSelected = selectedPlan === plan.id;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`bg-white rounded-2xl p-8 cursor-pointer transition-all ${
                  plan.popular
                    ? 'border-2 border-blue-600 shadow-xl scale-105'
                    : isSelected
                    ? 'border-2 border-blue-400 shadow-lg'
                    : 'border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                {plan.popular && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm mb-4">
                    <Zap size={14} />
                    <span>Most Popular</span>
                  </div>
                )}

                <h3 className="mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl">${planPrice}</span>
                  <span className="text-gray-600">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                  {billingCycle === 'yearly' && planPrice > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      ${(planPrice / 12).toFixed(0)}/month billed annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X size={20} className="text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <div
                  className={`w-full py-3 rounded-lg text-center transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'border-2 border-gray-300 text-gray-600'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select Plan'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary & Action */}
        <div className="bg-white rounded-2xl p-8 border-2 border-blue-600">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="mb-2">Ready to get started?</h3>
              <p className="text-gray-600">
                You've selected the <strong>{selectedPlanData?.name}</strong> plan
                {selectedPlan === 'free' ? (
                  <span> - Start with 1 free event</span>
                ) : (
                  <span> - ${price}/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onSkip}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {selectedPlan === 'free' ? 'Continue with Free' : 'Skip for now'}
              </button>
              <button
                onClick={handleSubscribe}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>{selectedPlan === 'free' ? 'Start Free Trial' : 'Subscribe Now'}</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>✓ No credit card required for free trial</p>
          <p>✓ Cancel anytime • 30-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
}
