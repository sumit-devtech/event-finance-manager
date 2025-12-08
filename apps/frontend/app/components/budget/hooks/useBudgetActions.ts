/**
 * Hook for budget item actions
 */

import { useState, useEffect, useRef } from 'react';
import { useFetcher } from '@remix-run/react';
import toast from 'react-hot-toast';
import { BUDGET_INTENTS, BUDGET_MESSAGES } from '~/constants/budget';
import type { BudgetLineItem } from '../utils/budgetTransformers';

interface UseBudgetActionsProps {
  isDemo: boolean;
  demoBudgetLines: BudgetLineItem[];
  setDemoBudgetLines: (lines: BudgetLineItem[]) => void;
  fetcher?: ReturnType<typeof useFetcher>;
  onDeleteSuccess?: () => void;
}

export function useBudgetActions({
  isDemo,
  demoBudgetLines,
  setDemoBudgetLines,
  fetcher: externalFetcher,
  onDeleteSuccess,
}: UseBudgetActionsProps) {
  const internalFetcher = useFetcher();
  const fetcher = externalFetcher || internalFetcher;
  const wasSubmittingRef = useRef(false);
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; itemId: string | number | null }>({
    isOpen: false,
    itemId: null,
  });

  // Handle successful deletion
  useEffect(() => {
    if (!fetcher || isDemo) return;

    const currentState = fetcher.state;
    const previousState = wasSubmittingRef.current;

    // Track when we start submitting
    if (currentState === 'submitting' && !previousState) {
      wasSubmittingRef.current = true;
    }

    // When fetcher completes successfully
    if (currentState === 'idle' && wasSubmittingRef.current) {
      wasSubmittingRef.current = false;
      
      if (fetcher.data) {
        const data = fetcher.data as any;
        if (data.success && data.message) {
          toast.success(data.message);
          setDeleteConfirm({ isOpen: false, itemId: null });
          // Call success callback to refresh data
          if (onDeleteSuccess) {
            onDeleteSuccess();
          }
        } else if (data.error) {
          toast.error(data.error);
          // Keep dialog open on error so user can retry
        }
      }
    }
  }, [fetcher?.state, fetcher?.data, isDemo, onDeleteSuccess]);

  const handleDelete = (id: string | number) => {
    setDeleteConfirm({ isOpen: true, itemId: id });
  };

  const confirmDelete = () => {
    if (!deleteConfirm.itemId) return;

    if (isDemo) {
      setDemoBudgetLines(demoBudgetLines.filter(item => item.id !== deleteConfirm.itemId));
      toast.success(BUDGET_MESSAGES.DELETE_SUCCESS);
      setDeleteConfirm({ isOpen: false, itemId: null });
    } else {
      // Use fetcher instead of form submission to avoid page reload
      const formData = new FormData();
      formData.append('intent', BUDGET_INTENTS.DELETE_BUDGET_ITEM);
      formData.append('budgetItemId', deleteConfirm.itemId.toString());
      
      // Submit to /events route which returns JSON (not redirect)
      fetcher.submit(formData, { method: 'post', action: '/events' });
      // Don't close dialog here - wait for success response
    }
  };

  return {
    deleteConfirm,
    setDeleteConfirm,
    handleDelete,
    confirmDelete,
  };
}

