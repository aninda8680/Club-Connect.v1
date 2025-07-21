// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

import AdminPanel from "../components/Panels/ADMIN/AdminPanel";
import LeaderPanel from "../components/Panels/LEADER/LeaderPanel";
import MemberPanel from "../components/Panels/MEMBER/MemberPanel";
import PublicPanel from "../components/Panels/PUBLIC/PublicPanel";

export default function Dashboard() {
  const { user } = useAuth();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchUserRole = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setRole(data?.role || "visitor");
        } else {
          setRole("visitor");
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        setRole("visitor");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-xl">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <>
      {role === "admin" && <AdminPanel />}
      {role === "leader" && <LeaderPanel />}
      {role === "member" && <MemberPanel />}
      {role === "visitor" && <PublicPanel />}

    </>
  );
}
