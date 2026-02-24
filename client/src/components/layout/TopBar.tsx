import { ThemeToggleButton } from "@/theme/themeToggleButton";
import { Bell } from "lucide-react";

export function TopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        height: 64,
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        background: "var(--surface)",
        flexShrink: 0,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 500,
            color: "var(--text)",
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 11,
            color: "var(--text-dim)",
            letterSpacing: "0.05em",
          }}
        >
          {subtitle}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ThemeToggleButton />
        <button
          style={{
            position: "relative",
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-dim)",
          }}
        >
          <Bell size={15} />
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--gold)",
            }}
          />
        </button>
      </div>
    </div>
  );
}
