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
      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        className="px-4 py-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
