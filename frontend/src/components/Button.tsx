import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn--${variant} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className="btn__spinner" aria-hidden /> : null}
      <span className={loading ? "btn__label--hidden" : ""}>{children}</span>
    </button>
  );
}
