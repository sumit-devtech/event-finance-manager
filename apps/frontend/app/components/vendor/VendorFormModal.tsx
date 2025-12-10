import { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { FormModal, FormField, FormInput, FormSelect, RatingInput } from "~/components/shared";
import { useFormSubmission } from "~/hooks/useFormSubmission";
import toast from "react-hot-toast";
import type { VendorWithStatsFlexible } from "./types";

interface VendorFormModalProps {
  vendor?: VendorWithStatsFlexible | null;
  onClose: () => void;
  fetcher: ReturnType<typeof useFetcher>;
  isDemo?: boolean;
}

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

/**
 * Vendor Form Modal Component
 * Handles creating and editing vendors
 */
export function VendorFormModal({ vendor, onClose, fetcher, isDemo }: VendorFormModalProps) {
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


