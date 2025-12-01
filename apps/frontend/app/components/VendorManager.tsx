import { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { Plus, Star, Phone, Mail, FileText, DollarSign, Users } from './Icons';
import type { User } from "~/lib/auth";
import type { VendorWithStats } from "~/types";
import {
  DataCard,
  FilterBar,
  SummaryStats,
  EmptyState,
  FormModal,
  DetailsModal,
  ViewDetailsButton,
  EditButton,
  DeleteButton,
  FormField,
  FormInput,
  FormSelect,
  RatingInput,
  ConfirmDialog,
} from "./shared";
import { useFormSubmission } from "~/hooks/useFormSubmission";
import toast from "react-hot-toast";
import type { CardMetadata, CardStat, SummaryStat, ModalSection, FilterConfig, ActionButtonConfig } from "~/types";

interface VendorManagerProps {
  user: User | null;
  vendors: VendorWithStats[];
  isDemo?: boolean;
}

export function VendorManager({ user, vendors = [], isDemo = false }: VendorManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorWithStats | null>(null);
  const [editingVendor, setEditingVendor] = useState<VendorWithStats | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; vendorId: string | null }>({
    isOpen: false,
    vendorId: null,
  });
  const fetcher = useFetcher();

  // Role-based access control
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
  const isEventManager = user?.role === 'EventManager';
  const isFinance = user?.role === 'Finance';
  const isViewer = user?.role === 'Viewer';

  // Vendors: Admin, EventManager, and Finance can manage vendors
  const canEditVendors = (isAdmin || isEventManager || isFinance) || isDemo;

  const categories = ['all', 'Venue', 'Catering', 'Marketing', 'Logistics', 'Entertainment', 'StaffTravel', 'Technology', 'Transportation', 'Miscellaneous'];

  const filteredVendors = vendors.filter((vendor) => {
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

  // Filter configuration
  const filterConfigs: FilterConfig[] = [
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      value: filterCategory,
      onChange: (value) => setFilterCategory(value),
      options: categories.map(cat => ({
        value: cat,
        label: cat === 'all' ? 'All Categories' : cat,
      })),
    },
  ];

  // Summary stats
  const summaryStats: SummaryStat[] = [
    {
      label: 'Total Vendors',
      value: vendors.length,
      description: 'Active relationships',
    },
    {
      label: 'Total Spent',
      value: `$${totalSpent.toLocaleString()}`,
      description: 'Across all vendors',
      color: 'blue-600',
    },
    {
      label: 'Average Rating',
      value: avgRating.toFixed(1),
      description: `Based on ${vendors.length} vendors`,
      icon: renderStars(Math.round(avgRating)),
      color: 'yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Vendor Manager</h2>
          <p className="text-muted-foreground mt-1">Manage your trusted vendors and suppliers</p>
        </div>
        {canEditVendors && (
          <button
            onClick={() => {
              setEditingVendor(null);
              setShowAddVendor(true);
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2 justify-center transition-colors"
          >
            <Plus size={20} />
            <span>Add Vendor</span>
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <SummaryStats stats={summaryStats} columns={3} />

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search vendors..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filterConfigs}
      />

      {/* Vendors Grid */}
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVendors.map((vendor) => {
            const metadata: CardMetadata[] = [];
            if (vendor.email) {
              metadata.push({
                icon: <Mail size={16} />,
                label: 'Email',
                value: vendor.email,
              });
            }
            if (vendor.phone) {
              metadata.push({
                icon: <Phone size={16} />,
                label: 'Phone',
                value: vendor.phone,
              });
            }
            if (vendor.contactPerson) {
              metadata.push({
                icon: <Users size={16} />,
                label: 'Contact',
                value: vendor.contactPerson,
              });
            }

            const stats: CardStat[] = [
              {
                label: 'Total Spent',
                value: `$${(vendor.totalSpent || 0).toLocaleString()}`,
              },
              {
                label: 'Events',
                value: `${vendor.totalContracts || vendor.eventsCount || 0} events`,
              },
            ];

            const actions: ActionButtonConfig[] = [
              {
                label: 'View Details',
                onClick: () => setSelectedVendor(vendor),
                variant: 'primary',
              },
            ];

            if (canEditVendors) {
              actions.push({
                label: 'Edit',
                onClick: () => {
                  setEditingVendor(vendor);
                  setShowAddVendor(true);
                },
                variant: 'secondary',
              });
            }

            if (isAdmin) {
              actions.push({
                label: 'Delete',
                onClick: () => handleDelete(vendor.id),
                variant: 'danger',
                requireConfirm: true,
                confirmMessage: 'Are you sure you want to delete this vendor?',
              });
            }

            return (
              <DataCard
                key={vendor.id}
                title={vendor.name}
                badge={{
                  label: vendor.category || vendor.serviceType || 'Uncategorized',
                  color: 'blue',
                }}
                icon={
                  <div className="text-right">
                    {renderStars(vendor.rating || 0)}
                    <p className="text-sm text-muted-foreground mt-1">
                      {vendor.rating ? `${vendor.rating}/5` : 'No rating'}
                    </p>
                  </div>
                }
                metadata={metadata}
                stats={stats}
                actions={actions}
              />
            );
          })}
        </div>
      ) : (
          <EmptyState
            icon={<Users size={48} className="mx-auto text-muted-foreground" />}
            title="No vendors found"
            description={
              searchQuery
                ? 'Try adjusting your search'
                : 'Get started by adding your first vendor'
            }
            actionLabel={canEditVendors ? 'Add Vendor' : undefined}
            onAction={
              canEditVendors
                ? () => {
                  setEditingVendor(null);
                  setShowAddVendor(true);
                }
                : undefined
            }
          />
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

// Vendor Form Modal Component
interface VendorFormModalProps {
  vendor?: VendorWithStats | null;
  onClose: () => void;
  fetcher: ReturnType<typeof useFetcher>;
  isDemo?: boolean;
}

function VendorFormModal({ vendor, onClose, fetcher, isDemo }: VendorFormModalProps) {
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    serviceType: vendor?.serviceType || vendor?.category || 'Venue',
    contactPerson: vendor?.contactPerson || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    gstNumber: vendor?.gstNumber || '',
    rating: vendor?.rating || 5,
  });

  const { isLoading } = useFormSubmission({
    fetcher,
    onSuccess: () => {
      toast.success(vendor ? 'Vendor updated successfully' : 'Vendor created successfully');
      onClose();
    },
    onError: (error) => {
      toast.error(error || 'An error occurred while saving the vendor');
    },
    isDemo,
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
  };

  const serviceTypeOptions = [
    { value: 'Venue', label: 'Venue' },
    { value: 'Catering', label: 'Catering' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Logistics', label: 'Logistics' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'StaffTravel', label: 'Staff Travel' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Miscellaneous', label: 'Miscellaneous' },
  ];

  return (
    <FormModal
      title={vendor ? 'Edit Vendor' : 'Add New Vendor'}
      subtitle={`Enter vendor details to ${vendor ? 'update' : 'add to'} your network`}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={vendor ? 'Update Vendor' : 'Add Vendor'}
      submitDisabled={!formData.name || isLoading}
      isLoading={isLoading}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Vendor Name" required>
          <FormInput
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter vendor name"
            required
          />
        </FormField>

        <FormField label="Service Type" required>
          <FormSelect
            value={formData.serviceType}
            onChange={(value) => setFormData({ ...formData, serviceType: value })}
            options={serviceTypeOptions}
          />
        </FormField>

        <FormField label="Email">
          <FormInput
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="vendor@example.com"
          />
        </FormField>

        <FormField label="Phone">
          <FormInput
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />
        </FormField>

        <FormField label="Contact Person">
          <FormInput
            type="text"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            placeholder="Contact person name"
          />
        </FormField>

        <FormField label="GST Number">
          <FormInput
            type="text"
            value={formData.gstNumber}
            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
            placeholder="GST number (optional)"
          />
        </FormField>
      </div>

      <FormField label="Rating">
        <RatingInput
          value={formData.rating}
          onChange={(rating) => setFormData({ ...formData, rating })}
        />
      </FormField>
    </FormModal>
  );
}

// Vendor Details Modal Component
interface VendorDetailsModalProps {
  vendor: VendorWithStats;
  onClose: () => void;
  onEdit: () => void;
  canEdit: boolean;
}

function VendorDetailsModal({ vendor, onClose, onEdit, canEdit }: VendorDetailsModalProps) {
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

  const contactItems: ModalSection['items'] = [];
  if (vendor.email) {
    contactItems.push({
      label: 'Email',
      value: (
        <a href={`mailto:${vendor.email}`} className="hover:text-primary">
          {vendor.email}
        </a>
      ),
      icon: <Mail size={20} className="text-muted-foreground" />,
    });
  }
  if (vendor.phone) {
    contactItems.push({
      label: 'Phone',
      value: (
        <a href={`tel:${vendor.phone}`} className="hover:text-primary">
          {vendor.phone}
        </a>
      ),
      icon: <Phone size={20} className="text-muted-foreground" />,
    });
  }
  if (vendor.contactPerson) {
    contactItems.push({
      label: 'Contact Person',
      value: vendor.contactPerson,
      icon: <Users size={20} className="text-muted-foreground" />,
    });
  }
  if (vendor.gstNumber) {
    contactItems.push({
      label: 'GST Number',
      value: vendor.gstNumber,
      icon: <FileText size={20} className="text-muted-foreground" />,
    });
  }

  const sections: ModalSection[] = [
    {
      title: 'Contact Information',
      items: contactItems,
    },
    {
      title: 'Performance',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-primary" />
              <span className="text-muted-foreground">Total Spent</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${(vendor.totalSpent || 0).toLocaleString()}</p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-primary" />
              <span className="text-muted-foreground">Events</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{vendor.totalContracts || vendor.eventsCount || 0}</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <DetailsModal
      title={vendor.name}
      subtitle={
        <div className="flex items-center gap-3">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {vendor.category || vendor.serviceType || 'Uncategorized'}
          </span>
          {renderStars(vendor.rating || 0)}
          <span className="text-sm text-muted-foreground">
            {vendor.rating ? `${vendor.rating}/5` : 'No rating'}
          </span>
        </div>
      }
      sections={sections}
      onClose={onClose}
      onEdit={canEdit ? onEdit : undefined}
      actions={
        canEdit
          ? undefined
          : [
            {
              label: 'Close',
              onClick: onClose,
              variant: 'secondary',
            },
          ]
      }
    />
  );
}
