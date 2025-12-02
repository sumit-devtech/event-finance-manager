import { useState, useEffect } from "react";
import { Dropdown } from "./";
import { ChevronRight, ChevronLeft, Check, FileText, DollarSign, Calendar, X, Loader } from "../Icons";
import type { EventWithDetails, VendorWithStats } from "~/types";
import toast from "react-hot-toast";

interface ExpenseWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  events: EventWithDetails[];
  vendors: VendorWithStats[];
  event?: EventWithDetails | null;
  isLoading?: boolean;
}

export interface ExpenseFormData {
  eventId: string;
  category: string;
  title: string;
  amount: string;
  vendorId: string;
  description: string;
  date: string;
  file?: File | null;
}

const STEPS = [
  { id: 1, label: "Event & Category", icon: Calendar },
  { id: 2, label: "Details", icon: FileText },
  { id: 3, label: "Amount & Vendor", icon: DollarSign },
  { id: 4, label: "Review", icon: Check },
];

const CATEGORIES = [
  "Venue",
  "Catering",
  "Marketing",
  "Logistics",
  "Entertainment",
  "StaffTravel",
  "Miscellaneous",
];

export function ExpenseWizard({
  isOpen,
  onClose,
  onSubmit,
  events,
  vendors,
  event,
  isLoading = false,
}: ExpenseWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ExpenseFormData>({
    eventId: event?.id || "",
    category: "",
    title: "",
    amount: "",
    vendorId: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    file: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof ExpenseFormData, string>> = {};

    if (step === 1) {
      if (!formData.eventId) newErrors.eventId = "Event is required";
      if (!formData.category) newErrors.category = "Category is required";
    }

    if (step === 2) {
      if (!formData.title?.trim()) newErrors.title = "Title is required";
      if (!formData.date) newErrors.date = "Date is required";
    }

    if (step === 3) {
      if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
        newErrors.amount = "Valid amount is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      await onSubmit(formData);
      // Don't close here - let parent component handle closing after fetcher completes
      // Reset form will happen when modal closes
    } catch (error) {
      console.error("Error submitting expense:", error);
      // Don't close on error - let user see the error and retry
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        eventId: event?.id || "",
        category: "",
        title: "",
        amount: "",
        vendorId: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        file: null,
      });
      setCurrentStep(1);
      setErrors({});
    }
  }, [isOpen, event?.id]);

  const handleClose = () => {
    if (!isLoading) {
      setCurrentStep(1);
      setFormData({
        eventId: event?.id || "",
        category: "",
        title: "",
        amount: "",
        vendorId: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        file: null,
      });
      setErrors({});
      onClose();
    }
  };

  const selectedEvent = events.find(e => e.id === formData.eventId);
  const selectedVendor = vendors.find(v => v.id === formData.vendorId);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === STEPS.length) {
      handleSubmit(e);
    } else {
      handleNext();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Submit Expense</h3>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form id="expense-wizard-form" onSubmit={handleFormSubmit} className="p-6 space-y-4">
            {/* Progress Steps */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  const isLast = index === STEPS.length - 1;

                  return (
                    <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      transition-colors duration-200
                      ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check size={20} />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                  <p
                    className={`mt-2 text-xs text-center ${
                      isActive ? "text-blue-600 font-medium" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {!isLast && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[300px]">
        {/* Step 1: Event & Category */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={formData.eventId}
                onChange={(value) => setFormData({ ...formData, eventId: value })}
                options={[
                  { value: "", label: "Select an event" },
                  ...events.map(event => ({
                    value: event.id,
                    label: `${event.name} (${event.status})`,
                  })),
                ]}
                placeholder="Select an event"
                error={errors.eventId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <Dropdown
                value={formData.category}
                onChange={(value) => setFormData({ ...formData, category: value })}
                options={[
                  { value: "", label: "Select category" },
                  ...CATEGORIES.map(cat => ({ value: cat, label: cat })),
                ]}
                placeholder="Select category"
                error={errors.category}
              />
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Conference Hall Rental"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Additional information..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 3: Amount & Vendor */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.amount ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor (Optional)
              </label>
              <Dropdown
                value={formData.vendorId}
                onChange={(value) => setFormData({ ...formData, vendorId: value })}
                options={[
                  { value: "", label: "No vendor selected" },
                  ...vendors.map(vendor => ({
                    value: vendor.id,
                    label: `${vendor.name}${vendor.serviceType ? ` (${vendor.serviceType})` : ""}`,
                  })),
                ]}
                placeholder="No vendor selected"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="expense-file-upload"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error("File size must be less than 10MB");
                        return;
                      }
                      setFormData({ ...formData, file });
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="expense-file-upload"
                  className="cursor-pointer block"
                >
                  {formData.file ? (
                    <div>
                      <p className="text-green-600 font-medium">{formData.file.name}</p>
                      <p className="text-gray-400 text-sm mt-1">Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500">Click to upload or drag and drop</p>
                      <p className="text-gray-400 text-sm mt-1">PDF, PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Event:</span>
                <span className="font-medium text-gray-900">{selectedEvent?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">{formData.category || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className="font-medium text-gray-900">{formData.title || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-900">
                  {formData.date ? new Date(formData.date).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">
                  ${parseFloat(formData.amount || "0").toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              {selectedVendor && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Vendor:</span>
                  <span className="font-medium text-gray-900">{selectedVendor.name}</span>
                </div>
              )}
              {formData.description && (
                <div>
                  <span className="text-gray-600 block mb-1">Description:</span>
                  <p className="text-gray-900">{formData.description}</p>
                </div>
              )}
              {formData.file && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt:</span>
                  <span className="font-medium text-gray-900">{formData.file.name}</span>
                </div>
              )}
            </div>
          </div>
        )}
          </div>
          </form>
        </div>

        {/* Footer - Sticky with Navigation */}
        <div className="p-6 border-t border-gray-200 flex justify-between flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="expense-wizard-form"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : currentStep === STEPS.length ? (
                "Submit Expense"
              ) : (
                <>
                  Next
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

