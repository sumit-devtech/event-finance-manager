import { useState } from 'react';
import { Form, useNavigate } from '@remix-run/react';
import { Building2, MapPin, Globe, ArrowRight } from 'lucide-react';
import type { User } from '~/lib/auth';
import { Dropdown } from '~/components/shared';

interface OrganizationSetupProps {
  user: User;
}

export function OrganizationSetup({ user }: OrganizationSetupProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    address: '',
    city: '',
    country: '',
    website: '',
    description: '',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Set Up Your Organization</h2>
            <p className="text-gray-600">
              Let's get your organization configured so your team can start collaborating
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Form */}
          <Form method="post" action="/setup/organization">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Organization Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Acme Corporation"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Industry *</label>
                    <input type="hidden" name="industry" value={formData.industry} />
                    <Dropdown
                      value={formData.industry}
                      onChange={(value) => setFormData({ ...formData, industry: value })}
                      options={[
                        { value: '', label: 'Select industry' },
                        { value: 'technology', label: 'Technology' },
                        { value: 'events', label: 'Events & Hospitality' },
                        { value: 'marketing', label: 'Marketing & Advertising' },
                        { value: 'nonprofit', label: 'Non-Profit' },
                        { value: 'education', label: 'Education' },
                        { value: 'healthcare', label: 'Healthcare' },
                        { value: 'other', label: 'Other' },
                      ]}
                      placeholder="Select industry"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Organization Size *</label>
                    <input type="hidden" name="size" value={formData.size} />
                    <Dropdown
                      value={formData.size}
                      onChange={(value) => setFormData({ ...formData, size: value })}
                      options={[
                        { value: '', label: 'Select size' },
                        { value: '1-10', label: '1-10 employees' },
                        { value: '11-50', label: '11-50 employees' },
                        { value: '51-200', label: '51-200 employees' },
                        { value: '201-500', label: '201-500 employees' },
                        { value: '500+', label: '500+ employees' },
                      ]}
                      placeholder="Select size"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of your organization..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Location & Contact</h3>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main Street"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="San Francisco"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="United States"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Hidden fields for form submission */}
            {step === 2 && (
              <>
                <input type="hidden" name="name" value={formData.name} />
                <input type="hidden" name="industry" value={formData.industry} />
                <input type="hidden" name="size" value={formData.size} />
                <input type="hidden" name="description" value={formData.description} />
              </>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip for now
              </button>
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                {step < 2 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span>Continue</span>
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span>Complete Setup</span>
                    <ArrowRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

