import { ChevronRight, Sparkles } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { Artwork } from "../../types";

interface ArtworkListRowProps {
  artwork: Artwork;
  onClick: () => void;
}

export function ArtworkListRow({ artwork, onClick }: ArtworkListRowProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 20px",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      // ... mouse handlers
    >
      {/* 1. IMAGE COLUMN */}
      <div
        style={{
          width: 56,
          height: 56,
          flexShrink: 0,
          borderRadius: 8,
          overflow: "hidden",
          background: "var(--surface2)",
        }}
      >
        <img
          src={artwork.imageUrl || ""}
          alt={artwork.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* 2. TITLE COLUMN (STRETCH) */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 500,
            color: "var(--text)",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {artwork.title}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
          {artwork.artist || "Unknown"}
        </div>
      </div>

      {/* 3. YEAR COLUMN */}
      <div
        style={{
          width: 100,
          minWidth: 100,
          fontSize: 12,
          color: "var(--text-dim)",
        }}
      >
        {artwork.year || "Unknown"}
      </div>

      {/* 4. DEPARTMENT COLUMN */}
      <div
        style={{
          width: 140,
          minWidth: 140,
          fontSize: 12,
          color: "var(--text-dim)",
        }}
      >
        {artwork.metadata?.department || "Unknown"}
      </div>

      {/* 5. CULTURE COLUMN */}
      <div
        style={{
          width: 120,
          minWidth: 120,
          fontSize: 12,
          color: "var(--text-dim)",
        }}
      >
        {artwork.metadata?.culture || "Unknown"}
      </div>

      {/* 6. DESCRIPTION COLUMN */}
      <div
        style={{
          width: 160,
          minWidth: 160,
          fontSize: 12,
          color: "var(--text-dim)",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {artwork.description || "Unknown"}
      </div>

      {/* 7. AI COLUMN */}
      <div style={{ width: 60, minWidth: 60 }}>
        {artwork.aiKeywords && artwork.aiKeywords.length > 0 && (
          <Badge>
            <Sparkles size={10} /> AI
          </Badge>
        )}
      </div>

      <ChevronRight
        size={14}
        style={{ color: "var(--text-dim)", flexShrink: 0 }}
      />
    </div>
  );
}
