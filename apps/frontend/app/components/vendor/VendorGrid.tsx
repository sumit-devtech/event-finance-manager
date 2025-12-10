import { Users } from "~/components/Icons";
import { EmptyState } from "~/components/shared";
import { VendorCard } from "./VendorCard";
import type { VendorWithStatsFlexible } from "./types";

interface VendorGridProps {
  vendors: VendorWithStatsFlexible[];
  canEditVendors: boolean;
  isAdmin: boolean;
  searchQuery: string;
  onViewDetails: (vendor: VendorWithStatsFlexible) => void;
  onEdit: (vendor: VendorWithStatsFlexible) => void;
  onDelete: (vendorId: string) => void;
  onAddVendor: () => void;
}

/**
 * Vendor Grid Component
 * Displays vendors in a grid layout or empty state
 */
export function VendorGrid({
  vendors,
  canEditVendors,
  isAdmin,
  searchQuery,
  onViewDetails,
  onEdit,
  onDelete,
  onAddVendor,
}: VendorGridProps) {
  if (vendors.length === 0) {
    return (
      <EmptyState
        icon={<Users size={48} className="mx-auto text-muted-foreground" />}
        title="No vendors found"
        description={
          searchQuery
            ? 'Try adjusting your search'
            : 'Get started by adding your first vendor'
        }
        actionLabel={canEditVendors ? 'Add Vendor' : undefined}
        onAction={canEditVendors ? onAddVendor : undefined}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {vendors.map((vendor) => (
        <VendorCard
          key={vendor.id}
          vendor={vendor}
          canEditVendors={canEditVendors}
          isAdmin={isAdmin}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}


