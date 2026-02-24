# Museum CMS Implementation Cheat Sheet

## 🏗️ Architecture Overview

### Core Data Flow
```
UI Component → Custom Hook → API Client → Backend → Database
     ↓              ↓             ↓           ↓        ↓
   State      →   Business Logic → HTTP Request → Response → Data
```

### Key Technologies
- **Frontend**: React + TypeScript + Vite
- **State Management**: React Query (TanStack Query)
- **Styling**: CSS-in-JS with CSS Variables
- **HTTP Client**: Axios with interceptors
- **Backend**: Node.js/Express (implied from API structure)

---

## 📁 File Structure & Responsibilities

```
src/
├── api/client.ts          # HTTP client & API methods
├── hooks/
│   ├── useCollection.ts   # Data fetching & business logic
│   └── useEnrichment.ts # AI enrichment logic
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/           # Layout components (Sidebar, TopBar)
│   ├── collection/       # Artwork display components
│   └── import/          # Import-specific components
├── pages/               # Route-level components
├── types/               # TypeScript type definitions
└── theme/               # Styling & theme configuration
```

---

## 🔄 End-to-End Data Flow Scenarios

### 1. Met Museum Import Flow

```typescript
// 1. UI Component (ImportPage.tsx)
const { runImport, importing, progress, result } = useMetImport();

const handleImport = () => {
  runImport(searchTerm, selectedDepts);
};

// 2. Custom Hook (useCollection.ts)
export function useMetImport() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ stage: "", percent: 0 });
  
  const runImport = async (searchTerm: string, departmentIds: number[]) => {
    setImporting(true);
    setProgress({ stage: "Connecting...", percent: 10 });
    
    try {
      // 3. API Client Call
      const data = await importFromMet(searchTerm, departmentIds, signal);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };
}

// 4. API Client (client.ts)
export async function importFromMet(
  searchTerm: string,
  departmentIds: number[],
  signal: AbortSignal
): Promise<ImportMetResponse> {
  const { data } = await api.post<ImportMetResponse>("/import/met", {
    searchTerm,
    departmentIds,
  });
  return data;
}

// 5. UI Updates
return { importing, progress, result, error, runImport };
```

### 2. Google Drive Import Flow (Special Attention)

```typescript
// 1. OAuth Flow Initiation (DriveImportCard.tsx)
const handleConnect = async () => {
  localStorage.setItem("pending_drive_folder_id", folderIdInput);
  await initiateDriveImport(); // Redirects to Google OAuth
};

// 2. OAuth Callback Handling
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const savedFolderId = localStorage.getItem("pending_drive_folder_id");
  
  if (code && savedFolderId) {
    window.history.replaceState({}, document.title, "/");
    localStorage.removeItem("pending_drive_folder_id");
    
    // Auto-start import with auth code
    runImport(savedFolderId, code);
  }
}, [runImport]);

// 3. Hook Implementation (useCollection.ts)
export function useDriveImport() {
  const initiateDriveImport = async () => {
    const url = await getGoogleAuthUrl();
    window.location.href = url; // OAuth redirect
  };
  
  const runImport = async (folderId: string, accessToken: string) => {
    setImporting(true);
    try {
      const data = await importFromDrive(folderId, accessToken);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };
}

// 4. API Client Methods
export async function getGoogleAuthUrl(): Promise<string> {
  const { data } = await api.get<{ url: string }>("/import/drive/auth");
  return data.url;
}

export async function importFromDrive(
  folderId: string,
  accessToken: string
): Promise<DriveImportResponse> {
  const { data } = await api.post<DriveImportResponse>("/import/drive", {
    folderId,
    accessToken,
  });
  return data;
}
```

### 3. Artwork Deletion Flow

```typescript
// 1. UI Component (ArtworkCard.tsx)
const handleDelete = async (e: React.MouseEvent) => {
  e.stopPropagation(); // Prevent modal opening
  if (!window.confirm("Delete this artwork?")) return;
  
  setIsDeleting(true);
  try {
    await deleteArtwork(artwork.id);
    queryClient.invalidateQueries({ queryKey: ["items"] });
  } catch (err) {
    alert("Failed to delete");
    setIsDeleting(false);
  }
};

// 2. API Client
export async function deleteArtwork(id: string): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/items/${id}`);
  return data;
}

// 3. UI State Update
// React Query automatically refetches and updates UI
```

---

## 🎯 Component Relationships & Data Propagation

### Parent-Child Data Flow

```typescript
// App.tsx (Root)
export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const queryClient = useQueryClient();
  
  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
    setPage("browse"); // Navigate after import
  };
  
  return (
    <AppContent
      page={page}
      setPage={setPage}
      onImportComplete={handleImportComplete}
    />
  );
}

// ImportPage.tsx (Child)
export function ImportPage({ onImportComplete }: ImportPageProps) {
  const handleSuccess = (items: Artwork[]) => {
    onImportComplete(items); // Propagate up to App
  };
  
  return (
    <DriveImportCard onComplete={handleSuccess} />
  );
}
```

### Sibling Component Communication (via Query Cache)

```typescript
// BrowsePage.tsx
const { items, loading } = usePaginatedItems(page, limit);

// ArtworkCard.tsx (Child of BrowsePage)
const queryClient = useQueryClient();

const handleDelete = async () => {
  await deleteArtwork(id);
  // This triggers automatic refresh in BrowsePage
  queryClient.invalidateQueries({ queryKey: ["items"] });
};
```

---

## 🔧 React Query Patterns

### Query Key Convention
```typescript
// Standardized keys for cache invalidation
["items"]           // All items
["items", page]     // Paginated items
["departments"]     // Department list
["artwork", id]    // Single artwork
```

### Cache Invalidation Patterns
```typescript
// Global refresh
queryClient.invalidateQueries({ queryKey: ["items"] });

// Specific refresh
queryClient.invalidateQueries({ queryKey: ["artwork", id] });

// Optimistic updates
queryClient.setQueryData(["items"], (old) => 
  old?.filter(item => item.id !== deletedId)
);
```

### Custom Hook Pattern
```typescript
export function useCustomHook() {
  const [state, setState] = useState(initialState);
  const queryClient = useQueryClient();
  
  const action = async (params) => {
    setState(loading);
    try {
      const result = await apiCall(params);
      setState(success);
      queryClient.invalidateQueries({ queryKey: ["relevant-key"] });
      return result;
    } catch (err) {
      setState(error);
    }
  };
  
  return { state, action, reset };
}
```

---

## 🎨 Styling Architecture

### CSS Variables System
```typescript
// theme.ts
export const CSS_VARIABLES_DARK = `
  :root {
    --gold: #C9A84C;
    --surface: #0D0A04;
    --text: #F5F0E8;
    --border: rgba(201,168,76,0.2);
  }
`;
```

### Component Styling Pattern
```typescript
// Inline styles with CSS variables
<div style={{
  background: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  transition: "all 0.2s ease",
}} />
```

---

## 📡 API Client Configuration

### Axios Setup
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor (for auth tokens)
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('auth_token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor (error handling)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    console.error("[API Error]", error.response?.data);
    return Promise.reject(transformError(error));
  }
);
```

### Type Safety
```typescript
export interface ImportMetResponse {
  success: boolean;
  stats: { new: number; updated: number; skipped: number; };
  items: Artwork[];
  message?: string;
}

export async function importFromMet(
  searchTerm: string,
  departmentIds: number[],
  signal: AbortSignal
): Promise<ImportMetResponse> {
  const { data } = await api.post<ImportMetResponse>("/import/met", {
    searchTerm, departmentIds,
  });
  return data;
}
```

---

## 🔄 State Management Patterns

### Local Component State
```typescript
const [isHovered, setIsHovered] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
```

### Global State via React Query
```typescript
// Automatic caching and synchronization
const { data: items, isLoading, error } = useQuery({
  queryKey: ["items"],
  queryFn: getCollectionItems,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Optimistic Updates
```typescript
const mutation = useMutation({
  mutationFn: deleteArtwork,
  onMutate: async (id) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries({ queryKey: ["items"] });
    
    // Snapshot previous value
    const previousItems = queryClient.getQueryData(["items"]);
    
    // Optimistically update
    queryClient.setQueryData(["items"], (old) => 
      old?.filter(item => item.id !== id)
    );
    
    return { previousItems };
  },
  onError: (err, id, context) => {
    // Rollback on error
    queryClient.setQueryData(["items"], context.previousItems);
  },
  onSettled: () => {
    // Always refetch after error/success
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});
```

---

## 🚀 Error Handling Patterns

### API Error Handling
```typescript
try {
  const result = await apiCall();
  setResult(result);
} catch (err) {
  const apiError = err as ApiError;
  setError(apiError.message || "Operation failed");
  console.error("API Error:", apiError);
} finally {
  setLoading(false);
}
```

### User-Friendly Error Messages
```typescript
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};
```

---

## 🔐 Google Drive Integration Details

### OAuth 2.0 Flow
1. **Initiation**: User clicks "Connect" → `getGoogleAuthUrl()` → Redirect to Google
2. **Authorization**: User grants permissions → Google redirects back with `code`
3. **Token Exchange**: Backend exchanges `code` for `access_token`
4. **Import**: Backend uses `access_token` to access Drive files
5. **Processing**: Files are downloaded, processed, and stored

### State Persistence
```typescript
// Save folder ID before OAuth redirect
localStorage.setItem("pending_drive_folder_id", folderId);

// Retrieve after OAuth callback
const savedFolderId = localStorage.getItem("pending_drive_folder_id");
```

### Error Handling for Drive
```typescript
const handleDriveError = (error: any) => {
  if (error.status === 401) {
    setError("Google authorization expired. Please reconnect.");
  } else if (error.status === 403) {
    setError("Access denied to Google Drive folder.");
  } else {
    setError(error.message || "Drive import failed");
  }
};
```

---

## 📊 Performance Optimizations

### Image Loading
```typescript
const [imgLoaded, setImgLoaded] = useState(false);
const [errorCount, setErrorCount] = useState(0);

const handleImageError = () => {
  if (errorCount >= 2) {
    imgRef.current.src = FALLBACK_IMAGE;
    return;
  }
  
  // Retry with cache-busting
  setTimeout(() => {
    imgRef.current.src = `${imageUrl}?retry=${Date.now()}`;
  }, 2000);
};
```

### Pagination
```typescript
export function usePaginatedItems(page: number, limit: number) {
  return useQuery({
    queryKey: ["items", page, limit],
    queryFn: () => getItems(page, limit),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true, // Smooth pagination
  });
}
```

---

## 🧪 Testing Patterns

### Component Testing
```typescript
// Mock API calls
jest.mock('../api/client', () => ({
  importFromMet: jest.fn(),
  getCollectionItems: jest.fn(),
}));

// Test component behavior
test('should show loading state during import', async () => {
  importFromMet.mockResolvedValue(mockResponse);
  
  render(<ImportPage />);
  
  fireEvent.click(screen.getByText('Import'));
  expect(screen.getByTestId('spinner')).toBeInTheDocument();
});
```

### Hook Testing
```typescript
test('should handle import success', async () => {
  const { result } = renderHook(() => useMetImport());
  
  await act(async () => {
    await result.current.runImport('test', []);
  });
  
  expect(result.current.result).toEqual(mockResponse);
  expect(result.current.importing).toBe(false);
});
```

---

## 🚀 Deployment Considerations

### Environment Variables
```typescript
// .env
VITE_API_URL=https://api.museum-cms.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
```

---

## 📝 Quick Reference

### Common Imports
```typescript
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiMethod } from '../api/client';
import type { Artwork } from '../types';
```

### Standard Hook Return Pattern
```typescript
return {
  data,
  loading,
  error,
  refetch,
  // Action methods
  create,
  update,
  delete,
};
```

### Component Props Pattern
```typescript
interface ComponentProps {
  data: Artwork[];
  onAction: (item: Artwork) => void;
  loading?: boolean;
  disabled?: boolean;
}
```

---

## 🔍 Debugging Tips

### Console Logging Patterns
```typescript
console.log(">>> [DEBUG] Import started:", { searchTerm, departmentIds });
console.log(">>> [DEBUG] API response:", data);
console.log(">>> [DEBUG] State updated:", { importing, progress });
```

### Error Debugging
```typescript
// Log full error object
console.error(">>> [ERROR] Full error:", {
  message: err.message,
  stack: err.stack,
  response: err.response?.data,
  status: err.response?.status,
});
```

---

This cheat sheet covers the core implementation patterns, data flows, and architectural decisions in the Museum CMS. Use it as a reference for understanding how components interact, how data flows through the application, and how to implement new features following the established patterns.
