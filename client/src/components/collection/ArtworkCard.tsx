import { useState, useRef } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import type { Artwork } from "../../types";
import { useQueryClient } from "@tanstack/react-query";
import { deleteArtwork } from "../../api/client";
import { Spinner } from "../ui/Spinner";

interface ArtworkCardProps {
  artwork: Artwork;
  onClick: () => void;
}

export function ArtworkCard({ artwork, onClick }: ArtworkCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // useRef allows us to access the image element safely in async timeouts
  const imgRef = useRef<HTMLImageElement>(null);
  const queryClient = useQueryClient();

  // Using placehold.co as it is more reliable than via.placeholder
  const FALLBACK_IMAGE = "https://placehold.co/400x400?text=No+Image";

  const handleImageError = () => {
    // 1. Hard stop after 2 failures to prevent infinite loops
    if (errorCount >= 2) {
      if (imgRef.current) imgRef.current.src = FALLBACK_IMAGE;
      setImgLoaded(true);
      return;
    }

    // 2. Prevent overlapping retry attempts
    if (isRetrying) return;

    setIsRetrying(true);
    setErrorCount((prev) => prev + 1);

    console.warn(
      `Image 429/Error. Cooling down 2s before retry #${errorCount + 1} for: ${artwork.title}`,
    );

    // 3. Back-off: Wait 2 seconds before trying again to let Google rate-limits reset
    setTimeout(() => {
      if (imgRef.current && artwork.imageUrl) {
        const connector = artwork.imageUrl.includes("?") ? "&" : "?";
        // Use Date.now() to bypass the browser's "broken image" cache
        imgRef.current.src = `${artwork.imageUrl}${connector}retry=${Date.now()}`;
        setIsRetrying(false);
      }
    }, 2000);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the Artwork Modal from opening
    if (!window.confirm("Are you sure you want to delete this artwork?"))
      return;

    setIsDeleting(true);
    try {
      await deleteArtwork(artwork.id);
      // Refresh the "items" query used in BrowsePage
      queryClient.invalidateQueries({ queryKey: ["items"] });
    } catch (err) {
      alert("Failed to delete item");
      setIsDeleting(false);
    }
  };

  const displayYear = artwork.year
    ? artwork.year < 0
      ? `${Math.abs(artwork.year)} BC`
      : artwork.year
    : "Undated";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "var(--surface)",
        border: isHovered
          ? "1px solid var(--border-gold)"
          : "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        transform: isHovered ? "translateY(-6px)" : "none",
        boxShadow: isHovered ? "0 15px 30px rgba(0,0,0,0.5)" : "none",
        transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
        opacity: isDeleting ? 0.5 : 1,
        pointerEvents: isDeleting ? "none" : "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 200,
          background: "var(--surface2)",
        }}
      >
        {/* Delete Button - Top Left */}
        <button
          onClick={handleDelete}
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 20,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(184, 57, 46, 0.85)",
            border: "none",
            display: isHovered ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Trash2 size={14} />
        </button>

        <img
          ref={imgRef}
          src={artwork.imageUrl || FALLBACK_IMAGE}
          alt={artwork.title}
          onLoad={() => {
            setImgLoaded(true);
            setIsRetrying(false);
          }}
          onError={handleImageError}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 0.4s",
          }}
        />

        {!imgLoaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner size="sm" />
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateY(0)" : "translateY(-5px)",
            transition: "all 0.3s ease",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              fontSize: 9,
              padding: "4px 8px",
              borderRadius: 4,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {artwork.metadata?.department?.replace("The ", "")}
          </div>
        </div>

        {artwork.aiKeywords && artwork.aiKeywords.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              padding: 6,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              borderRadius: "50%",
              color: "var(--gold)",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
            }}
          >
            <Sparkles size={14} />
          </div>
        )}
      </div>

      <div style={{ padding: "10px 12px" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 2,
            lineHeight: 1.2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.4em",
          }}
        >
          {artwork.title}
        </div>

        <div
          style={{
            fontSize: 11,
            color: "var(--text-mid)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginRight: 6,
            }}
          >
            {artwork.artist || "Unknown Artist"}
          </span>
          <span
            style={{
              color: "var(--text-dim)",
              fontFamily: "monospace",
              flexShrink: 0,
              fontSize: 10,
            }}
          >
            {displayYear}
          </span>
        </div>
      </div>
    </div>
  );
}