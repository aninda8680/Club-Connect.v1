// src/pages/Dashboard.tsx
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import AdminPanel from "../components/Panels/ADMIN/AdminPanel";
import ClubList from "../components/ClubList";
import LeaderPanel from "../components/Panels/LEADER/LeaderPanel";
import MemberPanel from "../components/Panels/MEMBER/MemberPanel";
import LeaderEventsPanel from "../components/Panels/LEADER/LeaderEventsPanel";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setRole(snap.data().role);
        }
      }
    };
    fetchRole();
  }, [user]);

  const renderRoleComponent = () => {
    switch (role) {
      case "admin":
        return <p className="text-green-400">👑 Admin Dashboard</p>;
      case "leader":
        return (
        <>
        <p className="text-yellow-400">🧑‍🏫 Club Leader Dashboard</p>
        <LeaderPanel/>
        </>
        );
      case "member":
        return (
        <>
        <p className="text-blue-400">👥 Club Member Dashboard</p>;
        <MemberPanel/>
        </>
        );

      case "visitor":
        return <p className="text-gray-400">Hii, newbie!</p>;
      default:
        return <p>Loading role...</p>;
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6 lg:p-8">
      <Navbar />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.displayName}</h1>
        
      </div>
      <div className="text-lg">{renderRoleComponent()}</div>

      {role === "admin" && <AdminPanel />}

      {role === "visitor" && <ClubList/>}

      

      
      
    </div>
  );
}
