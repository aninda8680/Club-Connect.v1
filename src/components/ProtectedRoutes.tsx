// src/components/ProtectedRoutes.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {JSX} from "react";

type ProtectedRouteProps = {
  children: JSX.Element;
  requireAuth?: boolean; // ✅ optional
};

export default function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-slate-200">
        <p className="animate-pulse">Checking authentication...</p>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
