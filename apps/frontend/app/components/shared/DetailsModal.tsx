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
        className="bg-white rounded-[6px] border border-[#E2E2E2] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="p-6 border-b border-[#E2E2E2] flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-[#1A1A1A]">{title}</h3>
              {subtitle && (
                <div className="flex items-center gap-3">
                  {typeof subtitle === 'string' ? <span className="text-[#5E5E5E] text-sm">{subtitle}</span> : subtitle}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[#A9A9A9] hover:text-[#5E5E5E] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-base font-semibold mb-3 text-[#1A1A1A]">{section.title}</h4>
              {section.content && <div className="mb-4">{section.content}</div>}
              {section.items && section.items.length > 0 && (
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3 text-[#1A1A1A] text-sm">
                      {item.icon && <div className="text-[#5E5E5E]">{item.icon}</div>}
                      <span className="font-medium">{item.label}:</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions - Sticky */}
        {(actions || onEdit) && (
          <div className="p-6 border-t border-[#E2E2E2] flex gap-3 flex-shrink-0 bg-white">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 h-9 bg-[#672AFA] text-white rounded-[6px] hover:bg-[#5A1FE6] transition-colors text-sm font-medium"
              >
                Edit
              </button>
            )}
            {actions?.map((action, index) => {
              // Determine button styling based on label and variant
              let buttonClasses = "px-4 h-9 rounded-[6px] transition-colors text-sm font-medium";
              
              if (action.variant === "primary") {
                buttonClasses += " bg-[#672AFA] text-white hover:bg-[#5A1FE6]";
              } else if (action.label === "Close") {
                buttonClasses += " border border-[#E2E2E2] text-[#5E5E5E] hover:bg-[#F3F3F6]";
              } else if (action.label === "Reject") {
                buttonClasses += " border border-[#D92C2C]/30 text-[#D92C2C] hover:bg-[#D92C2C]/10";
              } else {
                buttonClasses += " border border-[#E2E2E2] text-[#5E5E5E] hover:bg-[#F3F3F6]";
              }
              
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={buttonClasses}
                >
                  {action.label}
                </button>
              );
            })}
            {!onEdit && !actions && (
              <button
                onClick={onClose}
                className="px-4 h-9 border border-[#E2E2E2] text-[#5E5E5E] rounded-[6px] hover:bg-[#F3F3F6] transition-colors text-sm font-medium"
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
