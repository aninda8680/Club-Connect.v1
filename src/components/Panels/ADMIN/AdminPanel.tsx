import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Navbar";
import Footer from "../../Footer";
import { 
  Users, 
  Calendar, 
  Settings, 
  Shield, 
  BarChart2,
  AlertCircle,
  UserCheck,
  BookOpen,
  ChevronRight
} from "lucide-react";

export default function AdminPanel() {
  const navigate = useNavigate();

  const adminCards = [
    {
      title: "Club Management",
      description: "Create, edit, and oversee all clubs",
      icon: <Shield className="w-8 h-8 text-amber-500" />,
      action: () => navigate("/adminclub"),
      color: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30"
    },
    {
      title: "Event Management",
      description: "Approve and monitor all events",
      icon: <Calendar className="w-8 h-8 text-blue-500" />,
      action: () => navigate("/adminevent"),
      color: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30"
    },
    {
      title: "User Management",
      description: "Manage user roles and permissions",
      icon: <UserCheck className="w-8 h-8 text-emerald-500" />,
      action: () => navigate("/adminusers"),
      color: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30"
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: <Settings className="w-8 h-8 text-purple-500" />,
      action: () => navigate("/adminsettings"),
      color: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30"
    },
    {
      title: "Reports & Analytics",
      description: "View platform usage statistics",
      icon: <BarChart2 className="w-8 h-8 text-rose-500" />,
      action: () => navigate("/adminanalytics"),
      color: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30"
    },
    {
      title: "Content Moderation",
      description: "Review reported content",
      icon: <AlertCircle className="w-8 h-8 text-orange-500" />,
      action: () => navigate("/adminmoderation"),
      color: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30"
    }
  ];

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col">
      <Navbar />

      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 pt-24 pb-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Administrator</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Manage all aspects of the platform with full administrative privileges
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
          >
            {[
              { label: "Active Clubs", value: "24", icon: <Shield className="w-5 h-5" />, change: "+3 this week" },
              { label: "Pending Events", value: "12", icon: <Calendar className="w-5 h-5" />, change: "5 need review" },
              { label: "New Users", value: "48", icon: <Users className="w-5 h-5" />, change: "+12 today" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Admin Cards */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {adminCards.map((card, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={card.action}
                className={`${card.color} border rounded-xl p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm`}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-gray-900/50">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
                    <p className="text-sm text-gray-400">{card.description}</p>
                  </div>
                </div>
                <motion.div 
                  className="mt-4 flex justify-end"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-amber-400" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {[
                { action: "New club registration", time: "10 min ago", user: "Tech Society" },
                { action: "Event approval needed", time: "25 min ago", user: "Music Club" },
                { action: "User role changed", time: "1 hour ago", user: "Alex Johnson" },
                { action: "System update applied", time: "2 hours ago", user: "System" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-gray-400">{item.user}</p>
                  </div>
                  <p className="text-sm text-gray-500">{item.time}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
}