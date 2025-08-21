import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LandingPage from "./pages/landing";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoutes";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import PublicEventList from "./components/Panels/PUBLIC/PublicEventList";
import LeaderEventsPanel from "./components/Panels/LEADER/LeaderEventsPanel";
import LeaderMember from "./components/Panels/LEADER/LeaderMember";
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
    location.pathname === "/complete-profile";
    location.pathname === "/Profile";

  return (
    <div className="h-screen w-screen overflow-x-hidden bg-black text-slate-200 font-mono">

      {!hideNavbar && user && profileComplete && <Navbar />}

      <main>
        <Routes>
          {/* Public routes → no firebase wait */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/clubs/cy-coders" element={<CyCoders />} />
          <Route path="/events" element={<PublicEventList />} />

          {/* ✅ Profile completion (wait for firebase) */}
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

          {/* ✅ Dashboard (wait for firebase) */}
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

          {/* Other protected routes */}
          <Route
            path="/AdminClub"
            element={
              <ProtectedRoute requireAuth>
                <AdminClub />
              </ProtectedRoute>
            }
          />

          <Route
            path="/LeaderEvents"
            element={
              <ProtectedRoute requireAuth>
                <LeaderEventsPanel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage"
            element={
              <ProtectedRoute requireAuth>
                <LeaderMember />
              </ProtectedRoute>
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

          <Route path="/not-authorized" element={<NotAuthorized />} />
          <Route path="/Profile" element={<Profile />} />

          <Route
            path="/AdminEvents"
            element={
              <ProtectedRoute requireAuth>
                <AdminEventPage />
              </ProtectedRoute>
            }
          />

          {/* ✅ Catch-all fallback */}
          <Route
            path="*"
            element={<Navigate to={user ? "/dashboard" : "/"} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}
