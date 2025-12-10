import { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import type { User } from "~/lib/auth";
import { ConfirmDialog } from "~/components/shared";
import { VendorHeader } from "./VendorHeader";
import { VendorStats } from "./VendorStats";
import { VendorFilters } from "./VendorFilters";
import { VendorGrid } from "./VendorGrid";
import { VendorFormModal } from "./VendorFormModal";
import { VendorDetailsModal } from "./VendorDetailsModal";
import { filterVendors, calculateVendorStats } from "./utils";
import toast from "react-hot-toast";
import type { VendorWithStatsFlexible } from "./types";

interface VendorManagerProps {
  user: User | null;
  vendors: VendorWithStatsFlexible[];
  isDemo?: boolean;
}

/**
 * Main Vendor Manager Component
 * Orchestrates all vendor-related functionality
 */
export function VendorManager({ user, vendors = [], isDemo = false }: VendorManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorWithStatsFlexible | null>(null);
  const [editingVendor, setEditingVendor] = useState<VendorWithStatsFlexible | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; vendorId: string | null }>({
    isOpen: false,
    vendorId: null,
  });
  const fetcher = useFetcher();

  // Role-based access control
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const isEventManager = user?.role === 'EventManager';
  const isFinance = user?.role === 'Finance';

  // Vendors: Admin, EventManager, and Finance can manage vendors
  const canEditVendors = (isAdmin || isEventManager || isFinance) || isDemo;

  // Filter vendors
  const filteredVendors = filterVendors(vendors, searchQuery, filterCategory);

  // Calculate statistics
  const { totalSpent, totalContracts, avgRating } = calculateVendorStats(vendors);

  const handleAddVendor = () => {
    setEditingVendor(null);
    setShowAddVendor(true);
  };

  const handleEdit = (vendor: VendorWithStatsFlexible) => {
    setEditingVendor(vendor);
    setShowAddVendor(true);
  };

  const handleDelete = (vendorId: string) => {
    if (isDemo) {
      return;
    }
    setDeleteConfirm({ isOpen: true, vendorId });
  };

  const confirmDelete = () => {
    if (deleteConfirm.vendorId) {
      const formData = new FormData();
      formData.append('intent', 'deleteVendor');
      formData.append('vendorId', deleteConfirm.vendorId);
      fetcher.submit(formData, { method: 'post' });
      setDeleteConfirm({ isOpen: false, vendorId: null });
      toast.success('Vendor deleted successfully');
    }
  };

  const handleCloseForm = () => {
    setShowAddVendor(false);
    setEditingVendor(null);
  };

  const handleCloseDetails = () => {
    setSelectedVendor(null);
  };

  const handleEditFromDetails = () => {
    if (selectedVendor) {
      setSelectedVendor(null);
      setEditingVendor(selectedVendor);
      setShowAddVendor(true);
    }
  };

  return (
    <div className="space-y-6">
      <VendorHeader canEditVendors={canEditVendors} onAddVendor={handleAddVendor} />

      <VendorStats
        totalVendors={vendors.length}
        totalSpent={totalSpent}
        avgRating={avgRating}
      />

      <VendorFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCategory={filterCategory}
        onFilterChange={setFilterCategory}
      />

      <VendorGrid
        vendors={filteredVendors}
        canEditVendors={canEditVendors}
        isAdmin={isAdmin}
        searchQuery={searchQuery}
        onViewDetails={setSelectedVendor}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddVendor={handleAddVendor}
      />

      {/* Add/Edit Vendor Modal */}
      {showAddVendor && (
        <VendorFormModal
          vendor={editingVendor}
          onClose={handleCloseForm}
          fetcher={fetcher}
          isDemo={isDemo}
        />
      )}

      {/* View Vendor Details Modal */}
      {selectedVendor && (
        <VendorDetailsModal
          vendor={selectedVendor}
          onClose={handleCloseDetails}
          onEdit={handleEditFromDetails}
          canEdit={canEditVendors}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, vendorId: null })}
        onConfirm={confirmDelete}
        title="Delete Vendor"
        message="Are you sure you want to delete this vendor? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
