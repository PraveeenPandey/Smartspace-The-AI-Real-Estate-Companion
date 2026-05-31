import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./auth/AuthContext";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DiscoveryPage from "./pages/DiscoveryPage";
import DocumentsPage from "./pages/DocumentsPage";
import ListingPage from "./pages/ListingPage";
import LoginPage from "./pages/LoginPage";
import MarketingHomePage from "./pages/MarketingHomePage";
import UserHomePage from "./pages/UserHomePage";

function App() {
  const { session } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<MarketingHomePage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <AppLayout role="user" />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserHomePage />} />
        <Route path="discovery" element={<DiscoveryPage />} />
        <Route path="listing" element={<ListingPage />} />
        <Route path="documents" element={<DocumentsPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AppLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={session ? (session.role === "admin" ? "/admin" : "/app") : "/"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
