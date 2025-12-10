import { Star, Mail, Phone, Users, FileText, DollarSign } from "~/components/Icons";
import { DetailsModal } from "~/components/shared";
import { renderStars } from "./utils";
import type { VendorWithStatsFlexible } from "./types";
import type { ModalSection } from "~/types";

interface VendorDetailsModalProps {
  vendor: VendorWithStatsFlexible;
  onClose: () => void;
  onEdit: () => void;
  canEdit: boolean;
}

/**
 * Vendor Details Modal Component
 * Displays detailed information about a vendor
 */
export function VendorDetailsModal({ vendor, onClose, onEdit, canEdit }: VendorDetailsModalProps) {
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


