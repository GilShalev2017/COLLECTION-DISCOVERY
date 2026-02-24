// import axios, { AxiosError } from "axios";
// import type { Artwork } from "../types";

// // ── API Client Configuration ──────────────────────────────────────────────
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "/api",
//   timeout: 30000, // 30s for large imports
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // ── Response Types ────────────────────────────────────────────────────────
// export interface ImportMetResponse {
//   success: boolean;
//   stats: {
//     new: number;
//     updated: number;
//     skipped: number;
//     removed: number;
//   };
//   items: Artwork[];
//   message?: string;
// }

// export interface Department {
//   departmentId: number;
//   displayName: string;
// }

// export interface ApiError {
//   error: string;
//   message?: string;
// }

// export interface PaginatedResponse<T> {
//   items: T[];
//   pagination: {
//     currentPage: number;
//     totalPages: number;
//     totalItems: number;
//     itemsPerPage: number;
//     hasNextPage: boolean;
//     hasPreviousPage: boolean;
//   };
// }

// // ── Request/Response Interceptors ─────────────────────────────────────────
// api.interceptors.request.use(
//   (config) => {
//     // You can add auth tokens here later
//     // const token = localStorage.getItem('auth_token');
//     // if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError<ApiError>) => {
//     // Centralized error handling
//     console.error("[API Error]", {
//       url: error.config?.url,
//       method: error.config?.method,
//       status: error.response?.status,
//       message: error.response?.data?.message || error.message,
//     });

//     // Transform error for UI consumption
//     const apiError: ApiError = {
//       error: error.response?.data?.error || "Request failed",
//       message: error.response?.data?.message || error.message,
//     };

//     return Promise.reject(apiError);
//   },
// );

// // ── API Methods ───────────────────────────────────────────────────────────

// /**
//  * Import artworks from Met Museum API
//  *
//  * This function searches the Met Museum's public API and imports matching artworks
//  * into the local database. It supports both free-text search and department filtering.
//  *
//  * @param searchTerm - Free text search query (default "*" for all items)
//  * @param departmentIds - Array of department IDs to filter results (optional)
//  * @param signal - AbortSignal to cancel the request if needed
//  * @returns Promise<ImportMetResponse> - Import results with stats and artwork data
//  *
//  * @example
//  * // Import all paintings from European Paintings department
//  * importFromMet("painting", [1])
//  *
//  * @example
//  * // Import all items (no filtering)
//  * importFromMet("*")
//  */
// export async function importFromMet(
//   searchTerm: string = "*",
//   departmentIds: number[] = [],
//   signal: AbortSignal,
// ): Promise<ImportMetResponse> {
//   const { data } = await api.post<ImportMetResponse>("/import/met", {
//     searchTerm,
//     departmentIds,
//   });
//   return data;
// }

// /**
//  * Fetch collection items with pagination
//  *
//  * Retrieves artworks from database with pagination support.
//  * Ideal for browse pages and large collections where loading all items at once
//  * would be inefficient.
//  *
//  * @param page - Page number to retrieve (default: 1, starts from 1)
//  * @param limit - Number of items per page (default: 100, max: 1000)
//  * @returns Promise<PaginatedResponse<Artwork>> - Paginated results with metadata
//  *
//  * @example
//  * // Get first page with 20 items
//  * const page1 = await getItems(1, 20);
//  *
//  * @example
//  * // Get second page
//  * const page2 = await getItems(2, 20);
//  */
// export const getItems = async (
//   page: number = 1,
//   limit: number = 100,
// ): Promise<PaginatedResponse<Artwork>> => {
//   const { data } = await api.get<PaginatedResponse<Artwork>>("/items", {
//     params: { page, limit },
//   });
//   return data;
// };

// /**
//  * Enrich a single artwork with AI-generated tags and metadata
//  *
//  * Sends an artwork to an AI service (likely OpenAI/ChatGPT) to generate
//  * descriptive keywords, contextual information, and enhanced metadata.
//  * The enrichment is stored with the artwork in the database.
//  *
//  * @param id - The artwork's UUID (primary key in database)
//  * @returns Promise<Artwork> - The enriched artwork with AI-generated data
//  *
//  * @example
//  * const enriched = await enrichArtwork("123e4567-e89b-12d3-a456-426614174000");
//  * console.log("AI keywords:", enriched.aiKeywords);
//  */
// export async function enrichArtwork(id: string): Promise<Artwork> {
//   const { data } = await api.post<Artwork>(`/enrich/${id}`);
//   return data;
// }

// /**
//  * Fetch available Met Museum departments
//  *
//  * Retrieves the list of departments from the Met Museum API.
//  * These are used for filtering imports and organizing the collection.
//  * Department IDs correspond to the Met Museum's internal department numbering.
//  *
//  * @returns Promise<Department[]> - Array of available departments
//  *
//  * @example
//  * const departments = await getDepartments();
//  * const europeanPaintings = departments.find(d => d.displayName.includes("European Paintings"));
//  */
// export async function getDepartments(): Promise<Department[]> {
//   const { data } = await api.get<Department[]>("/departments");
//   return data;
// }

// /**
//  * Health check endpoint for API connectivity
//  *
//  * Simple ping endpoint to verify the backend server is running
//  * and accessible. Useful for monitoring and debugging connectivity issues.
//  *
//  * @returns Promise<{ status: string }> - Server status response
//  *
//  * @example
//  * try {
//  *   const health = await healthCheck();
//  *   console.log("Server status:", health.status);
//  * } catch (error) {
//  *   console.error("Server unreachable");
//  * }
//  */
// export async function healthCheck(): Promise<{ status: string }> {
//   const { data } = await api.get<{ status: string }>("/health");
//   return data;
// }

// export interface CSVImportResponse {
//   success: boolean;
//   items: Artwork[];
//   stats: {
//     new: number;
//     updated: number;
//     removed: number;
//   };
//   message?: string;
// }

// /**
//  * Import artworks from CSV file with optional images
//  *
//  * Processes a CSV file containing artwork metadata and optionally
//  * associates image files with the artworks. The CSV should follow the
//  * expected column structure for artwork data (title, artist, year, etc.).
//  *
//  * @param csvFile - CSV file containing artwork metadata
//  * @param imageFiles - Optional array of image files to associate with CSV rows
//  * @returns Promise<CSVImportResponse> - Import results with stats and artwork data
//  *
//  * @example
//  * const csvFile = fileInput.files[0];
//  * const imageFiles = imageInput.files;
//  * const result = await importFromCSV(csvFile, imageFiles);
//  * console.log(`Imported ${result.stats.new} new artworks`);
//  */
// export async function importFromCSV(
//   csvFile: File,
//   imageFiles?: FileList | null,
// ): Promise<CSVImportResponse> {
//   const formData = new FormData();
//   formData.append("csv", csvFile);

//   // Add image files if provided
//   if (imageFiles && imageFiles.length > 0) {
//     Array.from(imageFiles).forEach((file) => {
//       formData.append("images", file);
//     });
//   }

//   // Use axios for the request but override Content-Type for FormData
//   const { data } = await api.post<CSVImportResponse>("/import/csv", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });

//   return data;
// }

// export interface DriveImportResponse {
//   success: boolean;
//   items: Artwork[];
//   stats: {
//     new: number;
//     updated: number;
//   };
// }

// /**
//  * Import artworks from Google Drive folder
//  *
//  * Processes a Google Drive folder containing image files and optionally
//  * metadata files. Requires OAuth2 authentication with Google Drive API.
//  * The backend handles the OAuth flow and file processing.
//  *
//  * @param folderId - Google Drive folder ID (from URL or picker)
//  * @param accessToken - OAuth2 access token for Google Drive API
//  * @returns Promise<DriveImportResponse> - Import results with stats and artwork data
//  *
//  * @example
//  * // After OAuth flow completes
//  * const result = await importFromDrive(folderId, accessToken);
//  * console.log(`Imported ${result.items.length} artworks from Drive`);
//  */
// export async function importFromDrive(
//   folderId: string,
//   accessToken: string,
// ): Promise<DriveImportResponse> {
//   const { data } = await api.post<DriveImportResponse>("/import/drive", {
//     folderId,
//     accessToken,
//   });
//   return data;
// }

// /**
//  * Get Google OAuth2 authorization URL
//  *
//  * Initiates the OAuth2 flow with Google Drive by generating an
//  * authorization URL. The user is redirected to Google to grant
//  * permissions, then Google redirects back with an authorization code.
//  *
//  * @returns Promise<string> - Google OAuth2 authorization URL
//  *
//  * @example
//  * const authUrl = await getGoogleAuthUrl();
//  * window.location.href = authUrl; // Redirect to Google
//  */
// export async function getGoogleAuthUrl(): Promise<string> {
//   const { data } = await api.get<{ url: string }>("/import/drive/auth");
//   return data.url;
// }

// /**
//  * Clear entire collection from database
//  *
//  * Deletes all artworks from the local database. This is a destructive
//  * operation typically used for testing or complete collection resets.
//  * Use with caution and consider adding confirmation dialogs.
//  *
//  * @returns Promise<{ success: boolean; count: number }> - Success status and count of deleted items
//  *
//  * @example
//  * if (confirm("Delete all artworks? This cannot be undone.")) {
//  *   const result = await clearCollection();
//  *   console.log(`Deleted ${result.count} artworks`);
//  * }
//  */

// /**
//  * Clear entire collection from database
//  *
//  * Deletes all artworks from local database. This is a destructive
//  * operation typically used for testing or complete collection resets.
//  * Use with caution and consider adding confirmation dialogs.
//  *
//  * @returns Promise<{ success: boolean; count: number }> - Success status and count of deleted items
//  *
//  * @example
//  * if (confirm("Delete all artworks? This cannot be undone.")) {
//  *   const result = await clearCollection();
//  *   console.log(`Deleted ${result.count} artworks`);
//  * }
//  */
// export async function clearCollection(): Promise<{
//   success: boolean;
//   count: number;
// }> {
//   const { data } = await api.delete<{ success: boolean; count: number }>(
//     "/clear",
//   );
//   return data;
// }

// /**
//  * Delete a single artwork from database
//  *
//  * Removes one artwork by its UUID. This is a soft delete that
//  * permanently removes the record from the database. Consider implementing
//  * a trash/recycle system if soft deletion is needed.
//  *
//  * @param id - The artwork's UUID to delete
//  * @returns Promise<{ success: boolean }> - Success status of the deletion
//  *
//  * @example
//  * const result = await deleteArtwork("123e4567-e89b-12d3-a456-426614174000");
//  * if (result.success) {
//  *   console.log("Artwork deleted successfully");
//  *   // Refresh UI or navigate away
//  * }
//  */
// export async function deleteArtwork(id: string): Promise<{ success: boolean }> {
//   const { data } = await api.delete<{ success: boolean }>(`/items/${id}`);
//   return data;
// }

// export default api;
// ── Changes from original ──────────────────────────────────────────────────
// The request interceptor now reads tema_token from localStorage and
// attaches it as Authorization: Bearer <token> on every request.
// The response interceptor now handles 401 by clearing localStorage
// and redirecting to login (triggers the auth gate in App.tsx).
// Everything else is unchanged.
// ─────────────────────────────────────────────────────────────────────────

import axios, { AxiosError } from "axios";
import type { Artwork } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

export interface ImportMetResponse {
  success: boolean;
  stats: { new: number; updated: number; skipped: number; removed: number };
  items: Artwork[];
  message?: string;
}

export interface Department {
  departmentId: number;
  displayName: string;
}
export interface ApiError {
  error: string;
  message?: string;
}
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ── Inject JWT on every request ───────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tema_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Handle 401: clear session and force re-login ──────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("tema_token");
      localStorage.removeItem("tema_user");
      // App.tsx auth gate will detect missing user and show LoginPage
      window.dispatchEvent(new Event("tema:logout"));
    }

    console.error("[API Error]", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    const apiError: ApiError = {
      error: error.response?.data?.error || "Request failed",
      message: error.response?.data?.message || error.message,
    };
    return Promise.reject(apiError);
  },
);

// ── API Methods (unchanged from original) ─────────────────────────────────

export async function importFromMet(
  searchTerm: string = "*",
  departmentIds: number[] = [],
  signal: AbortSignal,
): Promise<ImportMetResponse> {
  const { data } = await api.post<ImportMetResponse>("/import/met", {
    searchTerm,
    departmentIds,
  });
  return data;
}

export const getItems = async (
  page: number = 1,
  limit: number = 100,
): Promise<PaginatedResponse<Artwork>> => {
  const { data } = await api.get<PaginatedResponse<Artwork>>("/items", {
    params: { page, limit },
  });
  return data;
};

export async function enrichArtwork(id: string): Promise<Artwork> {
  const { data } = await api.post<Artwork>(`/enrich/${id}`);
  return data;
}

export async function getDepartments(): Promise<Department[]> {
  const { data } = await api.get<Department[]>("/departments");
  return data;
}

export async function healthCheck(): Promise<{ status: string }> {
  const { data } = await api.get<{ status: string }>("/health");
  return data;
}

export interface CSVImportResponse {
  success: boolean;
  items: Artwork[];
  stats: { new: number; updated: number; removed: number };
  message?: string;
}

export async function importFromCSV(
  csvFile: File,
  imageFiles?: FileList | null,
): Promise<CSVImportResponse> {
  const formData = new FormData();
  formData.append("csv", csvFile);
  if (imageFiles && imageFiles.length > 0) {
    Array.from(imageFiles).forEach((file) => formData.append("images", file));
  }
  const { data } = await api.post<CSVImportResponse>("/import/csv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export interface DriveImportResponse {
  success: boolean;
  items: Artwork[];
  stats: { new: number; updated: number };
}

export async function importFromDrive(
  folderId: string,
  accessToken: string,
): Promise<DriveImportResponse> {
  const { data } = await api.post<DriveImportResponse>("/import/drive", {
    folderId,
    accessToken,
  });
  return data;
}

export async function getGoogleAuthUrl(): Promise<string> {
  const { data } = await api.get<{ url: string }>("/import/drive/auth");
  return data.url;
}

export async function clearCollection(): Promise<{
  success: boolean;
  count: number;
}> {
  const { data } = await api.delete<{ success: boolean; count: number }>(
    "/clear",
  );
  return data;
}

export async function deleteArtwork(id: string): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/items/${id}`);
  return data;
}

// ── User Management API ───────────────────────────────────────────────────

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export async function getUsers(): Promise<UserRecord[]> {
  const { data } = await api.get<UserRecord[]>("/users");
  return data;
}

export async function createUser(payload: {
  email: string;
  name: string;
  password: string;
  role?: string;
}): Promise<UserRecord> {
  const { data } = await api.post<UserRecord>("/users", payload);
  return data;
}

export async function deleteUser(id: string): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/users/${id}`);
  return data;
}

export default api;
