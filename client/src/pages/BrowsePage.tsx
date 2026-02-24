import { useState, useEffect } from "react";
import {
  Search,
  Grid,
  List,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { ArtworkCard } from "../components/collection/ArtworkCard";
import { ArtworkListRow } from "../components/collection/ArtworkListRow";
import { ArtworkModal } from "../components/collection/ArtworkModal";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { usePaginatedItems } from "../hooks/useCollection";
import { useEnrichment } from "../hooks/useEnrichment";
import type { Artwork, ViewMode } from "../types";

interface BrowsePageProps {
  onEnrich: (id: string) => Promise<void>;
  isEnriching: (id: string) => boolean;
  onImport: () => void;
}

export function BrowsePage({
  onImport,
}: BrowsePageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;

  // Use paginated hook to get all items (we'll do client-side pagination for filtered results)
  const { items, loading, error } = usePaginatedItems(1, 1000); // Reduced to 1000 for testing

  // Use enrichment hook
  const {
    enrich,
    isEnriching: isEnrichingArtwork,
    error: enrichError,
  } = useEnrichment();

  // Filter items based on search and department
  const filteredItems = items.filter((artwork) => {
    const searchLower = search.toLowerCase().trim();
    const matchesSearch =
      searchLower === "" ||
      artwork.title?.toLowerCase().includes(searchLower) ||
      artwork.artist?.toLowerCase().includes(searchLower) ||
      artwork.metadata?.department?.toLowerCase().includes(searchLower) ||
      artwork.culture?.toLowerCase().includes(searchLower) ||
      artwork.medium?.toLowerCase().includes(searchLower);

    const matchesDept =
      deptFilter === "" ||
      artwork.metadata?.department === deptFilter ||
      artwork.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  // Client-side pagination for filtered items
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Extract departments from filtered items
  const departments = [
    ...new Set(
      filteredItems.map(
        (a) => a.metadata?.department || a.department || "Unknown",
      ),
    ),
  ];

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, deptFilter]);

  if (loading && !items.length) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 20,
          padding: 32,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "var(--surface2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
          }}
        >
          🏛️
        </div>
        <div style={{ fontSize: 14, color: "var(--text-dim)" }}>
          Loading artworks...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 20,
          padding: 32,
        }}
      >
        <div style={{ fontSize: 16, color: "var(--text)" }}>
          Error loading artworks: {error}
        </div>
        <Button onClick={onImport} icon={<Download size={14} />}>
          Import Collection
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "var(--bg)",
            borderBottom: "1px solid var(--border)",
            padding: "16px 32px",
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-dim)",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search artworks, artists…"
              style={{
                width: "100%",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 14px 10px 36px",
                paddingRight: search ? "40px" : "14px",
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
                transition: "border 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.border = "1px solid var(--border-gold)")
              }
              onBlur={(e) =>
                (e.target.style.border = "1px solid var(--border)")
              }
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  zIndex: 10,
                  width: 20,
                  height: 20,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text)";
                  e.currentTarget.style.borderColor = "var(--border-gold)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-dim)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "10px 36px 10px 14px",
              color: deptFilter ? "var(--gold)" : "var(--text-dim)",
              fontSize: 13,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <div
            style={{
              display: "flex",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {(["grid", "list"] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                style={{
                  padding: "10px 14px",
                  background:
                    viewMode === m ? "var(--gold-dim)" : "transparent",
                  color: viewMode === m ? "var(--gold)" : "var(--text-dim)",
                  borderRight:
                    m === "grid" ? "1px solid var(--border)" : "none",
                  transition: "all 0.2s",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {m === "grid" ? <Grid size={15} /> : <List size={15} />}
              </button>
            ))}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "var(--text-dim)",
              whiteSpace: "nowrap",
            }}
          >
            {items.length} {items.length === 1 ? "artwork" : "artworks"}
          </div>
        </div>

        <div
          className="slide-up"
          style={{
            flex: 1,
            overflow: "auto",
            padding: 32,
            paddingBottom: 120,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            minHeight: 0,
          }}
        >
          {viewMode === "grid" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                gap: 20,
                minHeight: "fit-content",
              }}
            >
              {paginatedItems.map((a: Artwork) => (
                <ArtworkCard
                  key={a.id}
                  artwork={a}
                  onClick={() => setSelectedArtwork(a)}
                />
              ))}
            </div>
          ) : (
            <Card style={{ overflow: "hidden", minHeight: "fit-content" }}>
              <div
                style={{
                  padding: "10px 20px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  gap: 16,
                  fontSize: 11,
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  background: "var(--surface)",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                }}
              >
                {/* Column Widths must match ArtworkListRow exactly */}
                <span style={{ width: 56, minWidth: 56 }}>Image</span>
                <span style={{ flex: 1, minWidth: 0 }}>Title / Details</span>
                <span style={{ width: 100, minWidth: 100 }}>Year</span>
                <span style={{ width: 140, minWidth: 140 }}>Department</span>
                <span style={{ width: 120, minWidth: 120 }}>Culture</span>
                <span style={{ width: 160, minWidth: 160 }}>Description</span>
                <span style={{ width: 60, minWidth: 60 }}>AI</span>
                <span style={{ width: 14 }}></span> {/* Chevron space */}
              </div>

              <div
                style={{
                  background: "var(--surface)",
                  minHeight: "fit-content",
                }}
              >
                {paginatedItems.map((a: Artwork) => (
                  <ArtworkListRow
                    key={a.id}
                    artwork={a}
                    onClick={() => setSelectedArtwork(a)}
                  />
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          background: "var(--bg)",
          borderTop: "1px solid var(--border)",
          padding: "12px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
          minHeight: 60,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: "var(--text)",
            fontWeight: 500,
            flex: 1,
            marginLeft: 250,
          }}
        >
          Showing {Math.min(ITEMS_PER_PAGE, paginatedItems.length)} of{" "}
          {filteredItems.length} items (Page {currentPage} of {totalPages})
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "8px 12px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: currentPage === 1 ? "var(--text-dim)" : "var(--text)",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          {/* Page number buttons */}
          {(() => {
            const currentPageNum = currentPage;
            const maxVisiblePages = 5;

            let startPage = Math.max(
              1,
              currentPageNum - Math.floor(maxVisiblePages / 2),
            );
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            // Adjust start page if we're near the end
            if (endPage - startPage < maxVisiblePages - 1) {
              startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            const pages = [];
            for (let i = startPage; i <= endPage; i++) {
              pages.push(i);
            }

            return pages.map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: "8px 12px",
                  background:
                    pageNum === currentPageNum
                      ? "var(--gold-dim)"
                      : "var(--surface)",
                  border:
                    pageNum === currentPageNum
                      ? "1px solid var(--border-gold)"
                      : "1px solid var(--border)",
                  borderRadius: 8,
                  color:
                    pageNum === currentPageNum ? "var(--gold)" : "var(--text)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: pageNum === currentPageNum ? 600 : 400,
                }}
              >
                {pageNum}
              </button>
            ));
          })()}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 12px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color:
                currentPage === totalPages ? "var(--text-dim)" : "var(--text)",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {selectedArtwork && (
        <ArtworkModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          onEnrich={async (id) => {
            try {
              const enrichedArtwork = await enrich(id);
              // Update the selected artwork state with the enriched data
              setSelectedArtwork((prev) => {
                if (prev?.id === id) {
                  return enrichedArtwork;
                }
                return prev;
              });
            } catch (error) {
              console.error("Enrichment failed:", error);
            }
          }}
          isEnriching={isEnrichingArtwork}
        />
      )}
    </>
  );
}