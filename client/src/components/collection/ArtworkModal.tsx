import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Eye,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import type { Artwork } from "../../types";

interface ArtworkModalProps {
  artwork: Artwork;
  onClose: () => void;
  onEnrich: (id: string) => Promise<void>;
  isEnriching: (id: string) => boolean;
}

export function ArtworkModal({
  artwork,
  onClose,
  onEnrich,
  isEnriching,
}: ArtworkModalProps) {
  const enriching = isEnriching(artwork.id);

  // 1. Safe Image Processing
  const allImages = [
    artwork.imageUrl,
    ...(artwork.additionalImages || []),
  ].filter(Boolean) as string[];

  const [activeIdx, setActiveIdx] = useState(0);
  const activeImage = allImages[activeIdx];

  // 2. Safe Keyword Processing (Fixes the .map crash)
  const getKeywords = (): string[] => {
    if (!artwork.aiKeywords) return [];
    if (Array.isArray(artwork.aiKeywords)) return artwork.aiKeywords;
    if (typeof artwork.aiKeywords === "string") {
      return (artwork.aiKeywords as string).split(",").map((s) => s.trim());
    }
    return [];
  };

  const aiKeywords = getKeywords();

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, activeIdx, allImages.length]);

  const navigate = (dir: number) => {
    if (allImages.length <= 1) return;
    const next = (activeIdx + dir + allImages.length) % allImages.length;
    setActiveIdx(next);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(12px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="slide-up"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-gold)",
          borderRadius: 24,
          maxWidth: 1100,
          width: "100%",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 500,
                color: "var(--text)",
              }}
            >
              {artwork.title}
            </div>
            <div
              style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 2 }}
            >
              {artwork.artist || "Unknown Artist"} • {artwork.year}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-dim)",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", overflow: "hidden", flex: 1 }}>
          {/* Main Image with Nav */}
          <div
            style={{
              width: 500,
              minWidth: 500,
              background: "#050505",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <img
              key={activeImage}
              src={activeImage}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                animation: "fadeIn 0.4s ease",
              }}
            />

            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(-1);
                  }}
                  style={navBtnStyle({ left: 16 })}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(1);
                  }}
                  style={navBtnStyle({ right: 16 })}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Details */}
          <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 28,
              }}
            >
              {[
                { label: "Department", value: artwork.metadata?.department },
                {
                  label: "Classification",
                  value: artwork.metadata?.classification,
                },
                { label: "Credit", value: artwork.metadata?.creditLine },
                {
                  label: "Medium",
                  value: artwork.metadata?.medium || artwork.medium,
                },
              ].map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--surface2)",
                    borderRadius: 12,
                    padding: "14px 18px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text)",
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {m.value || "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Gallery */}
            {allImages.length > 1 && (
              <div style={{ marginBottom: 32 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ImageIcon size={12} /> Gallery ({allImages.length})
                </div>
                <div
                  className="custom-scrollbar"
                  style={{
                    display: "flex",
                    gap: 12,
                    overflowX: "auto",
                    paddingBottom: 12,
                  }}
                >
                  {allImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveIdx(idx)}
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 10,
                        flexShrink: 0,
                        cursor: "pointer",
                        overflow: "hidden",
                        border:
                          activeIdx === idx
                            ? "2px solid var(--gold)"
                            : "1px solid var(--border)",
                        opacity: activeIdx === idx ? 1 : 0.5,
                        transition: "all 0.2s ease",
                        background: "var(--surface2)",
                      }}
                    >
                      <img
                        src={img}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Keywords - Using the safe aiKeywords array */}
            {aiKeywords.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "#9B7FD4",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Sparkles size={12} /> AI Insights
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {aiKeywords.map((t, i) => (
                    <span
                      key={i}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 20,
                        background: "rgba(155,127,212,0.1)",
                        border: "1px solid rgba(155,127,212,0.2)",
                        fontSize: 12,
                        color: "#B39FE4",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: 12,
                paddingTop: 24,
                borderTop: "1px solid var(--border)",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <Button
                  onClick={() => onEnrich(artwork.id)}
                  disabled={enriching || aiKeywords.length > 0}
                  icon={enriching ? <Spinner /> : <Sparkles size={14} />}
                  fullWidth={true}
                >
                  {enriching
                    ? "Analyzing..."
                    : aiKeywords.length > 0
                      ? "Enriched"
                      : "AI Enrichment"}
                </Button>
              </div>
              {artwork.metadata?.objectURL && (
                <Button
                  onClick={() =>
                    window.open(artwork.metadata?.objectURL, "_blank")
                  }
                  variant="secondary"
                  icon={<Eye size={14} />}
                >
                  Met Details
                </Button>
              )}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .custom-scrollbar::-webkit-scrollbar { height: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--gold); }
        `}</style>
      </div>
    </div>
  );
}

const navBtnStyle = (pos: object) => ({
  position: "absolute" as const,
  top: "50%",
  transform: "translateY(-50%)",
  width: 44,
  height: 44,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.4)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s",
  zIndex: 10,
  ...pos,
});
