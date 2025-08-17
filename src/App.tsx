// src/App.tsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
//import Footer from "./components/Footer";
import ChatPage from "./pages/ChatPage";
import CyCoders from "./pages/Clubs/Cy-Coders/Cy-Coders";

export default function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/" || location.pathname === "/auth" || location.pathname === "/clubs/cy-coders";

  return (
    <div className="h-screen w-screen overflow-x-hidden bg-black text-slate-200 font-mono">
      {!hideNavbar && <Navbar />}
      <main>
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/clubs/cy-coders" element={<CyCoders />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected user routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/AdminClub"
            element={
              <ProtectedRoute>
                <AdminClub />
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

          <Route
            path="/admin/clubs/:clubId"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <AdminClubDash />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="/clubs/:clubId/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route path="/not-authorized" element={<NotAuthorized />} />
          <Route path="/Profile" element={<Profile />} />

          <Route
            path="/AdminEvents"
            element={
              <ProtectedRoute>
                <AdminEventPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {/* <Footer /> */}
    </div>
  );
}
