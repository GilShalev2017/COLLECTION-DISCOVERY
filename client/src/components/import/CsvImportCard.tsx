import { useRef, useState } from "react";
import { Upload, Check, X, Info } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { Badge } from "../ui/Badge";
import { GoldDivider } from "../ui/GoldDivider";
import { useCSVImport } from "../../hooks/useCollection";
import type { Artwork } from "../../types";

interface CsvImportCardProps {
  onComplete?: (items: Artwork[]) => void;
}

export function CsvImportCard({ onComplete }: CsvImportCardProps) {
  const csvFileRef = useRef<HTMLInputElement>(null);
  const imageFilesRef = useRef<HTMLInputElement>(null);
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  const {
    importing,
    progress,
    result,
    error,
    runImport,
    reset,
  } = useCSVImport();

  const handleImport = async () => {
    if (!csvFile) return;

    const importResult = await runImport(csvFile, imageFiles);

    if (importResult) {
      // Clear file selections after successful import
      setCSVFile(null);
      setImageFiles(null);
      if (csvFileRef.current) csvFileRef.current.value = "";
      if (imageFilesRef.current) imageFilesRef.current.value = "";
    }
  };

  const handleReset = () => {
    reset();
    setCSVFile(null);
    setImageFiles(null);
    if (csvFileRef.current) csvFileRef.current.value = "";
    if (imageFilesRef.current) imageFilesRef.current.value = "";
  };

  return (
    <Card
      style={{
        padding: "28px",
        background: "var(--surface)",
        border: "1px solid var(--border-gold)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(93, 127, 212, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Upload size={20} style={{ color: "#5D7FD4" }} />
        </div>
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--text)",
            }}
          >
            CSV Import
          </div>
          <div style={{ fontSize: 12, color: "var(--gold)", marginTop: 2 }}>
            Custom metadata + images
          </div>
        </div>
      </div>

      <GoldDivider />

      {/* Upload metadata CSV */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text)",
            marginBottom: 8,
          }}
        >
          Upload metadata CSV file:
        </label>
        <input
          ref={csvFileRef}
          type="file"
          accept=".csv"
          onChange={(e) => setCSVFile(e.target.files?.[0] || null)}
          disabled={importing}
          style={{
            width: "100%",
            padding: "10px 14px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "var(--surface2)",
            color: "var(--text)",
            fontSize: 13,
            cursor: "pointer",
          }}
        />
        {csvFile && (
          <div style={{ fontSize: 11, color: "#5D7FD4", marginTop: 6 }}>
            ✓ {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
          </div>
        )}
      </div>

      {/* Upload image files */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text)",
            marginBottom: 8,
          }}
        >
          Select image files:
        </label>
        <input
          ref={imageFilesRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImageFiles(e.target.files)}
          disabled={importing}
          style={{
            width: "100%",
            padding: "10px 14px",
            border: "1px solid var(--border)",
            borderRadius: 8,
            background: "var(--surface2)",
            color: "var(--text)",
            fontSize: 13,
            cursor: "pointer",
          }}
        />
        {imageFiles && imageFiles.length > 0 && (
          <div style={{ fontSize: 11, color: "#5D7FD4", marginTop: 6 }}>
            ✓ {imageFiles.length} image{imageFiles.length > 1 ? "s" : ""} selected
          </div>
        )}
      </div>

      {/* Info */}
      <div
        style={{
          padding: "12px",
          background: "rgba(93, 127, 212, 0.1)",
          border: "1px solid rgba(93, 127, 212, 0.2)",
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Info size={14} style={{ color: "#5D7FD4", flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.4 }}>
            Upload a CSV file with artwork metadata (title, artist, year, etc.) and
            optionally select corresponding image files. Images will be matched by
            filename.
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div style={{ marginBottom: 20 }}>
        {csvFile && imageFiles ? (
          <Badge color="green">Ready to Import</Badge>
        ) : (
          <Badge color="blue">Not Imported</Badge>
        )}
      </div>

      {/* Action Button */}
      <div style={{ marginTop: 20 }}>
        <Button
          onClick={handleImport}
          disabled={!csvFile || importing}
          icon={<Upload size={14} />}
        >
          {importing ? "Importing..." : "Import CSV"}
        </Button>
      </div>

      {/* Progress/Result */}
      {(importing || result || error) && (
        <div style={{ marginTop: 20 }}>
          {importing && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <Spinner />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--text)",
                  }}
                >
                  Processing CSV file...
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: "var(--surface2)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress.percent}%`,
                    background: "linear-gradient(90deg,#5D7FD4,#8FAEF5)",
                    borderRadius: 4,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  marginTop: 6,
                }}
              >
                {progress.percent}%
              </div>
            </>
          )}

          {result && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(45, 122, 82, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={18} style={{ color: "#2D7A52" }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    Import Complete!
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                    Successfully imported {result.stats?.new || 0} new items from CSV
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  paddingTop: 12,
                  borderTop: "1px solid var(--border)",
                }}
              >
                {[
                  {
                    label: "New",
                    value: result.stats?.new || 0,
                    color: "#2D7A52",
                  },
                  {
                    label: "Updated",
                    value: result.stats?.updated || 0,
                    color: "#5D7FD4",
                  },
                ].map((s, i) => (
                  <div key={i}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 28,
                        fontWeight: 500,
                        color: s.color,
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-dim)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                <Button
                  onClick={() => onComplete?.(result.items)}
                  variant="primary"
                  size="sm"
                >
                  View in Browse
                </Button>
                <Button onClick={handleReset} variant="ghost" size="sm">
                  Import Another
                </Button>
              </div>
            </>
          )}

          {error && (
            <div
              style={{
                padding: "16px",
                background: "rgba(224, 86, 86, 0.1)",
                border: "1px solid rgba(224, 86, 86, 0.2)",
                borderRadius: 8,
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <X size={16} style={{ color: "#E05656", flexShrink: 0 }} />
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#E05656",
                    marginBottom: 4,
                  }}
                >
                  Import Failed
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                  {error}
                </div>
                <Button onClick={handleReset} variant="ghost" size="sm" style={{ marginTop: 8 }}>
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
