import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  Building2,
  Crown,
  Calendar,
  Check,
  AlertCircle,
  Plus,
  Users,
  Loader2,
  Trash2,
  Terminal,
  Code,
  Database,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useAnimation, useInView } from "framer-motion";

const ScrollAnimationWrapper = ({ children }: { children: React.ReactNode }) => {
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 }
      }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default function AdminClub() {
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [clubName, setClubName] = useState("");
  const [selectedCoordinator, setSelectedCoordinator] = useState("");
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedCoordinatorName, setSelectedCoordinatorName] = useState<string | null>(null);
  const [showClubList] = useState(true);
  const [deletingClub, setDeletingClub] = useState<string | null>(null);

  // Fetch all coordinators
  useEffect(() => {
    const fetchCoordinators = async () => {
      setIsLoading(true);
      const q = query(collection(db, "users"), where("role", "==", "coordinator"));
      const querySnapshot = await getDocs(q);
      const coordinatorsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCoordinators(coordinatorsData);
      setIsLoading(false);
    };
    fetchCoordinators();
  }, []);

  // Fetch all clubs
  const fetchClubs = async () => {
    const snap = await getDocs(collection(db, "clubs"));
    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClubs(data);
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  // Update selectedCoordinatorName when selectedCoordinator changes
  useEffect(() => {
    if (!selectedCoordinator) {
      setSelectedCoordinatorName(null);
      return;
    }
    const coordinator = coordinators.find((c) => c.id === selectedCoordinator);
    setSelectedCoordinatorName(
      coordinator?.displayName || coordinator?.name || coordinator?.email || null
    );
  }, [selectedCoordinator, coordinators]);

  const handleCreateClub = async () => {
    if (!clubName || !selectedCoordinator) return alert("Fill all fields");
    setIsCreating(true);
    try {
      await addDoc(collection(db, "clubs"), {
        name: clubName,
        description: "",
        createdAt: Timestamp.now(),
        coordinatorId: selectedCoordinator,
        clubId: `${clubName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      });
      setClubName("");
      setSelectedCoordinator("");
      setNotification({ type: "success", message: "Club created!" });
      fetchClubs();
    } catch (err) {
      console.error("❌ Error creating club:", err);
      setNotification({ type: "error", message: "Failed to create club." });
    } finally {
      setIsCreating(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Helper to get coordinator's name by id
  const getCoordinatorName = (coordinatorId: string) => {
    const coordinator = coordinators.find((c) => c.id === coordinatorId);
    return coordinator?.displayName || coordinator?.name || coordinator?.email || "Unknown";
  };

  // Confirm and delete club
  const confirmDelete = async (clubId: string, clubName: string) => {
    const confirm = window.confirm(`Are you sure you want to delete "${clubName}"?`);
    if (!confirm) return;
    setDeletingClub(clubId);
    try {
      await deleteDoc(doc(db, "clubs", clubId));
      setClubs((prev) => prev.filter((club) => club.id !== clubId));
      setNotification({ type: "success", message: "Club deleted!" });
    } catch (err) {
      console.error("❌ Error deleting club:", err);
      setNotification({ type: "error", message: "Failed to delete club." });
    } finally {
      setDeletingClub(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className = "bg-black">
      
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-emerald-600/90 backdrop-blur-sm border border-emerald-500/30"
                : "bg-red-600/90 backdrop-blur-sm border border-red-500/30"
            }`}
          >
            {notification.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-10 pr-20 pb-15 px-4 sm:px-6 lg:px-50 w-full max-w-none">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <ScrollAnimationWrapper>
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Club Management Console
                </h1>
                <p className="text-slate-400 text-sm md:text-lg">
                  <span className="text-green-400">$</span> Manage your university clubs ecosystem
                </p>
              </motion.div>
            </div>
          </ScrollAnimationWrapper>

          {/* Stats Overview */}
          <ScrollAnimationWrapper>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-blue-900/70 to-blue-800/70 border border-blue-700/50 hover:border-blue-500/70 rounded-xl p-6 backdrop-blur-sm transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total Clubs</p>
                    <p className="text-2xl font-bold text-white font-mono">{clubs.length}</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Terminal className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-purple-900/70 to-purple-800/70 border border-purple-700/50 hover:border-purple-500/70 rounded-xl p-6 backdrop-blur-sm transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Available Coordinators</p>
                    <p className="text-2xl font-bold text-white font-mono">{coordinators.length}</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Code className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-emerald-900/70 to-emerald-800/70 border border-emerald-700/50 hover:border-emerald-500/70 rounded-xl p-6 backdrop-blur-sm transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Active Coordinators</p>
                    <p className="text-2xl font-bold text-white font-mono">{new Set(clubs.map(c => c.coordinatorId)).size}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/20 rounded-lg">
                    <Crown className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </motion.div>
            </div>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Create Club Panel */}
            <ScrollAnimationWrapper>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-b border-slate-800 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Plus className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Create New Club</h2>
                      <p className="text-slate-400">Initialize a new club instance</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
                      Club Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter club name..."
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
                      Club Coordinator
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCoordinator}
                        onChange={(e) => setSelectedCoordinator(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 font-mono"
                      >
                        <option value="">
                          {isLoading ? "Loading coordinators..." : "-- Select Coordinator --"}
                        </option>
                        {coordinators.map((coordinator) => (
                          <option key={coordinator.id} value={coordinator.id} className="bg-slate-800">
                            {coordinator.displayName || coordinator.name || coordinator.email}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                        ) : (
                          <Users className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedCoordinatorName && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {selectedCoordinatorName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Selected Coordinator</p>
                          <p className="text-blue-400 text-sm font-mono">{selectedCoordinatorName}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateClub}
                      disabled={isCreating || !clubName.trim() || !selectedCoordinator}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Creating Club...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span>Create Club</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </ScrollAnimationWrapper>

            {/* Club List Panel */}
            <ScrollAnimationWrapper>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 border-b border-slate-800 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Database className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Club Registry</h2>
                        <p className="text-slate-400">Active club instances</p>
                      </div>
                    </div>
                  </div>
                </div>

                {showClubList && (
                  <div className="p-6 max-h-[32rem] overflow-y-auto">
                    {clubs.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg font-medium">No clubs initialized</p>
                        <p className="text-slate-500 text-sm">$ create new club instance</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        <AnimatePresence>
                          {clubs.map((club) => (
                            <motion.div
                              key={club.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                              className="flex items-center gap-4"
                            >
                              <Link
                                to={`/admin/clubs/${club.id}`}
                                className="flex-1 block bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/70 transition-all duration-200 hover:cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-white" />
                                      </div>
                                      <h3 className="font-semibold text-white text-lg">{club.name}</h3>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex items-center gap-2 text-slate-300">
                                        <Crown className="w-4 h-4 text-purple-400" />
                                        <span>Coordinator: {getCoordinatorName(club.coordinatorId)}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar className="w-4 h-4 text-blue-400" />
                                        <span>
                                          Created:{" "}
                                          {club.createdAt?.toDate
                                            ? club.createdAt.toDate().toLocaleDateString()
                                            : "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => confirmDelete(club.id, club.name)}
                                disabled={deletingClub === club.id}
                                className="bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                              >
                                {deletingClub === club.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                                <span className="hidden sm:inline">Delete</span>
                              </motion.button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </main>
    </div>
  );
}