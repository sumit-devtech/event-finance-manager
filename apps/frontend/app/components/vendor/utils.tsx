import { Star } from "~/components/Icons";

/**
 * Renders star rating component
 */
export function renderStars(rating: number) {
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
}

/**
 * Filters vendors based on search query and category
 */
export function filterVendors(
  vendors: Array<{ name?: string | null; category?: string | null; serviceType?: string | null }>,
  searchQuery: string,
  filterCategory: string
) {
  return vendors.filter((vendor) => {
    const matchesSearch = vendor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.serviceType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === 'all' || vendor.category === filterCategory || vendor.serviceType === filterCategory;
    return matchesSearch && matchesFilter;
  });
}

/**
 * Calculates vendor statistics
 */
export function calculateVendorStats(vendors: Array<{ totalSpent?: number | null; totalContracts?: number | null; rating?: number | null }>) {
  const totalSpent = vendors.reduce((sum, v) => sum + (v.totalSpent || 0), 0);
  const totalContracts = vendors.reduce((sum, v) => sum + (v.totalContracts || 0), 0);
  const avgRating = vendors.length > 0 
    ? vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.length 
    : 0;

  return { totalSpent, totalContracts, avgRating };
}

