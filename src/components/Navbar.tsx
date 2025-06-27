import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { Typewriter } from 'react-simple-typewriter';
import LeaderEventsPanel from "./Panels/LEADER/LeaderEventsPanel";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setRole(snap.data().role);
      }
    };
    fetchRole();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className=" max-h-screen max-w-screen bg-0 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">Club Connect</div>
      

      <div className="space-x-6">
        <Link to="/dashboard" className="hover:text-yellow-400">
          Dashboard
        </Link>

        {role === "admin" && (
          <Link to="/admin" className="hover:text-yellow-400">
            Admin Panel
          </Link>
        )}

        {role === "leader" && (
          <>
            <Link to='/LeaderEvents' className="hover:text-yellow-400">
              Events
            </Link>
            <Link to="/manage" className="hover:text-yellow-400">
              Members
            </Link>
          </>
        )}

        {role === "visitor" && (
          <Link to="/events" className="hover:text-yellow-400">
            Events
          </Link>
        )}

        {user && (
          <button
            onClick={handleLogout}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
