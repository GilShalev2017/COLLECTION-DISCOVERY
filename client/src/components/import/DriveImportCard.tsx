import { useState, useEffect } from "react";
import { FolderOpen, Check, X, Info } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { GoldDivider } from "../ui/GoldDivider";
import { Badge } from "../ui/Badge";
import { useDriveImport } from "../../hooks/useCollection";

interface DriveImportCardProps {
  onComplete?: (items: any[]) => void;
}

export function DriveImportCard({ onComplete }: DriveImportCardProps) {
  const [folderIdInput, setFolderIdInput] = useState("");
  const {
    initiateDriveImport,
    runImport,
    importing,
    progress,
    result,
    error,
    reset,
  } = useDriveImport();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const savedFolderId = localStorage.getItem("pending_drive_folder_id");

    if (code && savedFolderId) {
      window.history.replaceState({}, document.title, "/");
      localStorage.removeItem("pending_drive_folder_id");
      setFolderIdInput(savedFolderId);
      
      console.log(">>> [DEBUG] OAuth code found. Starting import for:", savedFolderId);
      
      // We wrap runImport to capture the result for debugging
      runImport(savedFolderId, code).then((data) => {
        if (data) {
          console.log(">>> [DEBUG] Backend returned items:", data.items);
          console.log(">>> [DEBUG] Backend stats:", data.stats);
        }
      });
    }
  }, [runImport]);

  const handleConnect = async () => {
    if (!folderIdInput) return;
    localStorage.setItem("pending_drive_folder_id", folderIdInput);
    await initiateDriveImport();
  };

  return (
    <Card
      style={{
        padding: 32,
        border: "1px solid var(--border-gold)",
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "var(--gold-dim)",
            border: "1px solid var(--border-gold)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FolderOpen size={24} style={{ color: "var(--gold)" }} />
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 500,
              color: "var(--text)",
            }}
          >
            Google Drive
          </div>
          <div style={{ fontSize: 12, color: "var(--gold)", marginTop: 2 }}>
            drive.google.com
          </div>
        </div>
      </div>

      {!importing && !result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ marginBottom: 4 }}>
            <label
              style={{
                fontSize: 11,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "block",
                marginBottom: 8,
              }}
            >
              Google Drive Folder ID
            </label>
            <input
              type="text"
              value={folderIdInput}
              onChange={(e) => setFolderIdInput(e.target.value)}
              placeholder="Paste Folder ID (e.g. 1abc123...)"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.target.style.border = "1px solid var(--border-gold)")}
              onBlur={(e) => (e.target.style.border = "1px solid var(--border)")}
            />
          </div>

          <div
            style={{
              background: "var(--surface2)",
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px dashed var(--border-gold)",
              display: "flex",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <Info size={16} style={{ color: "var(--gold)", marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 500, marginBottom: 4 }}>
                Import Tip
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5 }}>
                Ensure your folder sharing is set to <span style={{ color: "var(--gold)" }}>"Anyone with the link can view"</span> for the images to load correctly.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
            <Badge>Cloud Sync</Badge>
            <Badge color="green">OAuth 2.0</Badge>
          </div>

          <GoldDivider />

          <div style={{ marginTop: 20 }}>
            <Button onClick={handleConnect} disabled={!folderIdInput} variant="primary">
              Connect & Start Import
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {importing && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <Spinner />
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
              {progress?.stage || "Processing Drive files..."}
            </span>
          </div>
          <div style={{ height: 4, background: "var(--surface2)", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress?.percent || 0}%`,
                background: "linear-gradient(90deg,var(--gold),var(--gold-light))",
                borderRadius: 4,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Success State */}
      {result && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
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
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
                Import Complete!
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                Successfully added {result.stats.new} items from Drive
              </div>
            </div>
          </div>

          {/* ACTIONS: View in Browse + Dismiss */}
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <Button
              onClick={() => {
                console.log(">>> [DEBUG] User clicked View in Browse. Items sent to callback:", result.items);
                onComplete?.(result.items);
              }}
              variant="primary"
              size="sm"
            >
              View in Browse
            </Button>
            <Button onClick={reset} variant="ghost" size="sm">
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(184, 57, 46, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} style={{ color: "#B8392E" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Failed</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{error}</div>
            <Button onClick={reset} variant="ghost" size="sm" style={{ marginTop: 4, padding: 0 }}>
              Try Again
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}