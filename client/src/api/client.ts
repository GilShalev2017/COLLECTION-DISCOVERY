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
  timeout: 60000,
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
