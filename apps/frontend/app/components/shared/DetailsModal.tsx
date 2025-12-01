import type { ReactNode } from "react";
import { X } from "../Icons";
import type { ModalSection } from "~/types";

interface DetailsModalProps {
  title: string;
  subtitle?: string | ReactNode;
  sections: ModalSection[];
  actions?: { label: string; onClick: () => void; variant: "primary" | "secondary" }[];
  onClose: () => void;
  onEdit?: () => void;
}

export function DetailsModal({
  title,
  subtitle,
  sections,
  actions,
  onClose,
  onEdit,
}: DetailsModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-card text-card-foreground rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-card-foreground">{title}</h3>
              {subtitle && (
                <div className="flex items-center gap-3">
                  {typeof subtitle === 'string' ? <span>{subtitle}</span> : subtitle}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-2xl"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold mb-3 text-card-foreground">{section.title}</h4>
              {section.content && <div className="mb-4">{section.content}</div>}
              {section.items && section.items.length > 0 && (
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3 text-foreground">
                      {item.icon && <div className="text-muted-foreground">{item.icon}</div>}
                      <span className="font-medium">{item.label}:</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        {(actions || onEdit) && (
          <div className="p-6 border-t border-border flex gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Edit
              </button>
            )}
            {actions?.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`flex-1 px-6 py-3 rounded-lg transition-colors ${
                  action.variant === "primary"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-2 border-primary text-primary hover:bg-primary/10"
                }`}
              >
                {action.label}
              </button>
            ))}
            {!onEdit && !actions && (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
