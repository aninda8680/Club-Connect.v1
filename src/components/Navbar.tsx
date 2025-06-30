import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FaUserCircle } from "react-icons/fa"; // import profile icon

export default function Navbar() {
  const { user } = useAuth();
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


  return (
    <nav className="max-h-screen max-w-screen bg-0 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">Club Connect</div>

      <div className="flex items-center space-x-6">
        <Link to="/dashboard" className="hover:text-yellow-400">
          Dashboard
        </Link>

        {role === "admin" && (
          <>
            <Link to="/admin" className="hover:text-yellow-400">
              Admin Panel
            </Link>
            <Link to="/AdminEvents" className="hover:text-yellow-400">
              Events
            </Link>
          </>
        )}

        {role === "leader" && (
          <>
            <Link to="/LeaderEvents" className="hover:text-yellow-400">
              Events
            </Link>
            <Link to="/manage" className="hover:text-yellow-400">
              Members
            </Link>
          </>
        )}

        {(role === "member" || role === "visitor") && (
          <Link to="/events" className="hover:text-yellow-400">
            Events
          </Link>
        )}

        {user && (
          <>
            <Link to="/profile" className="text-white hover:text-yellow-400 text-2xl">
              <FaUserCircle />
            </Link>
            
          </>
        )}
      </div>
    </nav>
  );
}
