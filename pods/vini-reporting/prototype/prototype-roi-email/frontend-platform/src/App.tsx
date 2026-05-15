import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { DashboardHome } from "./pages/DashboardHome";
import { LeadDrilldown } from "./pages/LeadDrilldown";
import { RecipientsList } from "./pages/RecipientsList";
import { SubscriptionsEdit } from "./pages/SubscriptionsEdit";
import { CustomizationOverview } from "./pages/CustomizationOverview";
import { LogsPage, LogDetailPage } from "./pages/LogsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/dashboard/lead/:leadId" element={<LeadDrilldown />} />
        <Route path="/settings/recipients" element={<RecipientsList />} />
        <Route
          path="/settings/subscriptions/:recipientId"
          element={<SubscriptionsEdit />}
        />
        <Route path="/settings/customization" element={<CustomizationOverview />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/logs/:logId" element={<LogDetailPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
