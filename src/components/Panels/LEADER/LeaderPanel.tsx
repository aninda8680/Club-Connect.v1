import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Shield,
  ChevronRight,
  PlusCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Bell,
  Search,
  Clock,
  Sparkles
} from "lucide-react";

export default function LeaderPanel() {
  const { user } = useAuth();
  const [clubName, setClubName] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubData = async () => {
      if (user) {
        try {
          // Fetch club info
          const clubQuery = query(collection(db, "clubs"), where("leaderId", "==", user.uid));
          const clubSnap = await getDocs(clubQuery);
          
          if (!clubSnap.empty) {
            const clubDoc = clubSnap.docs[0];
            setClubName(clubDoc.data().name);
            
            // Fetch pending requests
            const requestsQuery = query(
              collection(db, "clubs", clubDoc.id, "joinRequests"),
              where("status", "==", "pending")
            );
            const requestsSnap = await getDocs(requestsQuery);
            setPendingRequests(requestsSnap.size);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchClubData();
  }, [user]);

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 font-mono">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-3/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800/50 rounded-lg border border-gray-700/50"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Management cards data
  const managementCards = [
    {
      title: "manage_members",
      description: "Handle join requests and current members",
      icon: Users,
      command: "$ admin members --manage",
      color: "blue",
      path: "/manage",
      stats: pendingRequests > 0 ? `${pendingRequests} pending` : "All clear"
    },
    {
      title: "schedule_events",
      description: "Create and organize club activities",
      icon: Calendar,
      command: "$ admin events --create",
      color: "purple",
      path: "/LeaderEvents"
    },
    {
      title: "broadcast",
      description: "Post updates for your members",
      icon: MessageSquare,
      command: "$ admin announce --send",
      color: "green",
      path: "/announcements"
    },
    {
      title: "analytics",
      description: "View engagement metrics",
      icon: BarChart3,
      command: "$ admin stats --view",
      color: "orange",
      path: "/analytics"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "from-blue-900/50 to-blue-800/50 border-blue-700/50 hover:border-blue-500/70 text-blue-400",
      purple: "from-purple-900/50 to-purple-800/50 border-purple-700/50 hover:border-purple-500/70 text-purple-400",
      green: "from-green-900/50 to-green-800/50 border-green-700/50 hover:border-green-500/70 text-green-400",
      orange: "from-orange-900/50 to-orange-800/50 border-orange-700/50 hover:border-orange-500/70 text-orange-400"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className = "bg-black py-15">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="p-3 bg-gradient-to-br from-blue-900/70 to-purple-900/70 rounded-xl border border-blue-700/50"
          >
            <Terminal className="w-6 h-6 text-blue-400" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              <span className="text-green-400">$</span> Leader Console
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Manage your club ecosystem
            </p>
          </div>
        </div>

        {/* Status Bar */}
        {clubName ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 mb-8"
          >
            <p className="text-gray-300 font-mono">
              <span className="text-green-400">$ status</span> Current club: 
              <span className="text-cyan-400 ml-1">"{clubName}"</span>
            </p>
            <p className="mt-2 text-sm text-gray-400">
              <span className="text-gray-500">//</span> Use the management cards below to administer your club
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-800/50 mb-8"
          >
            <p className="text-yellow-400 font-mono">
              <span className="text-red-400">⚠ Error:</span> No club assigned to current session
            </p>
          </motion.div>
        )}

        {/* Management Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 mb-8">
          {managementCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(card.path)}
              className={`bg-gradient-to-br ${getColorClasses(card.color)} rounded-xl border p-5 cursor-pointer transition-all duration-300 group`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-900/30 rounded-lg border border-gray-800/50">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white group-hover:text-white/90">{card.title}</h3>
                    <p className="text-xs text-gray-300 mt-1">{card.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs font-mono bg-gray-900/30 px-2 py-1 rounded">
                  {card.command}
                </div>
                {card.stats && (
                  <span className="text-xs bg-gray-900/50 px-2 py-1 rounded border border-gray-800/50">
                    {card.stats}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        

            

        {/* Recent Activity Placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900/50 rounded-xl border border-gray-800 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          
          <div className="text-center py-8">
            <div className="inline-block p-4 bg-gray-800/30 rounded-full border border-gray-700/50 mb-3">
              <Bell className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-400">Activity feed coming soon</p>
            <p className="text-gray-600 text-sm mt-1">Track all club activities in real-time</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}