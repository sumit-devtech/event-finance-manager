import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useActionData, useNavigation, Link, useSubmit, useRevalidator } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session.server";
import { useState, useEffect } from "react";
import type { SubmitFunction } from "@remix-run/react";
import { BudgetItemCategory } from "@event-finance-manager/database";
import { ConfirmDialog, Dropdown } from "~/components/shared";
import toast from "react-hot-toast";

interface Event {
  id: string;
  name: string;
  description: string | null;
  client: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  assignments: Array<{
    id: string;
    role: string | null;
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
    };
  }>;
  _count: {
    files: number;
    budgetItems: number;
    activityLogs: number;
  };
}

interface BudgetItemFile {
  id: string;
  filename: string;
  mimeType: string | null;
  size: number | null;
  uploadedAt: string;
}

interface BudgetItem {
  id: string;
  eventId: string;
  category: BudgetItemCategory;
  description: string;
  estimatedCost: number | null;
  actualCost: number | null;
  vendor: string | null;
  createdAt: string;
  updatedAt: string;
  files: BudgetItemFile[];
}

interface BudgetTotals {
  totalsByCategory: Record<string, { estimated: number; actual: number }>;
  summary: {
    totalEstimated: number;
    totalActual: number;
    variance: number;
    variancePercentage: number;
  };
}

interface Variance {
  variance: number;
  variancePercentage: number;
  isOverBudget: boolean;
}

interface LoaderData {
  event: Event;
  budgetItems: BudgetItem[];
  totals: BudgetTotals;
  variance: Variance;
}

interface ActionData {
  error?: string;
  success?: boolean;
  fieldErrors?: {
    category?: string;
    description?: string;
    estimatedCost?: string;
    actualCost?: string;
  };
}

/**
 * Loader - fetch budget items, totals, and variance
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  if (!token) {
    throw redirect("/login");
  }

  const eventId = params.id;
  if (!eventId) {
    throw redirect("/events");
  }

  try {
    const [event, budgetItems, totals, variance] = await Promise.all([
      api.get<Event>(`/events/${eventId}`, { token }),
      api.get<BudgetItem[]>(`/events/${eventId}/budget-items`, { token }),
      api.get<BudgetTotals>(`/events/${eventId}/budget-items/totals`, { token }),
      api.get<Variance>(`/events/${eventId}/budget-items/variance`, { token }),
    ]);

    return json<LoaderData>(
      {
        event,
        budgetItems,
        totals,
        variance,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    );
  } catch (error: any) {
    console.error("Failed to fetch budget data:", error);
    if (error.statusCode === 404) {
      throw redirect("/events");
    }
    throw json({ error: "Failed to load budget data" }, { status: 500 });
  }
}

/**
 * Action - handle budget item CRUD and file uploads
 */
export async function action({ request, params }: ActionFunctionArgs) {
  await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  if (!token) {
    return json<ActionData>({ error: "Unauthorized" }, { status: 401 });
  }

  const eventId = params.id;
  if (!eventId) {
    return json<ActionData>({ error: "Event ID is required" }, { status: 400 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    if (intent === "create") {
      const category = formData.get("category") as BudgetItemCategory;
      const description = formData.get("description") as string;
      const estimatedCost = formData.get("estimatedCost")
        ? parseFloat(formData.get("estimatedCost") as string)
        : undefined;
      const actualCost = formData.get("actualCost")
        ? parseFloat(formData.get("actualCost") as string)
        : undefined;
      const vendor = formData.get("vendor") as string | undefined;

      // Validation
      const fieldErrors: ActionData["fieldErrors"] = {};
      if (!category || !Object.values(BudgetItemCategory).includes(category)) {
        fieldErrors.category = "Category is required";
      }
      if (!description || description.trim().length === 0) {
        fieldErrors.description = "Description is required";
      }
      if (estimatedCost !== undefined && estimatedCost < 0) {
        fieldErrors.estimatedCost = "Estimated cost cannot be negative";
      }
      if (actualCost !== undefined && actualCost < 0) {
        fieldErrors.actualCost = "Actual cost cannot be negative";
      }

      if (Object.keys(fieldErrors).length > 0) {
        return json<ActionData>({ fieldErrors }, { status: 400 });
      }

      await api.post(
        `/events/${eventId}/budget-items`,
        {
          category,
          description,
          estimatedCost,
          actualCost,
          vendor,
        },
        { token },
      );

      return redirect(`/events/${eventId}/budget`);
    }

    if (intent === "update") {
      const budgetItemId = formData.get("budgetItemId") as string;
      const category = formData.get("category") as BudgetItemCategory | undefined;
      const description = formData.get("description") as string | undefined;
      const estimatedCost = formData.get("estimatedCost")
        ? parseFloat(formData.get("estimatedCost") as string)
        : undefined;
      const actualCost = formData.get("actualCost")
        ? parseFloat(formData.get("actualCost") as string)
        : undefined;
      const vendor = formData.get("vendor") as string | undefined;

      // Validation
      const fieldErrors: ActionData["fieldErrors"] = {};
      if (category && !Object.values(BudgetItemCategory).includes(category)) {
        fieldErrors.category = "Invalid category";
      }
      if (description !== null && description !== undefined && description.trim().length === 0) {
        fieldErrors.description = "Description cannot be empty";
      }
      if (estimatedCost !== undefined && estimatedCost < 0) {
        fieldErrors.estimatedCost = "Estimated cost cannot be negative";
      }
      if (actualCost !== undefined && actualCost < 0) {
        fieldErrors.actualCost = "Actual cost cannot be negative";
      }

      if (Object.keys(fieldErrors).length > 0) {
        return json<ActionData>({ fieldErrors }, { status: 400 });
      }

      const updateData: Record<string, any> = {};
      if (category) updateData.category = category;
      if (description !== null && description !== undefined) updateData.description = description;
      if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;
      if (actualCost !== undefined) updateData.actualCost = actualCost;
      if (vendor !== null && vendor !== undefined) updateData.vendor = vendor;

      await api.put(`/budget-items/${budgetItemId}`, updateData, { token });

      return redirect(`/events/${eventId}/budget`);
    }

    if (intent === "delete") {
      const budgetItemId = formData.get("budgetItemId") as string;
      await api.delete(`/budget-items/${budgetItemId}`, { token });
      return redirect(`/events/${eventId}/budget`);
    }

    if (intent === "uploadReceipt") {
      const budgetItemId = formData.get("budgetItemId") as string;
      const file = formData.get("file") as File;

      if (!file) {
        return json<ActionData>({ error: "No file selected" }, { status: 400 });
      }

      // Use the API client's upload method
      await api.upload(`/budget-items/${budgetItemId}/files`, file, {}, { token });
      return redirect(`/events/${eventId}/budget`);
    }

    if (intent === "deleteFile") {
      const budgetItemId = formData.get("budgetItemId") as string;
      const fileId = formData.get("fileId") as string;
      await api.delete(`/budget-items/${budgetItemId}/files/${fileId}`, { token });
      return redirect(`/events/${eventId}/budget`);
    }

    return json<ActionData>({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Action error:", error);
    return json<ActionData>(
      {
        error: error.message || "An error occurred",
      },
      { status: 500 },
    );
  }
}

export default function BudgetPage() {
  const { event, budgetItems, totals, variance } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const revalidator = useRevalidator();
  const isSubmitting = navigation.state === "submitting";

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<string | null>(null);

  // Group budget items by category
  const itemsByCategory = budgetItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<BudgetItemCategory, BudgetItem[]>,
  );

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate variance for a single item
  const calculateItemVariance = (item: BudgetItem) => {
    const estimated = item.estimatedCost || 0;
    const actual = item.actualCost || 0;
    return actual - estimated;
  };

  // Get variance color
  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "text-red-600 font-semibold";
    if (variance < 0) return "text-green-600 font-semibold";
    return "text-gray-600";
  };

  // Get variance indicator
  const getVarianceIndicator = (variance: number) => {
    if (variance > 0) return "▲ Over";
    if (variance < 0) return "▼ Under";
    return "✓ On";
  };

  // Format file size
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle receipt upload
  const handleReceiptUpload = (budgetItemId: string, file: File) => {
    const formData = new FormData();
    formData.append("intent", "uploadReceipt");
    formData.append("budgetItemId", budgetItemId);
    formData.append("file", file);
    submit(formData, { method: "post", encType: "multipart/form-data" });
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'file' | 'budgetItem' | null;
    budgetItemId: string | null;
    fileId: string | null;
  }>({
    isOpen: false,
    type: null,
    budgetItemId: null,
    fileId: null,
  });

  // Handle file delete
  const handleDeleteFile = (budgetItemId: string, fileId: string) => {
    setDeleteConfirm({ isOpen: true, type: 'file', budgetItemId, fileId });
  };

  const confirmDelete = () => {
    if (!deleteConfirm.budgetItemId || !deleteConfirm.type) return;

    if (deleteConfirm.type === 'file' && deleteConfirm.fileId) {
      const formData = new FormData();
      formData.append("intent", "deleteFile");
      formData.append("budgetItemId", deleteConfirm.budgetItemId);
      formData.append("fileId", deleteConfirm.fileId);
      submit(formData, { method: "post" });
      toast.success('Receipt deleted successfully');
    } else if (deleteConfirm.type === 'budgetItem' && deleteConfirm.budgetItemId) {
      const formData = new FormData();
      formData.append("intent", "delete");
      formData.append("budgetItemId", deleteConfirm.budgetItemId);
      submit(formData, { method: "post" });
      toast.success('Budget item deleted successfully');
    }
    setDeleteConfirm({ isOpen: false, type: null, budgetItemId: null, fileId: null });
  };

  // Revalidate after successful actions
  useEffect(() => {
    if (navigation.state === "idle" && actionData?.success !== undefined) {
      const timer = setTimeout(() => {
        revalidator.revalidate();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [navigation.state, actionData, revalidator]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link
            to={`/events/${event.id}`}
            className="text-indigo-600 hover:text-indigo-900 mb-2 inline-block"
          >
            ← Back to Event
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Budget Planning</h1>
          <p className="text-sm text-gray-600 mt-1">{event.name}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedItem(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Budget Item
        </button>
      </div>

      {/* Error Message */}
      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {actionData.error}
        </div>
      )}

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Estimated</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totals.summary.totalEstimated)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Actual</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totals.summary.totalActual)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Variance</div>
          <div className={`text-2xl font-bold ${getVarianceColor(totals.summary.variance)}`}>
            {formatCurrency(totals.summary.variance)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {totals.summary.variancePercentage > 0 ? "+" : ""}
            {totals.summary.variancePercentage.toFixed(1)}%
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Status</div>
          <div
            className={`text-2xl font-bold ${
              variance.isOverBudget ? "text-red-600" : "text-green-600"
            }`}
          >
            {variance.isOverBudget ? "Over Budget" : "On Budget"}
          </div>
        </div>
      </div>

      {/* Over-Budget Alert */}
      {variance.isOverBudget && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Over Budget Alert: The actual costs exceed the estimated budget by{" "}
                {formatCurrency(Math.abs(totals.summary.variance))} (
                {Math.abs(totals.summary.variancePercentage).toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Items by Category */}
      {Object.keys(itemsByCategory).length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg mb-2">No budget items yet</p>
          <p className="text-gray-400 text-sm mb-4">
            Get started by adding your first budget item
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedItem(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Budget Item
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(itemsByCategory).map(([category, items]) => {
            const categoryTotals = totals.totalsByCategory[category] || {
              estimated: 0,
              actual: 0,
            };
            const categoryVariance = categoryTotals.actual - categoryTotals.estimated;

            return (
              <div key={category} className="bg-white shadow rounded-lg overflow-hidden">
                {/* Category Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
                    <div className="flex items-center space-x-4 text-sm">
                      <div>
                        <span className="text-gray-600">Estimated: </span>
                        <span className="font-medium">{formatCurrency(categoryTotals.estimated)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Actual: </span>
                        <span className="font-medium">{formatCurrency(categoryTotals.actual)}</span>
                      </div>
                      <div className={getVarianceColor(categoryVariance)}>
                        <span>Variance: </span>
                        <span className="font-semibold">
                          {getVarianceIndicator(categoryVariance)} {formatCurrency(Math.abs(categoryVariance))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Items Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendor
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estimated
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actual
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Variance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Receipts
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item) => {
                        const itemVariance = calculateItemVariance(item);
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {item.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.vendor || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatCurrency(item.estimatedCost)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatCurrency(item.actualCost)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getVarianceColor(itemVariance)}`}>
                              {getVarianceIndicator(itemVariance)} {formatCurrency(Math.abs(itemVariance))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {item.files.length > 0 ? (
                                  <span className="text-sm text-gray-600">
                                    {item.files.length} file{item.files.length !== 1 ? "s" : ""}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">No receipts</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setShowReceiptModal(item.id)}
                                  className="text-xs text-indigo-600 hover:text-indigo-900"
                                >
                                  {item.files.length > 0 ? "Manage" : "Upload"}
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setShowAddModal(true);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteConfirm({ isOpen: true, type: 'budgetItem', budgetItemId: item.id, fileId: null });
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                  disabled={isSubmitting}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Budget Item Modal */}
      {showAddModal && (
        <BudgetItemFormModal
          eventId={event.id}
          item={selectedItem}
          onClose={() => {
            setShowAddModal(false);
            setSelectedItem(null);
          }}
          isLoading={isSubmitting}
          actionData={actionData}
        />
      )}

      {/* Receipt Upload Modal */}
      {showReceiptModal && (
        <ReceiptUploadModal
          budgetItemId={showReceiptModal}
          budgetItem={budgetItems.find((item) => item.id === showReceiptModal) || null}
          onClose={() => setShowReceiptModal(null)}
          onUpload={handleReceiptUpload}
          onDelete={handleDeleteFile}
          isLoading={isSubmitting}
          submit={submit}
        />
      )}
    </div>
  );
}

// Budget Item Form Modal Component
function BudgetItemFormModal({
  eventId,
  item,
  onClose,
  isLoading,
  actionData,
}: {
  eventId: string;
  item: BudgetItem | null;
  onClose: () => void;
  isLoading: boolean;
  actionData: ActionData | undefined;
}) {
  const submit = useSubmit();
  const [category, setCategory] = useState(item?.category || "");

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">
          {item ? "Edit Budget Item" : "Add Budget Item"}
        </h2>
        <Form
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            formData.append("intent", item ? "update" : "create");
            if (item) {
              formData.append("budgetItemId", item.id);
            }
            submit(formData, { method: "post" });
            onClose();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <input type="hidden" name="category" value={category} />
              <Dropdown
                value={category}
                onChange={setCategory}
                options={[
                  { value: '', label: 'Select category' },
                  ...Object.values(BudgetItemCategory).map((cat) => ({
                    value: cat,
                    label: cat,
                  })),
                ]}
                placeholder="Select category"
                error={actionData?.fieldErrors?.category}
              />
              {actionData?.fieldErrors?.category && (
                <p className="mt-1 text-sm text-red-600">{actionData.fieldErrors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={3}
                defaultValue={item?.description || ""}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  actionData?.fieldErrors?.description ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter budget item description..."
              />
              {actionData?.fieldErrors?.description && (
                <p className="mt-1 text-sm text-red-600">{actionData.fieldErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  name="estimatedCost"
                  step="0.01"
                  min="0"
                  defaultValue={item?.estimatedCost || ""}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    actionData?.fieldErrors?.estimatedCost ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {actionData?.fieldErrors?.estimatedCost && (
                  <p className="mt-1 text-sm text-red-600">{actionData.fieldErrors.estimatedCost}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Cost
                </label>
                <input
                  type="number"
                  name="actualCost"
                  step="0.01"
                  min="0"
                  defaultValue={item?.actualCost || ""}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    actionData?.fieldErrors?.actualCost ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {actionData?.fieldErrors?.actualCost && (
                  <p className="mt-1 text-sm text-red-600">{actionData.fieldErrors.actualCost}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
              <input
                type="text"
                name="vendor"
                defaultValue={item?.vendor || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter vendor name..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Saving..." : item ? "Update" : "Create"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

// Receipt Upload Modal Component
function ReceiptUploadModal({
  budgetItemId,
  budgetItem,
  onClose,
  onUpload,
  onDelete,
  isLoading,
  submit,
}: {
  budgetItemId: string;
  budgetItem: BudgetItem | null;
  onClose: () => void;
  onUpload: (budgetItemId: string, file: File) => void;
  onDelete: (budgetItemId: string, fileId: string) => void;
  isLoading: boolean;
  submit: SubmitFunction;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(budgetItemId, selectedFile);
      setSelectedFile(null);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Manage Receipts</h2>
        {budgetItem && (
          <p className="text-sm text-gray-600 mb-4">
            {budgetItem.description} - {budgetItem.category}
          </p>
        )}

        {/* Upload Section */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Receipt
          </label>
          <input
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {selectedFile && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Uploading..." : "Upload Receipt"}
          </button>
        </div>

        {/* Existing Files */}
        {budgetItem && budgetItem.files.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Receipts</h3>
            <div className="space-y-2">
              {budgetItem.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size)} •{" "}
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(budgetItemId, file.id)}
                    className="ml-4 text-red-600 hover:text-red-900 text-sm"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

