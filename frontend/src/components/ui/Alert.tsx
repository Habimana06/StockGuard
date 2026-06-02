type AlertVariant = "error" | "warning" | "success" | "info";

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}

const icons: Record<AlertVariant, string> = {
  error: "✕",
  warning: "!",
  success: "✓",
  info: "i",
};

export function Alert({ variant, title, children, onDismiss }: AlertProps) {
  return (
    <div className={`alert alert--${variant}`} role="alert">
      <span className="alert__icon" aria-hidden>
        {icons[variant]}
      </span>
      <div className="alert__body">
        {title ? <p className="alert__title">{title}</p> : null}
        <p className="alert__text">{children}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          className="alert__close"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
