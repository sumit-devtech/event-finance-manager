import { X, AlertTriangle } from "../Icons";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "text-destructive",
      button: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      border: "border-destructive/20",
    },
    warning: {
      icon: "text-yellow-600",
      button: "bg-yellow-600 text-white hover:bg-yellow-700",
      border: "border-yellow-200",
    },
    info: {
      icon: "text-primary",
      button: "bg-primary text-primary-foreground hover:bg-primary/90",
      border: "border-primary/20",
    },
  };

  const styles = variantStyles[variant];

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
        className="bg-card text-card-foreground rounded-xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className={`flex-shrink-0 ${styles.icon}`}>
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-card-foreground">{title}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              type="button"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-muted-foreground">{message}</p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

