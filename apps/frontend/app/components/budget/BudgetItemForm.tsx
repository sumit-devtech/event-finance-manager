/**
 * Budget Item Form Component
 */

import { Form } from '@remix-run/react';
import { X } from '../Icons';
import { Dropdown } from '../shared';
import {
  BUDGET_INTENTS,
  BUDGET_FORM_FIELDS,
  BUDGET_MESSAGES,
  BUDGET_FORM_LABELS,
  BUDGET_ITEM_CATEGORY_OPTIONS,
  BUDGET_ITEM_STATUS_OPTIONS,
  DEFAULT_BUDGET_FORM_DATA,
} from '~/constants/budget';
import { DEFAULT_STRINGS } from '~/constants/common';
import type { BudgetLineItem } from './utils/budgetTransformers';
import type { StrategicGoalType, VendorWithStats, UserWithCounts } from '~/types';

export interface BudgetFormData {
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
}

interface BudgetItemFormProps {
  isOpen: boolean;
  editingItem: BudgetLineItem | null;
  formData: BudgetFormData;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: Partial<BudgetFormData>) => void;
  isSubmitting: boolean;
  isDemo: boolean;
  event?: { id: string } | null;
  canEditEstimated: boolean;
  canEditActual: boolean;
  availableUsers: Array<UserWithCounts | { id: string; name?: string; fullName?: string; email?: string }>;
  vendors: VendorWithStats[];
  strategicGoals: StrategicGoalType[];
}

export function BudgetItemForm({
  isOpen,
  editingItem,
  formData,
  onClose,
  onSubmit,
  onFormDataChange,
  isSubmitting,
  isDemo,
  event,
  canEditEstimated,
  canEditActual,
  availableUsers,
  vendors,
  strategicGoals,
}: BudgetItemFormProps) {
  if (!isOpen) return null;

  const handleVendorChange = (value: string) => {
    const selectedVendor = vendors.find(v => v.id === value);
    onFormDataChange({
      vendor: selectedVendor?.name || '',
      vendorId: value || '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {editingItem ? BUDGET_MESSAGES.EDIT_BUDGET_ITEM : BUDGET_MESSAGES.ADD_BUDGET_ITEM}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <Form
          data-budget-form
          method="post"
          action={event?.id ? `/events/${event.id}` : undefined}
          onSubmit={onSubmit}
          encType={formData.fileAttachment ? "multipart/form-data" : undefined}
          className="p-6 space-y-4"
        >
          {isDemo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
              <p className="font-medium">{BUDGET_MESSAGES.DEMO_MODE_TITLE}</p>
              <p className="text-sm mt-1">{BUDGET_MESSAGES.DEMO_MODE_DESCRIPTION}</p>
            </div>
          )}

          <input
            type="hidden"
            name={BUDGET_FORM_FIELDS.INTENT}
            value={editingItem ? BUDGET_INTENTS.UPDATE_BUDGET_ITEM : BUDGET_INTENTS.CREATE_BUDGET_ITEM}
          />
          {editingItem && (
            <input
              type="hidden"
              name={BUDGET_FORM_FIELDS.BUDGET_ITEM_ID}
              value={editingItem.id.toString()}
            />
          )}
          {editingItem?.eventId && (
            <input
              type="hidden"
              name={BUDGET_FORM_FIELDS.EVENT_ID}
              value={editingItem.eventId}
            />
          )}
          {!editingItem && event?.id && (
            <input
              type="hidden"
              name={BUDGET_FORM_FIELDS.EVENT_ID}
              value={event.id}
            />
          )}

          {/* Hidden inputs for controlled Dropdown fields */}
          <input type="hidden" name={BUDGET_FORM_FIELDS.CATEGORY} value={formData.category} />
          <input type="hidden" name={BUDGET_FORM_FIELDS.STATUS} value={formData.status} />
          <input type="hidden" name="assignedUserId" value={formData.assignedUser} />
          <input type="hidden" name={BUDGET_FORM_FIELDS.STRATEGIC_GOAL_ID} value={formData.strategicGoalId} />
          <input type="hidden" name={BUDGET_FORM_FIELDS.VENDOR_ID} value={formData.vendorId} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {BUDGET_FORM_LABELS.CATEGORY} *
              </label>
              <Dropdown
                value={formData.category}
                onChange={(value) => onFormDataChange({ category: value })}
                options={[...BUDGET_ITEM_CATEGORY_OPTIONS]}
                placeholder={BUDGET_FORM_LABELS.SELECT_CATEGORY}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {BUDGET_FORM_LABELS.SUBCATEGORY}
              </label>
              <input
                type="text"
                name={BUDGET_FORM_FIELDS.SUBCATEGORY}
                value={formData.subcategory}
                onChange={(e) => onFormDataChange({ subcategory: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={BUDGET_FORM_LABELS.SUBCATEGORY_PLACEHOLDER}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {BUDGET_FORM_LABELS.DESCRIPTION} *
            </label>
            <input
              type="text"
              name={BUDGET_FORM_FIELDS.DESCRIPTION}
              value={formData.description}
              onChange={(e) => onFormDataChange({ description: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={BUDGET_FORM_LABELS.DESCRIPTION_PLACEHOLDER}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {BUDGET_FORM_LABELS.ESTIMATED_SPEND}
                {!canEditEstimated && (
                  <span className="text-gray-400 text-xs ml-2">{BUDGET_FORM_LABELS.READ_ONLY}</span>
                )}
              </label>
              <input
                type="number"
                name={BUDGET_FORM_FIELDS.ESTIMATED_COST}
                value={formData.estimatedCost}
                onChange={(e) => onFormDataChange({ estimatedCost: e.target.value })}
                min="0"
                step="0.01"
                disabled={!canEditEstimated}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !canEditEstimated ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder={BUDGET_FORM_LABELS.COST_PLACEHOLDER}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {BUDGET_FORM_LABELS.ACTUAL_SPEND}
                {!canEditActual && (
                  <span className="text-gray-400 text-xs ml-2">{BUDGET_FORM_LABELS.READ_ONLY}</span>
                )}
              </label>
              <input
                type="number"
                name={BUDGET_FORM_FIELDS.ACTUAL_COST}
                value={formData.actualCost}
                onChange={(e) => onFormDataChange({ actualCost: e.target.value })}
                min="0"
                step="0.01"
                disabled={!canEditActual}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !canEditActual ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder={BUDGET_FORM_LABELS.COST_PLACEHOLDER}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {BUDGET_FORM_LABELS.STATUS} *
              </label>
              <Dropdown
                value={formData.status}
                onChange={(value) => onFormDataChange({ status: value })}
                options={[...BUDGET_ITEM_STATUS_OPTIONS]}
                placeholder={BUDGET_FORM_LABELS.SELECT_STATUS}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {BUDGET_FORM_LABELS.ASSIGNED_USER}
              </label>
              <Dropdown
                value={formData.assignedUser}
                onChange={(value) => onFormDataChange({ assignedUser: value })}
                options={[
                  { value: '', label: BUDGET_FORM_LABELS.SELECT_USER },
                  ...availableUsers.map((member: any) => {
                    const userId = member.id;
                    const displayName = member.fullName || member.name || member.email || DEFAULT_STRINGS.UNKNOWN;
                    return { value: userId, label: displayName };
                  }),
                ]}
                placeholder={BUDGET_FORM_LABELS.SELECT_USER}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {BUDGET_FORM_LABELS.VENDOR}
            </label>
            <Dropdown
              value={formData.vendorId || ''}
              onChange={handleVendorChange}
              options={[
                { value: '', label: BUDGET_FORM_LABELS.NO_VENDOR_SELECTED },
                ...vendors.map((vendor) => ({
                  value: vendor.id,
                  label: `${vendor.name}${vendor.serviceType ? ` (${vendor.serviceType})` : ''}`,
                })),
              ]}
              placeholder={BUDGET_FORM_LABELS.NO_VENDOR_SELECTED}
            />
            {vendors.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {BUDGET_FORM_LABELS.NO_VENDORS_AVAILABLE}{' '}
                <a href="/vendors" className="text-blue-600 hover:underline">
                  {BUDGET_FORM_LABELS.ADD_VENDORS}
                </a>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {BUDGET_FORM_LABELS.STRATEGIC_GOAL_MAPPING}
            </label>
            <Dropdown
              value={formData.strategicGoalId}
              onChange={(value) => onFormDataChange({ strategicGoalId: value })}
              options={[
                { value: '', label: BUDGET_FORM_LABELS.NO_STRATEGIC_GOAL },
                ...strategicGoals.map((goal: any) => ({
                  value: goal.id,
                  label: goal.title,
                })),
              ]}
              placeholder={BUDGET_FORM_LABELS.NO_STRATEGIC_GOAL}
            />
            {strategicGoals.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {BUDGET_FORM_LABELS.NO_STRATEGIC_GOALS_AVAILABLE}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {BUDGET_FORM_LABELS.NOTES}
            </label>
            <textarea
              name={BUDGET_FORM_FIELDS.NOTES}
              value={formData.notes}
              onChange={(e) => onFormDataChange({ notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={BUDGET_FORM_LABELS.ADD_NOTES_PLACEHOLDER}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {BUDGET_FORM_LABELS.FILE_ATTACHMENT}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                name={BUDGET_FORM_FIELDS.FILE_ATTACHMENT}
                onChange={(e) => onFormDataChange({ fileAttachment: e.target.files?.[0] || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.fileAttachment && (
                <span className="text-sm text-gray-600">{formData.fileAttachment.name}</span>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingItem ? BUDGET_MESSAGES.UPDATING : BUDGET_MESSAGES.ADDING}
                </>
              ) : (
                editingItem ? BUDGET_MESSAGES.UPDATE : BUDGET_MESSAGES.ADD
              )} {BUDGET_MESSAGES.LINE_ITEM}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {BUDGET_MESSAGES.CANCEL}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

