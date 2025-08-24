import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LandingPage from "./pages/landing";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoutes";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import PublicEventList from "./components/Panels/PUBLIC/PublicEventList";
import CoordinatorEventsPanel from "./components/Panels/COORDINATOR/CoordinatorEventsPanel";
import CoordinatorMember from "./components/Panels/COORDINATOR/CoordinatorMember/CoordinatorMember";
import ClubMembers from "./components/Panels/COORDINATOR/CoordinatorMember/ClubMembers";
import JoinRequests from "./components/Panels/COORDINATOR/CoordinatorMember/JoinRequests";
import AdminClubDash from "./components/Panels/ADMIN/AdminClubDash";
import NotAuthorized from "./pages/NotAuthorized";
import AdminEventPage from "./components/Panels/ADMIN/AdminEvents";
import Profile from "./pages/Profile";
import AdminClub from "./components/Panels/ADMIN/AdminClubs";
import Navbar from "./components/Navbar";
import CyCoders from "./pages/Clubs/Cy-Coders/Cy-Coders";
import ProfileCompletionPage from "./pages/ProfileCompletionPage";

export default function App() {
  const location = useLocation();
  const { user, loading, profileComplete } = useAuth();

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/auth" ||
    location.pathname.startsWith("/clubs/") ||
    location.pathname === "/complete-profile" ||
    location.pathname === "/Profile";

  return (
    <div className="h-screen w-screen overflow-x-hidden bg-black text-slate-200 font-mono">

      {!hideNavbar && user && profileComplete && <Navbar />}

      <main>
        <Routes>
          {/* 🌍 Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/clubs/cy-coders" element={<CyCoders />} />
          <Route path="/events" element={<PublicEventList />} />

          {/* 👤 Profile completion */}
          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute requireAuth>
                {loading ? (
                  <div className="flex items-center justify-center h-screen bg-black text-slate-200">
                    <p className="text-lg animate-pulse">Loading...</p>
                  </div>
                ) : profileComplete ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <ProfileCompletionPage />
                )}
              </ProtectedRoute>
            }
          />

          {/* 📊 Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireAuth>
                {loading ? (
                  <div className="flex items-center justify-center h-screen bg-black text-slate-200">
                    <p className="text-lg animate-pulse">Loading...</p>
                  </div>
                ) : profileComplete ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/complete-profile" replace />
                )}
              </ProtectedRoute>
            }
          />

          {/* 🛠️ Admin routes */}
          <Route
            path="/AdminClub"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <AdminClub />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/clubs/:clubId"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <AdminClubDash />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/AdminEvents"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <AdminEventPage />
              </RoleProtectedRoute>
            }
          />






          {/* 🎯 Coordinator routes */}
          <Route
            path="/CoordinatorEvents"
            element={
              <RoleProtectedRoute allowedRoles={["coordinator"]}>
                <CoordinatorEventsPanel />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/coordinator-member"
            element={
              <RoleProtectedRoute allowedRoles={["coordinator"]}>
                <CoordinatorMember />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/club-members"
            element={
              <RoleProtectedRoute allowedRoles={["coordinator"]}>
                <ClubMembers />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/join-requests"
            element={
              <RoleProtectedRoute allowedRoles={["coordinator"]}>
                <JoinRequests />
              </RoleProtectedRoute>
            }
          />





          

          {/* 👤 Profile & auth pages */}
          <Route path="/Profile" element={<Profile />} />
          <Route path="/not-authorized" element={<NotAuthorized />} />

          {/* 🛑 Catch-all fallback */}
          <Route
            path="*"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}
