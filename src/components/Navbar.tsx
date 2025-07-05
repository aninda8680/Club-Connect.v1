import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FaUserCircle } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user } = useAuth();
  const [role, setRole] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setRole(snap.data().role);
      }
    };
    fetchRole();
  }, [user]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", roles: ["admin", "leader", "member", "visitor"] },
    { to: "/AdminClub", label: "Clubs", roles: ["admin"] },
    { to: "/AdminEvents", label: "Admin Events", roles: ["admin"] },
    { to: "/LeaderEvents", label: "Events", roles: ["leader"] },
    { to: "/manage", label: "Members", roles: ["leader"] },
    { to: "/events", label: "Events", roles: ["member", "visitor"] },
  ];

  const renderLinks = () => (
    <>
      {navLinks.map((link, index) => {
        if (link.roles.includes(role)) {
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
                className="relative px-4 py-2 text-gray-300 hover:text-white transition-all duration-300 ease-in-out font-medium tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
            </motion.div>
          );
        }
        return null;
      })}

      {user && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative group"
        >
          <Link
            to="/profile"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/20"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaUserCircle className="text-xl text-white" />
          </Link>
          
          {/* Simple status indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
        </motion.div>
      )}
    </>
  );

  return (
    <>
      {/* Backdrop blur for mobile menu */}
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

      <nav className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md border-b border-gray-800/50 text-white px-6 py-4 flex justify-between items-center shadow-2xl z-50">
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-3 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <img 
              src="/logo.png" 
              alt="Club Connect Logo" 
              className="h-10 w-10 object-contain drop-shadow-lg" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </motion.div>
          <div className="hidden sm:block">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Club Connect
            </span>
            <div className="text-xs text-gray-400 tracking-widest uppercase">
              Connect • Engage • Grow
            </div>
          </div>
        </Link>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMenu}
            className="relative p-2 text-3xl focus:outline-none text-gray-300 hover:text-white transition-colors duration-200"
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMenuOpen ? <HiX /> : <HiMenu />}
            </motion.div>
          </motion.button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {renderLinks()}
        </div>

        {/* Mobile Slide Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-gray-900 via-black to-gray-900 border-l border-gray-800/50 flex flex-col py-20 px-8 md:hidden shadow-2xl z-50"
            >
              {/* Mobile Menu Header */}
              <div className="mb-8 text-center">
                <div className="text-lg font-semibold text-gray-300 mb-2">Navigation</div>
                <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto"></div>
              </div>

              {/* Mobile Menu Links */}
              <div className="flex flex-col space-y-4">
                {navLinks.map((link, index) => {
                  if (link.roles.includes(role)) {
                    return (
                      <motion.div
                        key={link.to}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={link.to}
                          className="block py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300 font-medium tracking-wide border border-transparent hover:border-gray-700/50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  }
                  return null;
                })}

                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="pt-4 border-t border-gray-800/50"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300 font-medium tracking-wide border border-transparent hover:border-gray-700/50 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300">
                          <FaUserCircle className="text-lg text-white" />
                        </div>
                        {/* Status dot */}
                        
                      </div>
                      
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}