// src/components/RoleProtectedRoute.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { Navigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function RoleProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        setRole(snap.exists() ? snap.data().role : null);
      }
      setLoading(false);
    };
    fetchRole();
  }, [user]);

  if (!user) return <Navigate to="/" replace />;
  if (loading) return <p className="text-white">Checking access...</p>;
  if (!allowedRoles.includes(role!)) return <Navigate to="/dashboard" replace />;

  return children;
}
