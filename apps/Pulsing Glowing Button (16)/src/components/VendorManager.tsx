import { useState } from 'react';
import { Plus, Search, Star, Phone, Mail, MapPin, FileText, DollarSign, Users } from './Icons';

interface VendorManagerProps {
  user: any;
  organization: any;
  isDemo: boolean;
}

export default function VendorManager({ user, organization, isDemo }: VendorManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: 'Venue',
    email: '',
    phone: '',
    address: '',
    rating: 5,
    notes: '',
  });

  const vendors = [
    {
      id: 1,
      name: 'Moscone Center',
      category: 'Venue',
      email: 'events@mosconecenter.com',
      phone: '+1 (415) 974-4000',
      address: '747 Howard St, San Francisco, CA 94103',
      rating: 5,
      totalSpent: 125000,
      eventsCount: 3,
      status: 'active',
      notes: 'Premium venue for large conferences',
    },
    {
      id: 2,
      name: 'Gourmet Catering Co',
      category: 'Catering',
      email: 'contact@gourmetcatering.com',
      phone: '+1 (415) 555-0100',
      address: '123 Market St, San Francisco, CA 94102',
      rating: 4,
      totalSpent: 85000,
      eventsCount: 8,
      status: 'active',
      notes: 'Reliable catering with diverse menu options',
    },
    {
      id: 3,
      name: 'Digital Marketing Agency',
      category: 'Marketing',
      email: 'hello@digitalmarketing.com',
      phone: '+1 (415) 555-0200',
      address: '456 Market St, San Francisco, CA 94103',
      rating: 5,
      totalSpent: 65000,
      eventsCount: 5,
      status: 'active',
      notes: 'Excellent social media campaigns',
    },
    {
      id: 4,
      name: 'TechSolutions Inc',
      category: 'Technology',
      email: 'info@techsolutions.com',
      phone: '+1 (408) 555-0300',
      address: '789 Tech Ave, San Jose, CA 95110',
      rating: 5,
      totalSpent: 45000,
      eventsCount: 4,
      status: 'active',
      notes: 'Custom app and tech solutions',
    },
    {
      id: 5,
      name: 'Print Pro',
      category: 'Marketing',
      email: 'sales@printpro.com',
      phone: '+1 (415) 555-0400',
      address: '321 Print Ln, San Francisco, CA 94104',
      rating: 3,
      totalSpent: 15000,
      eventsCount: 6,
      status: 'active',
      notes: 'Quick turnaround for print materials',
    },
    {
      id: 6,
      name: 'Mountain Resort',
      category: 'Venue',
      email: 'reservations@mountainresort.com',
      phone: '+1 (530) 555-0500',
      address: '1000 Mountain Rd, Lake Tahoe, NV 89450',
      rating: 5,
      totalSpent: 55000,
      eventsCount: 2,
      status: 'active',
      notes: 'Perfect for corporate retreats',
    },
    {
      id: 7,
      name: 'Sound & Lights Co',
      category: 'Technology',
      email: 'bookings@soundlights.com',
      phone: '+1 (415) 555-0600',
      address: '555 AV Blvd, Oakland, CA 94612',
      rating: 4,
      totalSpent: 32000,
      eventsCount: 7,
      status: 'active',
      notes: 'Professional AV equipment and staff',
    },
    {
      id: 8,
      name: 'Executive Transport',
      category: 'Transportation',
      email: 'dispatch@exectransport.com',
      phone: '+1 (415) 555-0700',
      address: '888 Transit Way, San Francisco, CA 94105',
      rating: 4,
      totalSpent: 18000,
      eventsCount: 5,
      status: 'active',
      notes: 'Reliable transportation services',
    },
  ];

  const categories = ['all', 'Venue', 'Catering', 'Marketing', 'Technology', 'Transportation'];

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === 'all' || vendor.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const totalSpent = vendors.reduce((sum, v) => sum + v.totalSpent, 0);
  const avgRating = vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const handleAddVendor = () => {
    // In demo mode or when backend isn't connected, just close the modal
    console.log('Adding vendor:', newVendor);
    setShowAddVendor(false);
    setNewVendor({
      name: '',
      category: 'Venue',
      email: '',
      phone: '',
      address: '',
      rating: 5,
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2>Vendor Manager</h2>
          <p className="text-gray-600 mt-1">Manage your trusted vendors and suppliers</p>
        </div>
        <button
          onClick={() => setShowAddVendor(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
        >
          <Plus size={20} />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Vendors</p>
          <p className="text-3xl mb-2">{vendors.length}</p>
          <p className="text-sm text-gray-500">Active relationships</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Spent</p>
          <p className="text-3xl text-blue-600 mb-2">${totalSpent.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Across all vendors</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Average Rating</p>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-3xl text-yellow-600">{avgRating.toFixed(1)}</p>
            {renderStars(Math.round(avgRating))}
          </div>
          <p className="text-sm text-gray-500">Based on {vendors.length} vendors</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="mb-2">{vendor.name}</h3>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {vendor.category}
                </span>
              </div>
              <div className="text-right">
                {renderStars(vendor.rating)}
                <p className="text-sm text-gray-500 mt-1">{vendor.rating}/5</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} />
                <span className="text-sm">{vendor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                <span className="text-sm">{vendor.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">{vendor.address}</span>
              </div>
            </div>

            {vendor.notes && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{vendor.notes}</p>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Spent</p>
                  <p className="text-gray-900">${vendor.totalSpent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Events</p>
                  <p className="text-gray-900">{vendor.eventsCount} events</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedVendor(vendor)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Details
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="mb-2">No vendors found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first vendor'}
          </p>
          <button
            onClick={() => setShowAddVendor(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Vendor
          </button>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl">Add New Vendor</h3>
              <p className="text-gray-600 mt-1">Enter vendor details to add to your network</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Vendor Name *</label>
                  <input
                    type="text"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    placeholder="Enter vendor name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Category *</label>
                  <select
                    value={newVendor.category}
                    onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Technology">Technology</option>
                    <option value="Transportation">Transportation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    placeholder="vendor@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={newVendor.address}
                  onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                  placeholder="123 Main St, City, State ZIP"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setNewVendor({ ...newVendor, rating })}
                      className="focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={rating <= newVendor.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newVendor.notes}
                  onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
                  placeholder="Additional information about this vendor..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddVendor(false);
                  setNewVendor({
                    name: '',
                    category: 'Venue',
                    email: '',
                    phone: '',
                    address: '',
                    rating: 5,
                    notes: '',
                  });
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVendor}
                disabled={!newVendor.name || !newVendor.email}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Vendor Details Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl mb-2">{selectedVendor.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {selectedVendor.category}
                    </span>
                    {renderStars(selectedVendor.rating)}
                    <span className="text-sm text-gray-600">{selectedVendor.rating}/5</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h4 className="mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={20} className="text-gray-400" />
                    <a href={`mailto:${selectedVendor.email}`} className="hover:text-blue-600">
                      {selectedVendor.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone size={20} className="text-gray-400" />
                    <a href={`tel:${selectedVendor.phone}`} className="hover:text-blue-600">
                      {selectedVendor.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin size={20} className="text-gray-400 mt-0.5" />
                    <span>{selectedVendor.address}</span>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div>
                <h4 className="mb-3">Performance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={20} className="text-blue-600" />
                      <span className="text-gray-600">Total Spent</span>
                    </div>
                    <p className="text-2xl">${selectedVendor.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={20} className="text-blue-600" />
                      <span className="text-gray-600">Events</span>
                    </div>
                    <p className="text-2xl">{selectedVendor.eventsCount}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedVendor.notes && (
                <div>
                  <h4 className="mb-3">Notes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedVendor.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Send Message
                </button>
                <button className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
