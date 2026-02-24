interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}
export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  icon,
  fullWidth,
  style,
}: ButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg,#C9A84C,#A67C32)",
      color: "#0D0A04",
      fontWeight: 700,
    },
    secondary: {
      background: "var(--surface2)",
      color: "var(--text)",
      border: "1px solid var(--border-gold)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-mid)",
      border: "1px solid var(--border)",
    },
    danger: {
      background: "rgba(139,26,26,0.3)",
      color: "#E05656",
      border: "1px solid rgba(224,86,86,0.3)",
    },
  };
  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: "6px 14px", fontSize: 12, borderRadius: 8 },
    md: { padding: "10px 20px", fontSize: 13, borderRadius: 11 },
    lg: { padding: "14px 28px", fontSize: 15, borderRadius: 13 },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        letterSpacing: "0.02em",
        transition: "all 0.2s",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        width: fullWidth ? "100%" : "auto",
        ...styles[variant],
        ...sizes[size],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.filter =
            "brightness(1.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.filter = "none";
      }}
    >
      {icon}
      {children}
    </button>
  );
}
