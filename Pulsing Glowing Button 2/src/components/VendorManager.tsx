import { useState } from 'react';
import { Plus, Search, Star, Phone, Mail, MapPin, FileText, DollarSign } from 'lucide-react';

interface VendorManagerProps {
  user: any;
  organization: any;
  isDemo: boolean;
}

export default function VendorManager({ user, organization, isDemo }: VendorManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const vendors = [
    {
      id: 1,
      name: 'Grand Convention Center',
      category: 'Venue',
      rating: 4.8,
      totalContracts: 12,
      totalSpent: 450000,
      phone: '+1 (555) 123-4567',
      email: 'bookings@grandconvention.com',
      address: 'San Francisco, CA',
      status: 'active',
      lastContract: '2024-02-15',
    },
    {
      id: 2,
      name: 'Premium Catering Co.',
      category: 'Catering',
      rating: 4.9,
      totalContracts: 18,
      totalSpent: 285000,
      phone: '+1 (555) 234-5678',
      email: 'info@premiumcatering.com',
      address: 'New York, NY',
      status: 'active',
      lastContract: '2024-02-10',
    },
    {
      id: 3,
      name: 'AdTech Solutions',
      category: 'Marketing',
      rating: 4.6,
      totalContracts: 8,
      totalSpent: 125000,
      phone: '+1 (555) 345-6789',
      email: 'sales@adtechsolutions.com',
      address: 'Austin, TX',
      status: 'active',
      lastContract: '2024-02-05',
    },
    {
      id: 4,
      name: 'Entertainment Plus',
      category: 'Entertainment',
      rating: 4.7,
      totalContracts: 15,
      totalSpent: 195000,
      phone: '+1 (555) 456-7890',
      email: 'bookings@entertainmentplus.com',
      address: 'Los Angeles, CA',
      status: 'active',
      lastContract: '2024-01-28',
    },
    {
      id: 5,
      name: 'Tech Events Pro',
      category: 'Technology',
      rating: 4.5,
      totalContracts: 10,
      totalSpent: 98000,
      phone: '+1 (555) 567-8901',
      email: 'contact@techeventspro.com',
      address: 'Seattle, WA',
      status: 'active',
      lastContract: '2024-01-15',
    },
    {
      id: 6,
      name: 'EventStaff Plus',
      category: 'Staffing',
      rating: 4.4,
      totalContracts: 22,
      totalSpent: 176000,
      phone: '+1 (555) 678-9012',
      email: 'hr@eventstaffplus.com',
      address: 'Chicago, IL',
      status: 'active',
      lastContract: '2024-02-01',
    },
  ];

  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={16}
            className={index < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2>Vendor Management</h2>
          <p className="text-gray-600 mt-1">Manage your vendor relationships and contracts</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center">
          <Plus size={20} />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search vendors by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vendor Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Vendors</p>
          <p className="text-2xl">{vendors.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Active Contracts</p>
          <p className="text-2xl text-green-600">
            {vendors.reduce((sum, v) => sum + v.totalContracts, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Spent</p>
          <p className="text-2xl text-blue-600">
            ${vendors.reduce((sum, v) => sum + v.totalSpent, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Avg Rating</p>
          <div className="flex items-center gap-2">
            <Star className="fill-yellow-400 text-yellow-400" size={24} />
            <p className="text-2xl">
              {(vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="mb-2">{vendor.name}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {vendor.category}
                  </span>
                </div>
                {renderStars(vendor.rating)}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} />
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} />
                  <span>{vendor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>{vendor.address}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <FileText size={16} />
                    <span className="text-sm">Contracts</span>
                  </div>
                  <p className="text-xl">{vendor.totalContracts}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <DollarSign size={16} />
                    <span className="text-sm">Total Spent</span>
                  </div>
                  <p className="text-xl">${(vendor.totalSpent / 1000).toFixed(0)}K</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">
                  Last contract: {new Date(vendor.lastContract).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    View Details
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    New Contract
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
