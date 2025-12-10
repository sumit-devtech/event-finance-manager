import { useState, type ReactNode } from "react";
import { Edit, Trash } from "../Icons";
import { ConfirmDialog } from "./ConfirmDialog";
import type { ActionButtonConfig } from "~/types";

interface ViewDetailsButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export function ViewDetailsButton({
  onClick,
  disabled = false,
  label = "View Details",
}: ViewDetailsButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 h-9 bg-[#672AFA] text-white rounded-[6px] hover:bg-[#5A1FE6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm"
    >
      <span>{label}</span>
    </button>
  );
}

interface EditButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: number;
}

export function EditButton({
  onClick,
  disabled = false,
  size = 16,
}: EditButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 h-9 border border-[#672AFA] text-[#672AFA] bg-white rounded-[6px] hover:bg-[#F3F3F6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Edit"
    >
      <Edit size={size} />
    </button>
  );
}

interface DeleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  requireConfirm?: boolean;
  confirmMessage?: string;
  size?: number;
}

export function DeleteButton({
  onClick,
  disabled = false,
  requireConfirm = true,
  confirmMessage = "Are you sure you want to delete this item?",
  size = 16,
}: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    if (requireConfirm) {
      setShowConfirm(true);
    } else {
      onClick();
    }
  };

  const handleConfirm = () => {
    onClick();
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled}
        className="px-4 h-9 border border-[#D92C2C]/30 text-[#D92C2C] bg-white rounded-[6px] hover:bg-[#D92C2C]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete"
      >
        <Trash size={size} />
      </button>
      {requireConfirm && (
        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
          title="Confirm Delete"
          message={confirmMessage}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}
    </>
  );
}

interface ActionButtonGroupProps {
  actions: ActionButtonConfig[];
}

export function ActionButtonGroup({ actions }: ActionButtonGroupProps) {
  return (
    <div className="flex gap-2">
      {actions.map((action, index) => {
        const commonProps = {
          onClick: action.onClick,
          disabled: action.disabled,
        };

        if (action.variant === "primary") {
          return (
            <ViewDetailsButton
              key={index}
              {...commonProps}
              label={action.label}
            />
          );
        } else if (action.variant === "secondary") {
          return <EditButton key={index} {...commonProps} />;
        } else if (action.variant === "danger") {
          return (
            <DeleteButton
              key={index}
              {...commonProps}
              requireConfirm={action.requireConfirm}
              confirmMessage={action.confirmMessage}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
