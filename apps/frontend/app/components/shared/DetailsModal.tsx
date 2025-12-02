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
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">{title}</h3>
              {subtitle && (
                <div className="flex items-center gap-3">
                  {typeof subtitle === 'string' ? <span className="text-gray-600">{subtitle}</span> : subtitle}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold mb-3 text-gray-900">{section.title}</h4>
              {section.content && <div className="mb-4">{section.content}</div>}
              {section.items && section.items.length > 0 && (
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3 text-gray-900">
                      {item.icon && <div className="text-gray-500">{item.icon}</div>}
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
          <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0 bg-white">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            )}
            {actions?.map((action, index) => {
              // Determine button styling based on label and variant
              let buttonClasses = "px-6 py-3 rounded-lg transition-colors";
              
              if (action.variant === "primary") {
                buttonClasses += " bg-blue-600 text-white hover:bg-blue-700 flex-1";
              } else if (action.label === "Close") {
                buttonClasses += " border-2 border-gray-300 text-gray-700 hover:bg-gray-50";
              } else if (action.label === "Reject") {
                buttonClasses += " border-2 border-red-300 text-red-600 hover:bg-red-50 flex-1";
              } else {
                buttonClasses += " border-2 border-gray-300 text-gray-700 hover:bg-gray-50 flex-1";
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
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
