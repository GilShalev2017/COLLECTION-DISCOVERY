import { useState } from "react";
import { Check, Trash2, AlertTriangle } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { GoldDivider } from "../components/ui/GoldDivider";
import { useQueryClient } from "@tanstack/react-query";
import { clearCollection } from "../api/client";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [museumName, setMuseumName] = useState(
    "The Metropolitan Museum of Art",
  );
  const [apiKey, setApiKey] = useState("••••••••••••••••");
  const [saved, setSaved] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearData = async () => {
    const confirmed = window.confirm(
      "DANGER: This will permanently delete all artworks from your local database. This action cannot be undone. Are you sure?",
    );

    if (!confirmed) return;

    setIsClearing(true);
    try {
      await clearCollection();
      // Invalidate the cache so BrowsePage shows 0 items immediately
      queryClient.invalidateQueries({ queryKey: ["items"] });
      alert("Collection successfully cleared.");
    } catch (err) {
      console.error("Failed to clear collection:", err);
      alert("Failed to clear collection. Please check server logs.");
    } finally {
      setIsClearing(false);
    }
  };

  const sections = [
    {
      title: "Museum Profile",
      fields: [
        {
          label: "Museum Name",
          value: museumName,
          onChange: setMuseumName,
          type: "text",
        },
        {
          label: "Country",
          value: "United States",
          onChange: () => {},
          type: "text",
        },
        {
          label: "Website",
          value: "metmuseum.org",
          onChange: () => {},
          type: "text",
        },
      ],
    },
  ];

  return (
    <div
      className="slide-up"
      style={{
        padding: 32,
        overflow: "auto",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 760,
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            fontWeight: 400,
            color: "var(--text)",
            marginBottom: 6,
          }}
        >
          Settings
        </h2>
        <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
          Configure your museum profile and data preferences.
        </p>
      </div>

      <GoldDivider />

      {sections.map((section, idx) => (
        <Card key={idx} style={{ padding: 24 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "var(--gold)",
              marginBottom: 20,
            }}
          >
            {section.title}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {section.fields.map((field, i) => (
              <div key={i}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 6,
                  }}
                >
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--text)",
                    fontSize: 13,
                  }}
                />
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Preferences Section */}
      <Card style={{ padding: 24 }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: "var(--gold)",
            marginBottom: 20,
          }}
        >
          Automation Preferences
        </h3>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            { label: "Auto-enrich on import", on: true },
            { label: "Generate 10 keywords per artwork", on: true },
            { label: "Multi-language tagging", on: false },
            { label: "Historical context analysis", on: false },
          ].map((opt, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--text-mid)" }}>
                {opt.label}
              </span>
              <div
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: opt.on ? "var(--gold)" : "var(--surface2)",
                  border: `1px solid ${opt.on ? "var(--gold)" : "var(--border)"}`,
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: 2,
                    left: opt.on ? 22 : 2,
                    transition: "left 0.3s",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger Zone Section */}
      <Card
        style={{
          padding: 24,
          border: "1px solid rgba(184, 57, 46, 0.3)",
          background: "rgba(184, 57, 46, 0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <AlertTriangle size={18} style={{ color: "#B8392E" }} />
          <h3
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "#B8392E",
              margin: 0,
            }}
          >
            Danger Zone
          </h3>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-dim)",
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          Wipe the entire local collection. This removes all imported artworks
          and metadata. This does not affect your external Google Drive or CSV
          files.
        </p>
        <Button
          onClick={handleClearData}
          variant="ghost"
          disabled={isClearing}
          style={{
            borderColor: "#B8392E",
            color: "#B8392E",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {isClearing ? "Clearing Database..." : "Clear Entire Collection"}
          {!isClearing && <Trash2 size={14} />}
        </Button>
      </Card>

      {/* Save Button */}
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <Button
          onClick={handleSave}
          variant="primary"
          icon={saved ? <Check size={14} /> : undefined}
        >
          {saved ? "Settings Saved" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
