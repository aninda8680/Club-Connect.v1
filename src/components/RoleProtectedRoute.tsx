// src/components/RoleProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

type Props = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export default function RoleProtectedRoute({ children, allowedRoles }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      // Wait at least 500ms to prevent flash
      const timer = setTimeout(() => setMinLoadingTime(false), 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  // Wait for auth to finish loading AND minimum time
  if (authLoading || minLoadingTime) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
        <p className="text-xl mb-4 animate-pulse">Wait for a while...!!!!</p>
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-8 h-8 m-auto border-4 border-transparent border-t-purple-400 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Role check failed
  if (!user.role || !allowedRoles.includes(user.role)) {
    if (!accessDenied) {
      toast.error("🚫 Access Denied: You are not authorized to view this page.");
      setAccessDenied(true); // prevent duplicate toasts
    }
    return <Navigate to="/not-authorized" replace />;
  }

  // ✅ Authorized
  return <>{children}</>;
}
