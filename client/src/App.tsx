// import { useState, useEffect } from "react";
// import { QueryClient, useQueryClient } from "@tanstack/react-query";
// import { Sidebar } from "./components/layout/Sidebar";
// import { TopBar } from "./components/layout/TopBar";
// import { DashboardPage } from "./pages/DashboardPage";
// import { ImportPage } from "./pages/ImportPage";
// import { BrowsePage } from "./pages/BrowsePage";
// import { SettingsPage } from "./pages/SettingsPage";
// import { useTheme } from "./theme/useTheme";
// import { useEnrichment } from "./hooks/useEnrichment";
// import type { Page } from "./types";

// const PAGE_META: Record<Page, { title: string; subtitle: string }> = {
//   dashboard: { title: "Dashboard", subtitle: "Overview of your collection" },
//   import: {
//     title: "Import Collection",
//     subtitle: "Sync artworks from data sources",
//   },
//   browse: {
//     title: "Browse Collection",
//     subtitle: "Explore your artwork library",
//   },
//   settings: { title: "Settings", subtitle: "Museum profile & configuration" },
// };

// export default function App() {
//   const [page, setPage] = useState<Page>("dashboard");
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

//   const queryClient = useQueryClient();

//   const { mode } = useTheme();

//   // const events = [
//   //   "click",
//   //   "pointerdown",
//   //   "pointerup",
//   //   "pointermove",
//   //   "wheel",
//   //   "mousedown",
//   //   "mouseup",
//   //   "touchstart",
//   //   "touchend",
//   //   "touchmove",
//   // ];

//   // events.forEach((ev) => {
//   //   window.addEventListener(
//   //     ev,
//   //     (e) => {
//   //       if (!e.target) return;

//   //       const target = e.target as Element;
//   //       const name =
//   //         target.getAttribute("data-debug") ||
//   //         target.className ||
//   //         target.nodeName;

//   //       console.log(`[EVENT] ${ev} on`, name);
//   //     },
//   //     { passive: true },
//   //   );
//   // });

//   // ── Handlers ─────────────────────────────────────────────────────────────
//   const handleImportComplete = () => {
//     console.log(">>> [DEBUG] Invalidating collection query to force refresh");
//     queryClient.invalidateQueries({ queryKey: ["items"] });
//     setPage("browse"); // Navigate to browse after successful import
//   };

//   // ── Dynamic subtitle with count ──────────────────────────────────────────
//   const subtitle = PAGE_META[page].subtitle;

//   return (
//     <AppContent
//       page={page}
//       setPage={setPage}
//       sidebarCollapsed={sidebarCollapsed}
//       setSidebarCollapsed={setSidebarCollapsed}
//       subtitle={subtitle}
//       onImportComplete={handleImportComplete}
//     />
//   );
// }

// function AppContent({
//   page,
//   setPage,
//   sidebarCollapsed,
//   setSidebarCollapsed,
//   subtitle,
//   onImportComplete,
// }: {
//   page: Page;
//   setPage: (page: Page) => void;
//   sidebarCollapsed: boolean;
//   setSidebarCollapsed: (collapsed: boolean) => void;
//   subtitle: string;
//   onImportComplete: () => void;
// }) {
//   const { enrich, isEnriching } = useEnrichment();

//   const handleEnrich = async (id: string) => {
//     await enrich(id);
//   };

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     // If we see 'code' in the URL, it means Google just sent us back
//     if (params.get("code")) {
//       setPage("import");
//     }
//   }, []);

//   return (
//     <div
//       style={{
//         display: "flex",
//         height: "100vh",
//         overflow: "hidden",
//         background: "var(--bg)",
//       }}
//     >
//       {/* Background texture */}
//       <div
//         style={{
//           position: "fixed",
//           inset: 0,
//           pointerEvents: "none",
//           zIndex: 0,
//           backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.03) 0%, transparent 60%),
//                          radial-gradient(ellipse at 80% 20%, rgba(139,26,26,0.04) 0%, transparent 50%)`,
//         }}
//       />

//       <Sidebar
//         page={page}
//         setPage={setPage}
//         collapsed={sidebarCollapsed}
//         setCollapsed={setSidebarCollapsed}
//       />

//       <div
//         style={{
//           flex: 1,
//           display: "flex",
//           flexDirection: "column",
//           overflow: "hidden",
//           position: "relative",
//           zIndex: 1,
//         }}
//       >
//         <TopBar title={PAGE_META[page].title} subtitle={subtitle} />

//         <div style={{ flex: 1, overflow: "hidden" }}>
//           {/* Pages */}
//           {page === "dashboard" && <DashboardPage setPage={setPage} />}
//           {page === "import" && (
//             <ImportPage onImportComplete={onImportComplete} />
//           )}
//           {page === "browse" && (
//             <BrowsePage
//               onEnrich={handleEnrich}
//               isEnriching={isEnriching}
//               onImport={() => setPage("import")}
//             />
//           )}
//           {page === "settings" && <SettingsPage />}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { DashboardPage } from "./pages/DashboardPage";
import { ImportPage } from "./pages/ImportPage";
import { BrowsePage } from "./pages/BrowsePage";
import { SettingsPage } from "./pages/SettingsPage";
import { UsersPage } from "./pages/UsersPage";
import { LoginPage } from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./theme/useTheme";
import { useEnrichment } from "./hooks/useEnrichment";
import type { Page } from "./types";

const PAGE_META: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview of your collection" },
  import: {
    title: "Import Collection",
    subtitle: "Sync artworks from data sources",
  },
  browse: {
    title: "Browse Collection",
    subtitle: "Explore your artwork library",
  },
  settings: { title: "Settings", subtitle: "Museum profile & configuration" },
  users: { title: "Team Members", subtitle: "Manage who has access" },
};

export default function App() {
  const { user, isLoading, logout } = useAuth();
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const queryClient = useQueryClient();
  const { mode } = useTheme();

  // Listen for forced logouts from the axios interceptor (401 responses)
  useEffect(() => {
    const handler = () => {
      queryClient.clear();
      setPage("dashboard");
    };
    window.addEventListener("tema:logout", handler);
    return () => window.removeEventListener("tema:logout", handler);
  }, [queryClient]);

  // ── While restoring session from localStorage, show nothing ──────────────
  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <div style={{ color: "var(--text-dim)", fontSize: 13 }}>Loading…</div>
      </div>
    );
  }

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!user) {
    return <LoginPage />;
  }

  // ── Authenticated app ─────────────────────────────────────────────────────
  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
    setPage("browse");
  };

  const subtitle = PAGE_META[page].subtitle;

  return (
    <AppContent
      page={page}
      setPage={setPage}
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
      subtitle={subtitle}
      onImportComplete={handleImportComplete}
      onLogout={() => {
        logout();
        queryClient.clear();
        setPage("dashboard");
      }}
    />
  );
}

function AppContent({
  page,
  setPage,
  sidebarCollapsed,
  setSidebarCollapsed,
  subtitle,
  onImportComplete,
  onLogout,
}: {
  page: Page;
  setPage: (page: Page) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  subtitle: string;
  onImportComplete: () => void;
  onLogout: () => void;
}) {
  const { enrich, isEnriching } = useEnrichment();

  const handleEnrich = async (id: string): Promise<void> => {
    await enrich(id);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("code")) setPage("import");
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {/* Background texture */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.03) 0%, transparent 60%),
                           radial-gradient(ellipse at 80% 20%, rgba(139,26,26,0.04) 0%, transparent 50%)`,
        }}
      />

      <Sidebar
        page={page}
        setPage={setPage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={onLogout}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        <TopBar title={PAGE_META[page].title} subtitle={subtitle} />

        <div style={{ flex: 1, overflow: "hidden" }}>
          {page === "dashboard" && <DashboardPage setPage={setPage} />}
          {page === "import" && (
            <ImportPage onImportComplete={onImportComplete} />
          )}
          {page === "browse" && (
            <BrowsePage
              onEnrich={handleEnrich}
              isEnriching={isEnriching}
              onImport={() => setPage("import")}
            />
          )}
          {page === "settings" && <SettingsPage />}
          {page === "users" && <UsersPage />}
        </div>
      </div>
    </div>
  );
}
