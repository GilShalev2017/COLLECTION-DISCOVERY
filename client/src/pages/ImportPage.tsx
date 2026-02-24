import { Badge } from "../components/ui/Badge";
import type { Artwork } from "../types";
import { MetImportCard } from "../components/import/MetImportCard";
import { CsvImportCard } from "../components/import/CsvImportCard";
import { DriveImportCard } from "../components/import/DriveImportCard";

interface ImportPageProps {
  onImportComplete: (items: Artwork[]) => void;
  hasExistingData?: boolean;
}

export function ImportPage({
  onImportComplete,
  hasExistingData,
}: ImportPageProps) {
  return (
    <div
      style={{
        padding: "32px",
        minHeight: "100vh",
        background: "var(--background)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 600,
              color: "var(--text)",
              margin: 0,
              marginBottom: 6,
            }}
          >
            Import Collection
          </h2>
          <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
            Sync artworks from data sources
          </p>
        </div>

        {hasExistingData && (
          <div
            style={{
              padding: "12px 20px",
              background: "rgba(201, 168, 76, 0.1)",
              border: "1px solid rgba(201, 168, 76, 0.2)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Badge color="gold">Existing Data</Badge>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
              You already have items in your collection. New imports will be
              added to existing data.
            </span>
          </div>
        )}
      </div>

      {/* 3-CARD GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: 20,
        }}
      >
        <MetImportCard
          onComplete={onImportComplete}
          hasExistingData={hasExistingData}
        />

        <CsvImportCard onComplete={onImportComplete} />

        <DriveImportCard onComplete={onImportComplete} />
      </div>
    </div>
  );
}
