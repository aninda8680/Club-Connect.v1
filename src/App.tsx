import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoutes";
import PublicEventList from "./components/Panels/PublicEventList";
import LeaderEventsPanel from "./components/Panels/LEADER/LeaderEventsPanel";
import LeaderMember from "./components/Panels/LEADER/LeaderMember";

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
    </Routes>
  );
}
