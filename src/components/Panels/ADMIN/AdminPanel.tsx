import { useEffect, useState } from "react";
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
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminPanel() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [clubName, setClubName] = useState("");
  const [selectedLeader, setSelectedLeader] = useState("");
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedLeaderName, setSelectedLeaderName] = useState<string | null>(null);
  const [showClubList, setShowClubList] = useState(true);
  const [deletingClub, setDeletingClub] = useState<string | null>(null);

  // Fetch all leaders
  useEffect(() => {
    const fetchLeaders = async () => {
      setIsLoading(true);
      const q = query(collection(db, "users"), where("role", "==", "leader"));
      const querySnapshot = await getDocs(q);
      const leadersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeaders(leadersData);
      setIsLoading(false);
    };
    fetchLeaders();
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

  // Update selectedLeaderName when selectedLeader changes
  useEffect(() => {
    if (!selectedLeader) {
      setSelectedLeaderName(null);
      return;
    }
    const leader = leaders.find((l) => l.id === selectedLeader);
    setSelectedLeaderName(
      leader?.displayName || leader?.name || leader?.email || null
    );
  }, [selectedLeader, leaders]);

  const handleCreateClub = async () => {
    if (!clubName || !selectedLeader) return alert("Fill all fields");
    setIsCreating(true);
    try {
      await addDoc(collection(db, "clubs"), {
        name: clubName,
        description: "",
        createdAt: Timestamp.now(),
        leaderId: selectedLeader,
      });
      setClubName("");
      setSelectedLeader("");
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

  // Helper to get leader's name by id
  const getLeaderName = (leaderId: string) => {
    const leader = leaders.find((l) => l.id === leaderId);
    return leader?.displayName || leader?.name || leader?.email || "Unknown";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          notification.type === "success"
            ? "bg-emerald-600 text-white"
            : "bg-red-600 text-white"
        }`}>
          {notification.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Club Management Dashboard
          </h1>
          <p className="text-slate-400 text-lg">Create, manage, and organize your clubs with ease</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Clubs</p>
                <p className="text-2xl font-bold text-white">{clubs.length}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Available Leaders</p>
                <p className="text-2xl font-bold text-white">{leaders.length}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Users className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Leaders</p>
                <p className="text-2xl font-bold text-white">{new Set(clubs.map(c => c.leaderId)).size}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Crown className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Create Club Panel */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700/50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Plus className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create New Club</h2>
                  <p className="text-slate-400">Set up a new club and assign a leader</p>
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Club Leader
                </label>
                <div className="relative">
                  <select
                    value={selectedLeader}
                    onChange={(e) => setSelectedLeader(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">
                      {isLoading ? "Loading leaders..." : "-- Select Leader --"}
                    </option>
                    {leaders.map((leader) => (
                      <option key={leader.id} value={leader.id} className="bg-slate-700">
                        {leader.displayName || leader.name || leader.email}
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

              {selectedLeaderName && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {selectedLeaderName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Selected Leader</p>
                      <p className="text-blue-400 text-sm">{selectedLeaderName}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={handleCreateClub}
                  disabled={isCreating || !clubName.trim() || !selectedLeader}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                >
                  {isCreating ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Club...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5" />
                      Create Club
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Club List Panel */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-b border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">All Clubs</h2>
                    <p className="text-slate-400">Manage existing clubs</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowClubList(!showClubList)}
                  className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all duration-200"
                >
                  {showClubList ? (
                    <EyeOff className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {showClubList && (
              <div className="p-6 max-h-96 overflow-y-auto">
                {clubs.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg font-medium">No clubs created yet</p>
                    <p className="text-slate-500 text-sm">Create your first club to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clubs.map((club) => (
                      <div
                        key={club.id}
                        className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 hover:bg-slate-700/70 transition-all duration-200"
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
                                <span>Leader: {getLeaderName(club.leaderId)}</span>
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
                          <button
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
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}