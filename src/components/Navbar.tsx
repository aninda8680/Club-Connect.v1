import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { FaUserCircle } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Shield, User, Globe } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const [role, setRole] = useState("");
  const [clubId, setClubId] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchRoleAndClubId = async () => {
      if (!user) return;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setRole(userData.role || "");

        // Use direct clubId if stored in user doc
        if (userData.clubId) {
          setClubId(userData.clubId);
        } else {
          // Fallback: lookup club membership
          const clubsSnapshot = await getDocs(collection(db, "clubs"));
          for (const clubDoc of clubsSnapshot.docs) {
            const membersRef = collection(db, "clubs", clubDoc.id, "members");
            const q = query(membersRef, where("userId", "==", user.uid));
            const memberSnap = await getDocs(q);
            if (!memberSnap.empty) {
              setClubId(clubDoc.id);
              break;
            }
          }
        }
      }
    };

    fetchRoleAndClubId();
  }, [user]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const baseLinks = [
    { to: "/dashboard", label: "Dashboard", roles: ["admin", "leader", "member", "visitor"] },
    { to: "/AdminClub", label: "Clubs", roles: ["admin"] },
    { to: "/AdminEvents", label: "Events", roles: ["admin"] },
    { to: "/LeaderEvents", label: "Events", roles: ["leader"] },
    { to: "/manage", label: "Members", roles: ["leader"] },
    { to: "/events", label: "Events", roles: ["member", "visitor"] },
  ];

  const navLinks = [...baseLinks];

  if (["member", "leader"].includes(role) && clubId) {
    navLinks.push({
      to: `/clubs/${clubId}/chat`,
      label: "Chat",
      roles: ["member", "leader"],
    });
  }

  const getRoleIcon = () => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case "leader":
        return <Shield className="w-4 h-4 text-purple-400" />;
      case "member":
        return <User className="w-4 h-4 text-blue-400" />;
      default:
        return <Globe className="w-4 h-4 text-green-400" />;
    }
  };

  const renderLinks = () =>
    navLinks.map((link, index) => {
      if (!link.roles.includes(role)) return null;

      const isActive = location.pathname === link.to;
      return (
        <motion.div
          key={link.to}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          <Link
            to={link.to}
            className={`relative px-4 py-2 ${
              isActive ? "text-white" : "text-gray-300 hover:text-white"
            } transition-all duration-300 ease-in-out font-medium tracking-wide`}
            onClick={() => setIsMenuOpen(false)}
          >
            {link.label}
            {isActive ? (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"></span>
            ) : (
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300 ease-out"></span>
            )}
          </Link>
        </motion.div>
      );
    });

  return (
    <>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <nav className="top-0 left-0 w-full backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50 text-white px-6 py-3 flex justify-between items-center shadow-2xl z-50">
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.8 }} className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">CC</span>
            </div>
          </motion.div>
          <div className="hidden sm:block">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Club Connect
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {renderLinks()}
          {user && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center space-x-4 ml-4">
              <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                {getRoleIcon()}
                <span className="text-sm font-medium">{user.displayName || user.email?.split("@")[0]}</span>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/profile"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20"
                >
                  <FaUserCircle className="text-xl" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>

        <div className="md:hidden flex items-center space-x-4">
          {user && (
            <Link to="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <FaUserCircle className="text-xl" />
            </Link>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMenu}
            className="relative p-2 text-3xl focus:outline-none text-gray-300 hover:text-white"
          >
            <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
              {isMenuOpen ? <HiX /> : <HiMenu />}
            </motion.div>
          </motion.button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, opacity: { duration: 0.2 } }}
              className="fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-l border-slate-800/50 flex flex-col py-20 px-6 md:hidden shadow-2xl z-50"
            >
              <div className="mb-8 text-center">
                <div className="flex items-center justify-center space-x-2">
                  {user && getRoleIcon()}
                  <h3 className="text-lg font-semibold text-gray-300">{user?.displayName || user?.email?.split("@")[0]}</h3>
                </div>
                <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mt-2"></div>
              </div>

              <div className="flex flex-col space-y-2">
                {navLinks.map((link, index) => {
                  if (!link.roles.includes(role)) return null;
                  const isActive = location.pathname === link.to;
                  return (
                    <motion.div key={link.to} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                      <Link
                        to={link.to}
                        className={`block py-3 px-4 ${
                          isActive ? "bg-slate-800 text-white" : "text-gray-300 hover:text-white hover:bg-slate-800/50"
                        } rounded-lg transition-all duration-300 font-medium`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
