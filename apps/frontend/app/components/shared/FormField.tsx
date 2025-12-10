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
    <div className={`${className} mb-4`}>
      <label className="block text-[#1A1A1A] mb-2 text-xs font-medium">
        {label} {required && <span className="text-[#D92C2C]">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[#D92C2C] mt-1">{error}</p>
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
      className={`w-full px-4 h-9 border border-[#E2E2E2] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#672AFA] focus:border-[#672AFA] bg-white text-[#1A1A1A] placeholder:text-[#A9A9A9] ${error ? "border-[#D92C2C]" : ""
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
      className={`w-full px-4 py-2 min-h-[36px] border border-[#E2E2E2] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#672AFA] focus:border-[#672AFA] bg-white text-[#1A1A1A] placeholder:text-[#A9A9A9] resize-none ${error ? "border-[#D92C2C]" : ""
      } ${className}`}
      {...props}
    />
  );
}

