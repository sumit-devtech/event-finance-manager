import { Mail, Phone, Users } from "~/components/Icons";
import { DataCard } from "~/components/shared";
import { renderStars } from "./utils";
import type { VendorWithStatsFlexible } from "./types";
import type { CardMetadata, CardStat, ActionButtonConfig } from "~/types";

interface VendorCardProps {
  vendor: VendorWithStatsFlexible;
  canEditVendors: boolean;
  isAdmin: boolean;
  onViewDetails: (vendor: VendorWithStatsFlexible) => void;
  onEdit: (vendor: VendorWithStatsFlexible) => void;
  onDelete: (vendorId: string) => void;
}

/**
 * Vendor Card Component
 * Displays individual vendor information in a card format
 */
export function VendorCard({
  vendor,
  canEditVendors,
  isAdmin,
  onViewDetails,
  onEdit,
  onDelete,
}: VendorCardProps) {
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
      onClick: () => onViewDetails(vendor),
      variant: 'primary',
    },
  ];

  if (canEditVendors) {
    actions.push({
      label: 'Edit',
      onClick: () => onEdit(vendor),
      variant: 'secondary',
    });
  }

  if (isAdmin) {
    actions.push({
      label: 'Delete',
      onClick: () => onDelete(vendor.id),
      variant: 'danger',
      requireConfirm: true,
      confirmMessage: 'Are you sure you want to delete this vendor?',
    });
  }

  return (
    <DataCard
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
}


