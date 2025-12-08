/**
 * Budget Manager Component (Refactored)
 */

import { useState, useEffect } from 'react';
import { useNavigation } from '@remix-run/react';
import toast from 'react-hot-toast';
import type { User } from '~/lib/auth';
import type { EventWithDetails, BudgetItemWithRelations, StrategicGoalType, VendorWithStats, UserWithCounts } from '~/types';
import { ConfirmDialog } from '../shared';
import { demoBudgetLineItems } from '~/lib/demoData';
import { BUDGET_INTENTS, BUDGET_MESSAGES, DEFAULT_BUDGET_FORM_DATA, BUDGET_ITEM_STATUS } from '~/constants/budget';
import { BudgetManagerHeader } from './BudgetManagerHeader';
import { BudgetSummaryStats } from './BudgetSummaryStats';
import { CategoryBreakdown } from './CategoryBreakdown';
import { BudgetTable } from './BudgetTable';
import { BudgetItemForm } from './BudgetItemForm';
import { useBudgetPermissions } from './hooks/useBudgetPermissions';
import { useBudgetTransform } from './hooks/useBudgetTransform';
import { useBudgetActions } from './hooks/useBudgetActions';
import { useBudgetItemActions } from './hooks/useBudgetItemActions';
import { getDefaultFormData, transformBudgetItem } from './utils/budgetTransformers';
import { useFetcher } from '@remix-run/react';
import { validateBudgetForm, validateEventSelection } from './utils/budgetValidators';
import type { BudgetLineItem } from './utils/budgetTransformers';

interface BudgetEvent {
  id: string;
  name: string;
}

interface BudgetManagerProps {
  user: User | null;
  organization?: { name?: string; members?: Array<{ id: string; name: string }> } | null;
  event?: BudgetEvent | null;
  events?: BudgetEvent[];
  budgetItems?: BudgetItemWithRelations[];
  users?: UserWithCounts[];
  strategicGoals?: StrategicGoalType[];
  vendors?: VendorWithStats[];
  isDemo?: boolean;
  actionData?: { success?: boolean; error?: string; message?: string } | null;
  fetcher?: ReturnType<typeof useFetcher>;
  hideApprovalButtons?: boolean;
}

export function BudgetManager({
  user,
  organization,
  event,
  events = [],
  budgetItems = [],
  users = [],
  strategicGoals = [],
  vendors = [],
  isDemo = false,
  actionData,
  fetcher: externalFetcher,
  hideApprovalButtons = false,
}: BudgetManagerProps) {
  const navigation = useNavigation();
  const internalFetcher = useFetcher();
  const fetcher = externalFetcher || internalFetcher;
  const isSubmitting = navigation.state === 'submitting';
  const [showAddLine, setShowAddLine] = useState(false);
  const [wasSubmitting, setWasSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetLineItem | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<{
    category: string;
    subcategory: string;
    description: string;
    estimatedCost: string;
    actualCost: string;
    status: string;
    notes: string;
    assignedUser: string;
    strategicGoalId: string;
    vendor: string;
    vendorId: string;
    fileAttachment: File | null;
  }>(getDefaultFormData());
  const [error, setError] = useState<string | null>(null);
  const [demoBudgetLines, setDemoBudgetLines] = useState<BudgetLineItem[]>(demoBudgetLineItems);

  // Hooks
  const permissions = useBudgetPermissions(user, isDemo);
  const { budgetLines, getEventName } = useBudgetTransform({
    budgetItems,
    events,
    isDemo,
    demoBudgetLines,
    currentUserName: user?.name,
  });
  // Handle successful budget item deletion - refresh data
  const handleDeleteSuccess = () => {
    // Revalidate data to refresh budget items
    if (externalFetcher && event?.id) {
      // If we have external fetcher (from EventDetailsModal), reload event data
      externalFetcher.load(`/events/${event.id}`);
    } else {
      // Otherwise, use navigation revalidation
      window.location.reload();
    }
  };

  const { deleteConfirm, setDeleteConfirm, handleDelete, confirmDelete } = useBudgetActions({
    isDemo,
    demoBudgetLines,
    setDemoBudgetLines,
    fetcher,
    onDeleteSuccess: handleDeleteSuccess,
  });
  const { handleApprove, handleReject } = useBudgetItemActions({
    fetcher,
    isDemo,
    user,
  });

  // Check if user can approve budget items (Admin or EventManager)
  const canApproveBudget = isDemo || (user && (user.role === 'Admin' || user.role === 'EventManager' || user.role === 'admin' || user.role === 'EventManager'));

  // Sync formData when editingItem changes to ensure all fields are populated
  useEffect(() => {
    if (editingItem && showAddLine) {
      const assignedUserId = editingItem.assignedUserId || '';
      setFormData({
        category: editingItem.category || '',
        subcategory: editingItem.subcategory || '',
        description: editingItem.description || '',
        estimatedCost: editingItem.estimatedCost !== undefined && editingItem.estimatedCost !== null ? editingItem.estimatedCost.toString() : '',
        actualCost: editingItem.actualCost !== undefined && editingItem.actualCost !== null ? editingItem.actualCost.toString() : '',
        status: editingItem.status || BUDGET_ITEM_STATUS.PENDING,
        notes: editingItem.notes || '',
        assignedUser: assignedUserId || '',
        strategicGoalId: editingItem.strategicGoalId || '',
        vendor: editingItem.vendor || '',
        vendorId: editingItem.vendorId || '',
        fileAttachment: null,
      });
    }
  }, [editingItem, showAddLine]);

  // Close form when submission completes successfully
  useEffect(() => {
    if (navigation.state === 'submitting') {
      setWasSubmitting(true);
    } else if (navigation.state === 'idle' && wasSubmitting && showAddLine) {
      // Submission completed - check for errors in actionData
      if (actionData && typeof actionData === 'object' && 'error' in actionData) {
        // Error occurred - keep form open and show error
        setError(actionData.error as string);
        setWasSubmitting(false);
      } else if (actionData && typeof actionData === 'object' && ('success' in actionData ? actionData.success !== false : true)) {
        // Success - close form and reset
        setShowAddLine(false);
        setEditingItem(null);
        setFormData(getDefaultFormData());
        setError(null);
        setWasSubmitting(false);

        // Refresh data if we have external fetcher (from EventDetailsModal)
        if (externalFetcher && event?.id) {
          externalFetcher.load(`/events/${event.id}`);
        }
        // Otherwise, data will refresh via route revalidation
      } else {
        setWasSubmitting(false);
      }
    } else if (navigation.state === 'idle') {
      setWasSubmitting(false);
    }
  }, [navigation.state, showAddLine, wasSubmitting, actionData, externalFetcher, event?.id]);

  // Get users for user assignment
  const availableUsers = users.length > 0 ? users : (organization?.members || []);

  const handleSubmit = (e: React.FormEvent) => {
    if (isDemo) {
      e.preventDefault();
      setError(null);
      
      const validation = validateBudgetForm(formData);
      if (!validation.isValid) {
        setError(validation.error || '');
        return;
      }

      const newItem: BudgetLineItem = {
        id: editingItem?.id || Date.now(),
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        actualCost: parseFloat(formData.actualCost) || 0,
        variance: (parseFloat(formData.estimatedCost) || 0) - (parseFloat(formData.actualCost) || 0),
        status: formData.status,
        notes: formData.notes,
        assignedUser: formData.assignedUser,
        strategicGoalId: formData.strategicGoalId,
        vendor: formData.vendor,
        lastEditedBy: user?.name || 'Current User',
        lastEditedAt: new Date().toISOString(),
      };

      if (editingItem) {
        setDemoBudgetLines(demoBudgetLines.map(item => 
          item.id === editingItem.id ? newItem : item
        ));
        toast.success(BUDGET_MESSAGES.UPDATED_SUCCESS);
      } else {
        setDemoBudgetLines([...demoBudgetLines, newItem]);
        toast.success(BUDGET_MESSAGES.CREATED_SUCCESS);
      }
      
      setShowAddLine(false);
      setEditingItem(null);
      setFormData(getDefaultFormData());
      return;
    }

    setError(null);
    const validation = validateEventSelection(editingItem ? editingItem.eventId : event?.id);
    if (!validation.isValid) {
      e.preventDefault();
      setError(validation.error || '');
      return;
    }
  };

  const handleEdit = (item: BudgetLineItem) => {
    setEditingItem(item);
    setShowAddLine(true);
    setError(null);
    // formData will be populated by useEffect when editingItem changes
  };

  const handleAddClick = () => {
    setShowAddLine(true);
    setEditingItem(null);
    setFormData(getDefaultFormData());
    setError(null);
  };

  const handleCloseForm = () => {
    setShowAddLine(false);
    setEditingItem(null);
    setFormData(getDefaultFormData());
    setError(null); // Clear error when form is closed
  };

  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData({ ...formData, ...data });
  };

  const handleToggleExpand = (id: string | number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <BudgetManagerHeader
        event={event}
        events={events}
        budgetLines={budgetLines}
        isDemo={isDemo}
        error={error}
      />

      <BudgetSummaryStats budgetLines={budgetLines} />

      <CategoryBreakdown budgetLines={budgetLines} />

      <BudgetTable
        budgetLines={budgetLines}
        event={event}
        events={events}
        expandedRow={expandedRow}
        onToggleExpand={handleToggleExpand}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onApprove={hideApprovalButtons ? undefined : handleApprove}
        onReject={hideApprovalButtons ? undefined : handleReject}
        onAddClick={handleAddClick}
        canEditBudget={permissions.canEditBudget}
        canApprove={hideApprovalButtons ? false : (canApproveBudget || false)}
        isDemo={isDemo}
        resetForm={() => setFormData(getDefaultFormData())}
      />

      <BudgetItemForm
        isOpen={showAddLine}
        editingItem={editingItem}
        formData={formData}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        onFormDataChange={handleFormDataChange}
        isSubmitting={isSubmitting}
        isDemo={isDemo}
        event={event}
        canEditEstimated={permissions.canEditEstimated}
        canEditActual={permissions.canEditActual}
        availableUsers={availableUsers}
        vendors={vendors}
        strategicGoals={strategicGoals}
        error={error}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, itemId: null })}
        onConfirm={confirmDelete}
        title={BUDGET_MESSAGES.DELETE_BUDGET_ITEM}
        message={BUDGET_MESSAGES.DELETE_CONFIRMATION}
        confirmLabel={BUDGET_MESSAGES.DELETE}
        cancelLabel={BUDGET_MESSAGES.CANCEL}
        variant="danger"
      />
    </div>
  );
}

