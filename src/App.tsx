import { Routes, Route, Navigate } from "react-router-dom";
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
import Footer from "./components/Footer"

export default function App() {
  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-black text-slate-200 font-mono">
      <Navbar/>
      <main>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
