import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ActionItemsPage } from "./pages/ActionItemsPage";
import { CustomerProfilePage } from "./pages/CustomerProfilePage";
import { DocsIndexPage, DocsViewerPage } from "./pages/DocsPage";

export function App() {
  const location = useLocation();
  const isDocs = location.pathname.startsWith("/docs");

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/action-items/pending" replace />} />
        <Route path="/action-items" element={<Navigate to="/action-items/pending" replace />} />
        <Route path="/action-items/pending" element={<ActionItemsPage tab="pending" />} />
        <Route path="/action-items/completed" element={<ActionItemsPage tab="completed" />} />
        <Route path="/customers/:customerId" element={<CustomerProfilePage />} />
        <Route path="/docs" element={<DocsIndexPage />} />
        <Route path="/docs/:slug" element={<DocsViewerPage />} />
        <Route path="*" element={<Navigate to="/action-items/pending" replace />} />
      </Routes>
      {/* Subtle hint about pathname for debugging via DevTools */}
      <div className="hidden" data-route={isDocs ? "docs" : "app"} />
    </AppShell>
  );
}
