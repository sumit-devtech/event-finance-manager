import type { ReactNode } from "react";
import { X, Loader } from "../Icons";

interface FormModalProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  isLoading?: boolean;
  submitDisabled?: boolean;
}

export function FormModal({
  title,
  subtitle,
  children,
  onClose,
  onSubmit,
  submitLabel = "Submit",
  isLoading = false,
  submitDisabled = false,
}: FormModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-[6px] border border-[#E2E2E2] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="p-6 border-b border-[#E2E2E2] flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#1A1A1A]">{title}</h3>
              {subtitle && (
                <p className="text-[#5E5E5E] mt-1 text-sm">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-[#A9A9A9] hover:text-[#5E5E5E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form id="form-modal-form" onSubmit={onSubmit} className="p-6 space-y-4">
            {children}
          </form>
        </div>

        {/* Footer - Sticky */}
        <div className="p-6 border-t border-[#E2E2E2] flex gap-3 justify-end flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 h-9 border border-[#E2E2E2] rounded-[6px] text-[#5E5E5E] hover:bg-[#F3F3F6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="form-modal-form"
            disabled={submitDisabled || isLoading}
            className="px-4 h-9 bg-[#672AFA] text-white rounded-[6px] hover:bg-[#5A1FE6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
          >
            {isLoading && <Loader size={16} className="animate-spin" />}
            {isLoading ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
