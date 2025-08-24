import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Shield, User, Globe } from "lucide-react";

export default function Navbar() {
  const { user, loading } = useAuth();  const role = (user as any)?.role;

  const clubId = (user as any)?.clubId;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const baseLinks = [
            { to: "/dashboard", label: "Dashboard", roles: ["admin", "coordinator", "member", "visitor"] },
    { to: "/AdminClub", label: "Clubs", roles: ["admin"] },
    { to: "/AdminEvents", label: "Events", roles: ["admin"] },
            { to: "/CoordinatorEvents", label: "Events", roles: ["coordinator"] },
        { to: "/coordinator-member", label: "Members", roles: ["coordinator"] },
    { to: "/events", label: "Events", roles: ["member", "visitor"] },
  ];

  const navLinks = [...baseLinks];

      // add Chat for members/coordinators of a club
    if (["member", "coordinator"].includes(role) && clubId) {
    navLinks.push({
      to: `/clubs/${clubId}/chat`,
      label: "Chat",
              roles: ["member", "coordinator"],
    });
  }

  const getRoleIcon = () => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case "coordinator":
        return <Shield className="w-4 h-4 text-purple-400" />;
      case "member":
        return <User className="w-4 h-4 text-blue-400" />;
      default:
        return <Globe className="w-4 h-4 text-green-400" />;
    }
  };

  // while loading auth → render nothing
  if (loading) return null;

  return (
    <>
      {/* mobile overlay */}
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
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
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

        {/* Desktop links */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link, index) => {
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
          })}
          {user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-4 ml-4"
            >
              <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                {getRoleIcon()}
                <span className="text-sm font-medium">
                  {user.displayName || user.email?.split("@")[0]}
                </span>
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

        {/* Mobile right menu */}
        <div className="md:hidden flex items-center space-x-4">
          {user && (
            <Link
              to="/profile"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white"
            >
              <FaUserCircle className="text-xl" />
            </Link>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMenu}
            className="relative p-2 text-3xl focus:outline-none text-gray-300 hover:text-white"
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMenuOpen ? <HiX /> : <HiMenu />}
            </motion.div>
          </motion.button>
        </div>
      </nav>
    </>
  );
}
