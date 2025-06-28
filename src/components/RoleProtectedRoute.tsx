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
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userRole = userSnap.data().role;
          if (typeof userRole === "string") {
            setRole(userRole);
          } else {
            console.warn("⚠️ Invalid role format");
            setRole(null);
          }
        } else {
          console.warn("⚠️ No user document found");
          setRole(null);
        }
      } catch (error) {
        console.error("❌ Error fetching user role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <p className="text-xl mb-4 animate-pulse">🔄 Checking access permissions...</p>
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-8 h-8 m-auto border-4 border-transparent border-t-purple-400 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  // Role check failed
  if (!role || !allowedRoles.includes(role)) {
    if (!accessDenied) {
      toast.error("🚫 Access Denied: You are not authorized to view this page.");
      setAccessDenied(true); // prevent duplicate toasts
    }
    return <Navigate to="/not-authorized" replace />;
  }

  // ✅ Authorized
  return <>{children}</>;
}
