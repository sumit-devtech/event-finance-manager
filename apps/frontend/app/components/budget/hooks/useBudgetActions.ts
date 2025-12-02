/**
 * Hook for budget item actions
 */

import { useState } from 'react';
import toast from 'react-hot-toast';
import { BUDGET_INTENTS, BUDGET_MESSAGES } from '~/constants/budget';
import type { BudgetLineItem } from '../utils/budgetTransformers';

interface UseBudgetActionsProps {
  isDemo: boolean;
  demoBudgetLines: BudgetLineItem[];
  setDemoBudgetLines: (lines: BudgetLineItem[]) => void;
}

export function useBudgetActions({
  isDemo,
  demoBudgetLines,
  setDemoBudgetLines,
}: UseBudgetActionsProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; itemId: string | number | null }>({
    isOpen: false,
    itemId: null,
  });

  const handleDelete = (id: string | number) => {
    setDeleteConfirm({ isOpen: true, itemId: id });
  };

  const confirmDelete = () => {
    if (!deleteConfirm.itemId) return;

    if (isDemo) {
      setDemoBudgetLines(demoBudgetLines.filter(item => item.id !== deleteConfirm.itemId));
      toast.success(BUDGET_MESSAGES.DELETE_SUCCESS);
    } else {
      const form = document.createElement('form');
      form.method = 'post';
      form.action = window.location.pathname;
      
      const intentInput = document.createElement('input');
      intentInput.type = 'hidden';
      intentInput.name = 'intent';
      intentInput.value = BUDGET_INTENTS.DELETE_BUDGET_ITEM;
      form.appendChild(intentInput);
      
      const idInput = document.createElement('input');
      idInput.type = 'hidden';
      idInput.name = 'budgetItemId';
      idInput.value = deleteConfirm.itemId.toString();
      form.appendChild(idInput);
      
      document.body.appendChild(form);
      form.submit();
      toast.success(BUDGET_MESSAGES.DELETE_SUCCESS);
    }
    setDeleteConfirm({ isOpen: false, itemId: null });
  };

  return {
    deleteConfirm,
    setDeleteConfirm,
    handleDelete,
    confirmDelete,
  };
}

