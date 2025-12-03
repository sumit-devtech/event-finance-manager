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
import { getDefaultFormData, transformBudgetItem } from './utils/budgetTransformers';
import { validateBudgetForm, validateEventSelection } from './utils/budgetValidators';
import type { BudgetLineItem } from './utils/budgetTransformers';
import type { BudgetFormData } from './BudgetItemForm';

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
}: BudgetManagerProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [showAddLine, setShowAddLine] = useState(false);
  const [wasSubmitting, setWasSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetLineItem | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | number | null>(null);
  const [formData, setFormData] = useState(getDefaultFormData());
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
  const { deleteConfirm, setDeleteConfirm, handleDelete, confirmDelete } = useBudgetActions({
    isDemo,
    demoBudgetLines,
    setDemoBudgetLines,
  });

  // Track deleted items for optimistic updates
  const [deletedItemIds, setDeletedItemIds] = useState<Set<string | number>>(new Set());

  // Filter out deleted items optimistically
  const visibleBudgetLines = budgetLines.filter(item => !deletedItemIds.has(item.id));

  // Enhanced delete handler with optimistic update
  const handleDeleteWithOptimistic = (id: string | number) => {
    // Optimistically remove from view
    setDeletedItemIds(prev => new Set([...prev, id]));
    // Call original delete handler
    handleDelete(id);
  };

  // Clear deleted items when budgetItems refresh (after successful delete)
  // Only clear if the number of budget items actually decreased (indicating successful delete)
  useEffect(() => {
    if (actionData?.success && deletedItemIds.size > 0) {
      // Small delay to ensure state has updated
      const timer = setTimeout(() => {
        setDeletedItemIds(new Set());
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [actionData?.success, budgetItems.length]);

  // Close form when submission completes successfully
  useEffect(() => {
    if (navigation.state === 'submitting') {
      setWasSubmitting(true);
    } else if (navigation.state === 'idle' && wasSubmitting && showAddLine) {
      // Submission completed - check for errors in actionData
      if (actionData?.error) {
        // Error occurred - keep form open and show error
        setError(actionData.error);
        setWasSubmitting(false);

        // Scroll to error message
        setTimeout(() => {
          const formElement = document.querySelector('[data-budget-form]');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else if (actionData?.success !== false) {
        // Success - close form and reset
        setShowAddLine(false);
        setEditingItem(null);
        setFormData(getDefaultFormData());
        setError(null);
        setWasSubmitting(false);
        // Data will refresh via route revalidation
      } else {
        setWasSubmitting(false);
      }
    } else if (navigation.state === 'idle') {
      setWasSubmitting(false);
    }
  }, [navigation.state, showAddLine, wasSubmitting, actionData]);

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
    // Ensure all fields are populated correctly
    const assignedUserId = item.assignedUserId || '';
    setFormData({
      category: item.category || '',
      subcategory: item.subcategory || '',
      description: item.description || '',
      estimatedCost: item.estimatedCost !== undefined && item.estimatedCost !== null ? item.estimatedCost.toString() : '',
      actualCost: item.actualCost !== undefined && item.actualCost !== null ? item.actualCost.toString() : '',
      status: item.status || BUDGET_ITEM_STATUS.PENDING,
      notes: item.notes || '',
      assignedUser: assignedUserId || '',
      strategicGoalId: item.strategicGoalId || '',
      vendor: item.vendor || '',
      vendorId: item.vendorId || '',
      fileAttachment: null,
    });
    setShowAddLine(true);
    setError(null);
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
  };

  const handleFormDataChange = (data: Partial<BudgetFormData>) => {
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

      <BudgetSummaryStats budgetLines={visibleBudgetLines} />

      <CategoryBreakdown budgetLines={visibleBudgetLines} />

      <BudgetTable
        budgetLines={visibleBudgetLines}
        event={event}
        events={events}
        expandedRow={expandedRow}
        onToggleExpand={handleToggleExpand}
        onEdit={handleEdit}
        onDelete={handleDeleteWithOptimistic}
        onAddClick={handleAddClick}
        canEditBudget={permissions.canEditBudget}
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

