export function Badge({ children, color="gold" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string,string> = {
    gold:"rgba(201,168,76,0.15)", green:"rgba(26,92,58,0.3)",
    red:"rgba(139,26,26,0.3)", blue:"rgba(26,46,92,0.3)"
  };
  const textColors: Record<string,string> = {
    gold:"var(--gold)", green:"#4CAF81", red:"#E05656", blue:"#5688E0"
  };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding:"3px 10px", borderRadius:20,
      background:colors[color], color:textColors[color],
      fontSize:11, fontWeight:600, letterSpacing:"0.06em",
      border:`1px solid ${textColors[color]}33`
    }}>{children}</span>
  );
}