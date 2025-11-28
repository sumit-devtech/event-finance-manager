import { Link } from "@remix-run/react";
import { Plus, Search, Star, Phone, Mail, MapPin, FileText, DollarSign } from 'lucide-react';
import type { User } from "~/lib/auth";

interface VendorManagerProps {
  user: User;
  vendors: any[];
}

export function VendorManager({ user, vendors = [] }: VendorManagerProps) {
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
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const totalSpent = vendors.reduce((sum, v) => sum + (v.totalSpent || 0), 0);
  const totalContracts = vendors.reduce((sum, v) => sum + (v.totalContracts || 0), 0);
  const avgRating = vendors.length > 0 
    ? vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2>
          <p className="text-gray-600 mt-1">Manage your vendor relationships and contracts</p>
        </div>
        <Link
          to="/vendors/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center"
        >
          <Plus size={20} />
          <span>Add Vendor</span>
        </Link>
      </div>

      {/* Vendor Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Vendors</p>
          <p className="text-2xl font-bold">{vendors.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Active Contracts</p>
          <p className="text-2xl font-bold text-green-600">{totalContracts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Total Spent</p>
          <p className="text-2xl font-bold text-blue-600">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">Avg Rating</p>
          <div className="flex items-center gap-2">
            <Star className="fill-yellow-400 text-yellow-400" size={24} />
            <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      {vendors.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold">{vendor.name}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {vendor.category || 'Uncategorized'}
                    </span>
                  </div>
                  {renderStars(vendor.rating || 0)}
                </div>

                <div className="space-y-2 mb-4">
                  {vendor.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} />
                      <span>{vendor.email}</span>
                    </div>
                  )}
                  {vendor.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span>{vendor.address}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FileText size={16} />
                      <span className="text-sm">Contracts</span>
                    </div>
                    <p className="text-xl font-semibold">{vendor.totalContracts || 0}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <DollarSign size={16} />
                      <span className="text-sm">Total Spent</span>
                    </div>
                    <p className="text-xl font-semibold">${((vendor.totalSpent || 0) / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">No vendors yet</p>
          <Link
            to="/vendors/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>Add Vendor</span>
          </Link>
        </div>
      )}
    </div>
  );
}

