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
        className="bg-card text-card-foreground rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-card-foreground">{title}</h3>
              {subtitle && (
                <p className="text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form id="form-modal-form" onSubmit={onSubmit} className="p-6 space-y-4">
          {children}
          
          {/* Footer */}
          <div className="pt-4 border-t border-border flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitDisabled || isLoading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading && <Loader size={16} className="animate-spin" />}
              {isLoading ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
