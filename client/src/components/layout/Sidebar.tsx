import { Menu, LogOut, Users } from "lucide-react";
import { GoldDivider } from "../ui/GoldDivider";
import { NAV } from "../../constants/navigation";
import { useAuth } from "../../context/AuthContext";
import type { Page } from "../../types";

interface SidebarProps {
  page: Page;
  setPage: (p: Page) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onLogout: () => void;
}

export function Sidebar({
  page,
  setPage,
  collapsed,
  setCollapsed,
  onLogout,
}: SidebarProps) {
  const { user } = useAuth();

  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        minWidth: collapsed ? 64 : 240,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        transition:
          "width 0.3s cubic-bezier(.16,1,.3,1), min-width 0.3s cubic-bezier(.16,1,.3,1)",
        overflow: "hidden",
        zIndex: 10,
        position: "relative",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "20px 0" : "28px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            minWidth: 36,
            background: "linear-gradient(135deg,#C9A84C,#8B6914)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          🏛️
        </div>
        {!collapsed && (
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 600,
                color: "var(--gold)",
                lineHeight: 1.2,
              }}
            >
              Discover
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--text-dim)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Collections
            </div>
          </div>
        )}
      </div>

      <GoldDivider />

      {/* Museum name — now from auth context */}
      {!collapsed && (
        <div style={{ padding: "12px 24px" }}>
          <div
            style={{
              fontSize: 10,
              color: "var(--text-dim)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            Museum
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-mid)",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.museumName ?? "—"}
          </div>
        </div>
      )}

      {/* Nav items — NAV constant should include users entry */}
      <nav
        style={{
          padding: "8px 12px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {NAV.map(({ id, icon: Icon, label }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "12px" : "11px 14px",
                borderRadius: 10,
                width: "100%",
                transition: "all 0.2s",
                background: active ? "var(--gold-dim)" : "transparent",
                color: active ? "var(--gold)" : "var(--text-dim)",
                border: active
                  ? "1px solid var(--border-gold)"
                  : "1px solid transparent",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                justifyContent: collapsed ? "center" : "flex-start",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!active)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
              }}
            >
              <Icon size={17} style={{ minWidth: 17 }} />
              {!collapsed && label}
            </button>
          );
        })}
      </nav>

      <GoldDivider />

      {/* Bottom — real user info + logout + collapse toggle */}
      <div
        style={{
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* User info */}
        {!collapsed && user && (
          <div
            style={{
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg,var(--gold),#8B6914)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                color: "#0D0A04",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                {user.role === "admin" ? "Admin" : "Member"}
              </div>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={onLogout}
          title="Sign out"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 10,
            color: "var(--text-dim)",
            fontSize: 12,
            transition: "all 0.2s",
            cursor: "pointer",
            background: "transparent",
            border: "1px solid transparent",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.color = "#E07060";
            btn.style.background = "rgba(184,57,46,0.08)";
            btn.style.borderColor = "rgba(184,57,46,0.3)";
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.color = "var(--text-dim)";
            btn.style.background = "transparent";
            btn.style.borderColor = "transparent";
          }}
        >
          <LogOut size={15} style={{ minWidth: 15 }} />
          {!collapsed && "Sign Out"}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 10,
            color: "var(--text-dim)",
            fontSize: 12,
            transition: "all 0.2s",
            cursor: "pointer",
            background: "transparent",
            border: "none",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--gold)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--text-dim)";
          }}
        >
          <Menu size={16} />
          {!collapsed && "Collapse sidebar"}
        </button>
      </div>
    </aside>
  );
}
