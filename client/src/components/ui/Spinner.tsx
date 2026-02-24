export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const px = size === "sm" ? 14 : size === "lg" ? 22 : 18;
  return (
    <span
      style={{
        display: "inline-block",
        width: px,
        height: px,
        border: "2px solid rgba(201,168,76,0.3)",
        borderTopColor: "var(--gold)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}
