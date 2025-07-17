import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Shield,
  ChevronRight
} from "lucide-react";

export default function LeaderPanel() {
  const { user } = useAuth();
  const [clubName, setClubName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClub = async () => {
      if (user) {
        try {
          const q = query(collection(db, "clubs"), where("leaderId", "==", user.uid));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const clubDoc = snap.docs[0];
            setClubName(clubDoc.data().name);
          }
        } catch (error) {
          console.error("Error fetching club data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchClub();
  }, [user]);

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/2"></div>
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 space-y-6"
    >
      <div className="flex items-center gap-3">
        <motion.div 
          whileHover={{ rotate: 15 }}
          className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg"
        >
          <Shield className="w-6 h-6 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Leader Dashboard</h2>
      </div>

      {clubName ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-700/30 p-4 rounded-lg border border-slate-700/50"
        >
          <p className="text-lg text-white">
            You are managing: <span className="font-semibold text-green-400">{clubName}</span>
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Use the <span className="font-medium text-yellow-300">"Members"</span> tab to manage join requests and members.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30"
        >
          <p className="text-yellow-400">No club assigned to you yet.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Manage Members Card - Links to LeaderMember.tsx */}
        <motion.div
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCardClick("/manage")}
          className="bg-slate-700/30 p-4 rounded-lg hover:bg-slate-700/50 transition-all duration-300 cursor-pointer group border border-slate-700/50 hover:border-blue-400/30 shadow-md hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="p-2 bg-blue-500/20 rounded-lg border border-blue-400/30"
            >
              <Users className="w-5 h-5 text-blue-400" />
            </motion.div>
            <h3 className="font-medium text-white">Manage Members</h3>
            <motion.div
              animate={{ x: 0 }}
              whileHover={{ x: 3 }}
              className="ml-auto"
            >
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-300 transition-colors" />
            </motion.div>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Approve requests and manage current members
          </p>
        </motion.div>

        {/* Create Events Card - Links to LeaderEventsPanel.tsx */}
        <motion.div
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCardClick("/LeaderEvents")}
          className="bg-slate-700/30 p-4 rounded-lg hover:bg-slate-700/50 transition-all duration-300 cursor-pointer group border border-slate-700/50 hover:border-purple-400/30 shadow-md hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="p-2 bg-purple-500/20 rounded-lg border border-purple-400/30"
            >
              <Calendar className="w-5 h-5 text-purple-400" />
            </motion.div>
            <h3 className="font-medium text-white">Create Events</h3>
            <motion.div
              animate={{ x: 0 }}
              whileHover={{ x: 3 }}
              className="ml-auto"
            >
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-300 transition-colors" />
            </motion.div>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Schedule and organize club activities
          </p>
        </motion.div>

        {/* Announcements Card */}
        <motion.div
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="bg-slate-700/30 p-4 rounded-lg hover:bg-slate-700/50 transition-all duration-300 cursor-pointer group border border-slate-700/50 hover:border-green-400/30 shadow-md hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="p-2 bg-green-500/20 rounded-lg border border-green-400/30"
            >
              <MessageSquare className="w-5 h-5 text-green-400" />
            </motion.div>
            <h3 className="font-medium text-white">Announcements</h3>
            <motion.div
              animate={{ x: 0 }}
              whileHover={{ x: 3 }}
              className="ml-auto"
            >
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-green-300 transition-colors" />
            </motion.div>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Post updates for your club members
          </p>
        </motion.div>

        {/* Club Analytics Card */}
        <motion.div
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="bg-slate-700/30 p-4 rounded-lg hover:bg-slate-700/50 transition-all duration-300 cursor-pointer group border border-slate-700/50 hover:border-orange-400/30 shadow-md hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="p-2 bg-orange-500/20 rounded-lg border border-orange-400/30"
            >
              <BarChart3 className="w-5 h-5 text-orange-400" />
            </motion.div>
            <h3 className="font-medium text-white">Club Analytics</h3>
            <motion.div
              animate={{ x: 0 }}
              whileHover={{ x: 3 }}
              className="ml-auto"
            >
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-300 transition-colors" />
            </motion.div>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            View engagement and participation metrics
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}