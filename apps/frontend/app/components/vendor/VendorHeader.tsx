import { Plus } from "~/components/Icons";
import type { User } from "~/lib/auth";

interface VendorHeaderProps {
  canEditVendors: boolean;
  onAddVendor: () => void;
}

/**
 * Vendor Manager Header Component
 * Displays title and add vendor button
 */
export function VendorHeader({ canEditVendors, onAddVendor }: VendorHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Vendor Manager</h2>
        <p className="text-muted-foreground mt-1">Manage your trusted vendors and suppliers</p>
      </div>
      {canEditVendors && (
        <button
          onClick={onAddVendor}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2 justify-center transition-colors"
        >
          <Plus size={20} />
          <span>Add Vendor</span>
        </button>
      )}
    </div>
  );
}


