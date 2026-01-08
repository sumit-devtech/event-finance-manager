import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "text";
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  children,
  className = "",
  disabled,
  isLoading = false,
  ...props
}: ButtonProps) {
  const baseClasses = "px-4 h-9 rounded-[6px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-interface font-medium";
  
  const variantClasses = {
    primary: "bg-[#672AFA] text-white hover:bg-[#5A1FE6]",
    secondary: "border border-[#E2E2E2] text-[#5E5E5E] bg-white hover:bg-[#F3F3F6]",
    tertiary: "text-[#5E5E5E] bg-transparent hover:bg-[#F3F3F6]",
    text: "text-[#672AFA] bg-transparent hover:text-[#5A1FE6] underline-offset-4 hover:underline px-0",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}





