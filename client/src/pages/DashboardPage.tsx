import { useMemo } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Globe,
  Sparkles,
  Layers,
  Download,
  ChevronRight,
  Database,
  CheckCircle,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { usePaginatedItems } from "../hooks/useCollection";
import type { Artwork, Page } from "../types";

interface DashboardPageProps {
  setPage: (p: Page) => void;
}

export function DashboardPage({ setPage }: DashboardPageProps) {
  // Use paginated hook for dashboard stats
  const { items } = usePaginatedItems(1, 1000);

  const sortedArtworks = useMemo(() => {
    return [...items].sort(
      (a: Artwork, b: Artwork): number =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [items]);

  const stats = [
    {
      label: "Total Artworks",
      value: items.length || 0,
      icon: Package,
      delta: "+12%",
      up: true,
      color: "var(--gold)",
    },
    {
      label: "Departments",
      value:
        [...new Set(items.map((a) => a.metadata?.department || "Unknown"))]
          .length || 0,
      icon: Layers,
      delta: "stable",
      up: true,
      color: "#5688E0",
    },
    {
      label: "AI Enriched",
      value:
        items.filter((a) => a.aiKeywords && a.aiKeywords.length > 0).length ||
        0,
      icon: Sparkles,
      delta: "new",
      up: true,
      color: "#9B7FD4",
    },
    {
      label: "Cultures",
      value:
        [...new Set(items.map((a) => a.metadata?.culture || "Unknown"))]
          .length || 0,
      icon: Globe,
      delta: "+5%",
      up: true,
      color: "#4CAF81",
    },
  ];

  const deptData = useMemo(() => {
    const depts = [
      ...new Set(
        items.map((a: Artwork) => a.metadata?.department || "Unknown"),
      ),
    ];
    return depts.map((dept) => ({
      name: dept,
      count: items.filter((a) => (a.metadata?.department || "Unknown") === dept)
        .length,
    }));
  }, [items]);

  interface ActivityItem {
    time: string;
    action: string;
    detail: string;
    icon: any;
    color: string;
  }

  const activity = useMemo((): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    sortedArtworks.slice(0, 6).forEach((artwork: Artwork) => {
      const createdDate = new Date(artwork.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - createdDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      const timeAgo =
        diffDays > 0
          ? `${diffDays}d ago`
          : diffHours > 0
            ? `${diffHours}h ago`
            : "Just now";

      activities.push({
        time: timeAgo,
        action: "Artwork imported",
        detail: artwork.title
          ? `"${artwork.title}" by ${artwork.artist || "Unknown"}`
          : "Unknown artwork imported",
        icon: CheckCircle,
        color: "#4CAF81",
      });

      if (artwork.aiKeywords && artwork.aiKeywords.length > 0) {
        activities.push({
          time: timeAgo,
          action: "AI Enrichment",
          detail: artwork.title
            ? `"${artwork.title}" — ${artwork.aiKeywords.length} keywords added`
            : "AI enrichment success",
          icon: Sparkles,
          color: "#9B7FD4",
        });
      }
    });
    return activities.slice(0, 4);
  }, [sortedArtworks]);

  return (
    <div
      className="slide-up"
      style={{
        padding: 32,
        overflow: "auto",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Welcome Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 300,
              color: "var(--text)",
              lineHeight: 1,
            }}
          >
            Welcome back,
            <br />
            <em style={{ color: "var(--gold)" }}>Collection Manager</em>
          </h2>
        </div>
        <Button onClick={() => setPage("import")} icon={<Download size={15} />}>
          Add Artworks
        </Button>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
        }}
      >
        {stats.map((s, i) => (
          <Card
            key={i}
            style={{
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: "120px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${s.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: s.up ? "#4CAF81" : "#E05656",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {s.up ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {s.delta}
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 34,
                fontWeight: 500,
                color: "var(--text)",
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-dim)",
                marginTop: 6,
                letterSpacing: "0.03em",
              }}
            >
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Middle Row: Depts & Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card
          style={{
            padding: 24,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            maxHeight: "350px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 500,
              marginBottom: 20,
              color: "var(--text)",
            }}
          >
            By Department
          </div>
          {items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 32,
                color: "var(--text-dim)",
              }}
            >
              <Database size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p>Import collection to see breakdown</p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                overflowY: "auto",
                paddingRight: 10,
              }}
            >
              {deptData.map((d, i) => {
                const pct = Math.round((d.count / items.length) * 100);
                const colors = [
                  "var(--gold)",
                  "#4CAF81",
                  "#5688E0",
                  "#9B7FD4",
                  "#E05656",
                ];
                return (
                  <div key={i}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        fontSize: 11,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          color: "var(--text-mid)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {d.name}
                      </span>
                      <span
                        style={{ color: "var(--text-dim)", paddingLeft: 8 }}
                      >
                        {d.count} works · {pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "var(--surface2)",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: colors[i % colors.length],
                          transition: "width 1s ease-out",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card
          style={{
            padding: 24,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            maxHeight: "350px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 500,
              marginBottom: 20,
              color: "var(--text)",
            }}
          >
            Recent Activity
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            {activity.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "12px 0",
                  borderBottom:
                    i < activity.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    borderRadius: 8,
                    background: `${a.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <a.icon size={14} style={{ color: a.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--text)",
                      marginBottom: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.action}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-dim)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.detail}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-dim)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.time}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Latest Imports Preview */}
      {items.length > 0 && (
        <Card style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                fontWeight: 500,
                color: "var(--text)",
              }}
            >
              Latest Imports
            </div>
            <Button
              onClick={() => setPage("browse")}
              variant="ghost"
              size="sm"
              icon={<ChevronRight size={13} />}
            >
              View all
            </Button>
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 8,
            }}
          >
            {sortedArtworks.slice(0, 7).map((a) => (
              <div
                key={a.id}
                style={{
                  width: 200,
                  flexShrink: 0,
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    height: 120,
                    width: "100%",
                    overflow: "hidden",
                    background: "#000",
                  }}
                >
                  <img
                    src={a.imageUrl || ""}
                    alt={a.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/200x120?text=No+Image";
                    }}
                  />
                </div>

                <div
                  style={{
                    padding: "12px",
                    height: 60,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text)",
                      marginBottom: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={a.title}
                  >
                    {a.title}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-dim)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {a.artist || "Unknown Artist"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
