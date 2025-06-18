// src/pages/Dashboard.tsx
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import AdminPanel from "../components/AdminPanel";
import ClubList from "../components/ClubList";
import LeaderPanel from "../components/LeaderPanel";
import MemberPanel from "../components/MemberPanel";

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
        return <p className="text-gray-400">👀 Visitor View</p>;
      default:
        return <p>Loading role...</p>;
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.displayName}</h1>
        <button
          onClick={() => signOut(auth)}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      <div className="text-lg">{renderRoleComponent()}</div>

      {/*Show thw Admin Panel if user is admin*/}
      {role === "admin" && <AdminPanel />}
      {role === "leader" && <LeaderPanel />}
      {role === "member" && <MemberPanel />}
      {role === "visitor" && <ClubList/>}
      
    </div>
  );
}
