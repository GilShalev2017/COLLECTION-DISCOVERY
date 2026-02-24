import { useState } from 'react';

export function Card({
  children,
  style,
  onClick,
  hover = false,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  hover?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        transition: "all 0.3s",
        cursor: onClick ? "pointer" : "default",
        ...(hover && hovered
          ? {
              border: "1px solid var(--border-gold)",
              transform: "translateY(-3px)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            }
          : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
