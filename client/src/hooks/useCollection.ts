import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getItems,
  importFromMet,
  importFromCSV,
  enrichArtwork,
  getDepartments,
  importFromDrive,
  getGoogleAuthUrl,
} from "../api/client";
import type {
  ImportMetResponse,
  Department,
  ApiError,
  CSVImportResponse,
  DriveImportResponse,
} from "../api/client";
import type { Artwork } from "../types";

// ── Hook: Fetch Paginated Collection Items ──────────────────────────────
export function usePaginatedItems(page: number = 1, limit: number = 100) {
  const {
    data,
    isLoading: loading,
    error,
    refetch: fetchPage,
  } = useQuery({
    queryKey: ["items", page, limit],
    queryFn: () => getItems(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data,
    items: data?.items || [],
    pagination: data?.pagination,
    loading,
    error: error?.message || null,
    fetchPage: () => fetchPage(),
  };
}

// ── Hook: Import from Met Museum ──────────────────────────────────────────
interface ImportProgress {
  stage: string;
  percent: number;
}

export function useMetImport() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    stage: "",
    percent: 0,
  });
  const [result, setResult] = useState<ImportMetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const runImport = async (
    searchTerm: string = "*",
    departmentIds: number[] = [],
  ) => {
    abortControllerRef.current = new AbortController();
    setImporting(true);
    setError(null);
    setResult(null);

    // Simulated progress stages (real progress could come from WebSocket/SSE)
    const stages = [
      { stage: "Connecting to Met Museum API...", percent: 10 },
      { stage: "Searching collection...", percent: 30 },
      { stage: "Downloading artwork metadata...", percent: 60 },
      { stage: "Processing images...", percent: 80 },
      { stage: "Saving to database...", percent: 95 },
    ];

    try {
      // Progress simulation
      for (const stage of stages) {
        setProgress(stage);
        await new Promise((r) => setTimeout(r, 400));
      }

      const data = await importFromMet(
        searchTerm,
        departmentIds,
        abortControllerRef.current.signal,
      );

      console.log("Import response:", data);
      console.log("Items received:", data.items?.length || 0);

      setResult(data);
      setProgress({ stage: "Complete!", percent: 100 });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Import cancelled");
        return;
      }
      const apiError = err as ApiError;

      console.error("Import failed:", apiError);

      setError(apiError.message || "Import failed");
      console.error("Import failed:", err);
    } finally {
      setImporting(false);
    }
  };

  const abort = () => {
    abortControllerRef.current?.abort();
    setImporting(false);
    setError("Import cancelled by user");
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setProgress({ stage: "", percent: 0 });
  };

  return { importing, progress, result, error, runImport, abort, reset };
}

// ── Hook: Fetch Departments ────────────────────────────────────────────────
export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load departments");
      console.error("Failed to fetch departments:", err);
    } finally {
      setLoading(false);
    }
  };

  return { departments, loading, error, fetchDepartments };
}

// Hook: CSV Import
interface CSVImportProgress {
  stage: string;
  percent: number;
}

export function useCSVImport() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<CSVImportProgress>({
    stage: "",
    percent: 0,
  });
  const [result, setResult] = useState<CSVImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runImport = async (csvFile: File, imageFiles?: FileList | null) => {
    setImporting(true);
    setError(null);
    setResult(null);
    setProgress({ stage: "Preparing upload...", percent: 10 });

    try {
      // Add image files progress indication
      if (imageFiles && imageFiles.length > 0) {
        setProgress({
          stage: `Uploading CSV + ${imageFiles.length} images...`,
          percent: 30,
        });
      } else {
        setProgress({ stage: "Uploading CSV...", percent: 30 });
      }

      // Call the API client method
      const data = await importFromCSV(csvFile, imageFiles);

      setProgress({ stage: "Processing data...", percent: 70 });

      // Small delay to show processing stage
      await new Promise((r) => setTimeout(r, 500));

      setProgress({ stage: "Complete!", percent: 100 });
      setResult(data);

      return data;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || "CSV import failed";
      setError(errorMessage);
      console.error("CSV import error:", err);
      return null;
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setProgress({ stage: "", percent: 0 });
  };

  return { importing, progress, result, error, runImport, reset };
}

export function useDriveImport() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<{ stage: string; percent: number }>({
    stage: "",
    percent: 0,
  });
  const [result, setResult] = useState<DriveImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Renamed from initiateAuth to initiateDriveImport to match ImportPage.tsx
  const initiateDriveImport = async () => {
    try {
      const url = await getGoogleAuthUrl();
      window.location.href = url;//redirect to googl auth url!
    } catch (err: any) {
      setError("Failed to connect to Google Drive.");
    }
  };

  const runImport = async (
    folderId: string,
    accessToken: string,
    onSuccess?: (items: any[]) => void,
  ) => {
    setImporting(true);
    setError(null);
    setProgress({ stage: "Importing from Drive...", percent: 30 });

    try {
      const data = await importFromDrive(folderId, accessToken);
      setProgress({ stage: "Complete!", percent: 100 });
      setResult(data);

      if (onSuccess && data.items) {
        onSuccess(data.items);
      }
      
      return data;
    } catch (err: any) {
      setError(err.message || "Drive import failed.");
      return null;
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setProgress({ stage: "", percent: 0 });
  };

  return {
    importing,
    progress,
    result,
    error,
    initiateDriveImport, 
    runImport,
    reset,
  };
}
