import { useState } from 'react';
import { Link, useFetcher } from '@remix-run/react';
import { Plus, Search, Star, Phone, Mail, MapPin, FileText, DollarSign, Users, Edit, Trash, X } from './Icons';
import type { User } from "~/lib/auth";

interface VendorManagerProps {
  user: User | null;
  vendors: any[];
  isDemo?: boolean;
}

export function VendorManager({ user, vendors = [], isDemo = false }: VendorManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const fetcher = useFetcher();

  // Role-based access control
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const isEventManager = user?.role === 'EventManager';
  const isFinance = user?.role === 'Finance';
  const isViewer = user?.role === 'Viewer';

  // Vendors: Admin, EventManager, and Finance can manage vendors
  const canEditVendors = (isAdmin || isEventManager || isFinance) || isDemo;

  const categories = ['all', 'Venue', 'Catering', 'Marketing', 'Logistics', 'Entertainment', 'StaffTravel', 'Technology', 'Transportation', 'Miscellaneous'];

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.serviceType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === 'all' || vendor.category === filterCategory || vendor.serviceType === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const totalSpent = vendors.reduce((sum, v) => sum + (v.totalSpent || 0), 0);
  const totalContracts = vendors.reduce((sum, v) => sum + (v.totalContracts || 0), 0);
  const avgRating = vendors.length > 0 
    ? vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.length 
    : 0;

  const renderStars = (rating: number) => {
    const numRating = rating || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= numRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const handleDelete = (vendorId: string) => {
    if (isDemo) {
      // Demo mode - just remove from local state if needed
      return;
    }
    if (confirm('Are you sure you want to delete this vendor?')) {
      const formData = new FormData();
      formData.append('intent', 'deleteVendor');
      formData.append('vendorId', vendorId);
      fetcher.submit(formData, { method: 'post' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Manager</h2>
          <p className="text-gray-600 mt-1">Manage your trusted vendors and suppliers</p>
        </div>
        {canEditVendors && (
          <button
            onClick={() => {
              setEditingVendor(null);
              setShowAddVendor(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center transition-colors"
          >
            <Plus size={20} />
            <span>Add Vendor</span>
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Vendors</p>
          <p className="text-3xl font-bold mb-2">{vendors.length}</p>
          <p className="text-sm text-gray-500">Active relationships</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Spent</p>
          <p className="text-3xl text-blue-600 font-bold mb-2">${totalSpent.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Across all vendors</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Average Rating</p>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-3xl text-yellow-600 font-bold">{avgRating.toFixed(1)}</p>
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
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">{vendor.name}</h3>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {vendor.category || vendor.serviceType || 'Uncategorized'}
                  </span>
                </div>
                <div className="text-right">
                  {renderStars(vendor.rating || 0)}
                  <p className="text-sm text-gray-500 mt-1">{vendor.rating ? `${vendor.rating}/5` : 'No rating'}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {vendor.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} />
                    <span className="text-sm">{vendor.email}</span>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    <span className="text-sm">{vendor.phone}</span>
                  </div>
                )}
                {vendor.contactPerson && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} />
                    <span className="text-sm">{vendor.contactPerson}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Spent</p>
                    <p className="text-gray-900 font-semibold">${(vendor.totalSpent || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Events</p>
                    <p className="text-gray-900 font-semibold">{vendor.totalContracts || vendor.eventsCount || 0} events</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedVendor(vendor)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  {canEditVendors && (
                    <>
                      <button
                        onClick={() => {
                          setEditingVendor(vendor);
                          setShowAddVendor(true);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(vendor.id)}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="mb-2 font-semibold text-lg">No vendors found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first vendor'}
          </p>
          {canEditVendors && (
            <button
              onClick={() => {
                setEditingVendor(null);
                setShowAddVendor(true);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Vendor
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Vendor Modal */}
      {showAddVendor && (
        <VendorFormModal
          vendor={editingVendor}
          onClose={() => {
            setShowAddVendor(false);
            setEditingVendor(null);
          }}
          fetcher={fetcher}
          isDemo={isDemo}
        />
      )}

      {/* View Vendor Details Modal */}
      {selectedVendor && (
        <VendorDetailsModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onEdit={() => {
            setSelectedVendor(null);
            setEditingVendor(selectedVendor);
            setShowAddVendor(true);
          }}
          canEdit={canEditVendors}
        />
      )}
    </div>
  );
}

// Vendor Form Modal Component
function VendorFormModal({ vendor, onClose, fetcher, isDemo }: { vendor?: any; onClose: () => void; fetcher: any; isDemo?: boolean }) {
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    serviceType: vendor?.serviceType || vendor?.category || 'Venue',
    contactPerson: vendor?.contactPerson || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    gstNumber: vendor?.gstNumber || '',
    rating: vendor?.rating || 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      onClose();
      return;
    }

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('intent', vendor ? 'updateVendor' : 'createVendor');
    if (vendor) {
      formDataToSubmit.append('vendorId', vendor.id);
    }
    formDataToSubmit.append('name', formData.name);
    if (formData.serviceType) formDataToSubmit.append('serviceType', formData.serviceType);
    if (formData.contactPerson) formDataToSubmit.append('contactPerson', formData.contactPerson);
    if (formData.email) formDataToSubmit.append('email', formData.email);
    if (formData.phone) formDataToSubmit.append('phone', formData.phone);
    if (formData.gstNumber) formDataToSubmit.append('gstNumber', formData.gstNumber);
    if (formData.rating) formDataToSubmit.append('rating', formData.rating.toString());

    fetcher.submit(formDataToSubmit, { method: 'post' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold">{vendor ? 'Edit Vendor' : 'Add New Vendor'}</h3>
          <p className="text-gray-600 mt-1">Enter vendor details to {vendor ? 'update' : 'add to'} your network</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Vendor Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter vendor name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Service Type *</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Venue">Venue</option>
                <option value="Catering">Catering</option>
                <option value="Marketing">Marketing</option>
                <option value="Logistics">Logistics</option>
                <option value="Entertainment">Entertainment</option>
                <option value="StaffTravel">Staff Travel</option>
                <option value="Technology">Technology</option>
                <option value="Transportation">Transportation</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vendor@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Contact person name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">GST Number</label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="GST number (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating })}
                  className="focus:outline-none"
                >
                  <Star
                    size={32}
                    className={rating <= formData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {vendor ? 'Update Vendor' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Vendor Details Modal Component
function VendorDetailsModal({ vendor, onClose, onEdit, canEdit }: { vendor: any; onClose: () => void; onEdit: () => void; canEdit: boolean }) {
  const renderStars = (rating: number) => {
    const numRating = rating || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= numRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">{vendor.name}</h3>
              <div className="flex items-center gap-3">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {vendor.category || vendor.serviceType || 'Uncategorized'}
                </span>
                {renderStars(vendor.rating || 0)}
                <span className="text-sm text-gray-600">{vendor.rating ? `${vendor.rating}/5` : 'No rating'}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Contact Information</h4>
            <div className="space-y-3">
              {vendor.email && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail size={20} className="text-gray-400" />
                  <a href={`mailto:${vendor.email}`} className="hover:text-blue-600">
                    {vendor.email}
                  </a>
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone size={20} className="text-gray-400" />
                  <a href={`tel:${vendor.phone}`} className="hover:text-blue-600">
                    {vendor.phone}
                  </a>
                </div>
              )}
              {vendor.contactPerson && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Users size={20} className="text-gray-400" />
                  <span>{vendor.contactPerson}</span>
                </div>
              )}
              {vendor.gstNumber && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FileText size={20} className="text-gray-400" />
                  <span>GST: {vendor.gstNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Performance Stats */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Performance</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={20} className="text-blue-600" />
                  <span className="text-gray-600">Total Spent</span>
                </div>
                <p className="text-2xl font-bold">${(vendor.totalSpent || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={20} className="text-blue-600" />
                  <span className="text-gray-600">Events</span>
                </div>
                <p className="text-2xl font-bold">{vendor.totalContracts || vendor.eventsCount || 0}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {canEdit && (
            <div className="flex gap-3">
              <button
                onClick={onEdit}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Vendor
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
