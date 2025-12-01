import type { ReactNode } from "react";
import { Dropdown } from "./Dropdown";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, required = false, error, children, className = "" }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-foreground mb-2 font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function FormInput({ error, className = "", ...props }: FormInputProps) {
  return (
    <input
      className={`w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground ${
        error ? "border-destructive" : ""
      } ${className}`}
      {...props}
    />
  );
}

interface FormSelectProps {
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  onChange?: (value: string) => void;
  value?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

export function FormSelect({ 
  error, 
  options, 
  onChange = () => {}, 
  value = "", 
  size = "md", 
  className = "", 
  disabled = false,
  placeholder,
}: FormSelectProps) {
  return (
    <Dropdown
      value={value}
      onChange={onChange}
      options={options}
      error={error}
      size={size}
      className={className}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function FormTextarea({ error, className = "", ...props }: FormTextareaProps) {
  return (
    <textarea
      className={`w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground resize-none ${
        error ? "border-destructive" : ""
      } ${className}`}
      {...props}
    />
  );
}

