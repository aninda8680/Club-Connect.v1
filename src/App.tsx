import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoutes";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import PublicEventList from "./components/Panels/PublicEventList";
import LeaderEventsPanel from "./components/Panels/LEADER/LeaderEventsPanel";
import LeaderMember from "./components/Panels/LEADER/LeaderMember";
import AdminClubDash from "./components/Panels/ADMIN/AdminClubDash";
import NotAuthorized from "./pages/NotAuthorized"; //for not auhtorization
import AdminEventPage from "./components/Panels/ADMIN/AdminEvents";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/events" element={<PublicEventList />} />

      <Route
        path="/LeaderEvents"
        element={
          <ProtectedRoute>
            <LeaderEventsPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage"
        element={
          <ProtectedRoute>
            <LeaderMember />
          </ProtectedRoute>
        }
      />

      {/* ✅ Add this route for Admin Club Dashboard */}
      <Route
  path="/admin/clubs/:clubId"
  element={
    <RoleProtectedRoute allowedRoles={["admin"]}>
      <AdminClubDash />
    </RoleProtectedRoute>
  }
/>

      {/* ✅ Fallback for not-authorized */}
      <Route path="/not-authorized" element={<NotAuthorized />} />

      {/* Optional: catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />

      <Route path="/Profile" element={<Profile />} />

      <Route
        path="/AdminEvents"
        element={
          <ProtectedRoute>
            <AdminEventPage />
          </ProtectedRoute>
        }
      />

    </Routes>

  


  );
}
