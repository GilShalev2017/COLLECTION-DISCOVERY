import { useTheme } from "../theme/useTheme";

export function ThemeToggleButton() {
  const { mode, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      style={{
        padding: "8px 16px",
        borderRadius: "var(--radius)",
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        color: "var(--text)",
      }}
    >
      Switch to {mode === "dark" ? "Light" : "Dark"} mode
    </button>
  );
}
