import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  setDoc,
  Timestamp,
  onSnapshot
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  User,
  Users,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  Calendar,
  Shield,
  Loader2,
  Search,
  TrendingUp,
  FileText,
  CheckCircle,
  Download,
  Filter,
  Send
} from "lucide-react";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function LeaderMember() {
  const { user } = useAuth();
  const [clubId, setClubId] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    club: true,
    requests: true,
    members: true
  });
  const [expandedSection, setExpandedSection] = useState<"requests" | "members">("requests");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch the leader's club ID
  useEffect(() => {
    const fetchClub = async () => {
      if (user) {
        try {
          const q = query(collection(db, "clubs"), where("leaderId", "==", user.uid));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const clubDoc = snap.docs[0];
            setClubId(clubDoc.id);
          }
        } catch (err) {
          console.error("Error fetching club:", err);
          toast.error("Failed to load club data");
        } finally {
          setLoading(prev => ({ ...prev, club: false }));
        }
      }
    };
    fetchClub();
  }, [user]);

  // Real-time join requests listener
  useEffect(() => {
    if (!clubId) return;
    
    const unsubscribe = onSnapshot(
      collection(db, `clubs/${clubId}/joinRequests`),
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          requestedAt: doc.data().requestedAt?.toDate()
        }));
        setJoinRequests(data);
        setLoading(prev => ({ ...prev, requests: false }));
      },
      (err) => {
        console.error("Error listening to requests:", err);
        toast.error("Failed to load join requests");
      }
    );

    return () => unsubscribe();
  }, [clubId]);

  // Real-time members listener
  useEffect(() => {
    if (!clubId) return;
    
    const unsubscribe = onSnapshot(
      collection(db, `clubs/${clubId}/members`),
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          joinedAt: doc.data().joinedAt?.toDate()
        }));
        setMembers(data);
        setLoading(prev => ({ ...prev, members: false }));
      },
      (err) => {
        console.error("Error listening to members:", err);
        toast.error("Failed to load members");
      }
    );

    return () => unsubscribe();
  }, [clubId]);

  // Accept a user
  const handleAccept = async (userId: string, name: string, email: string) => {
    try {
      await setDoc(doc(db, "users", userId), { role: "member" }, { merge: true });
      await setDoc(doc(db, `clubs/${clubId}/members/${userId}`), {
        name,
        email,
        joinedAt: Timestamp.now(),
      });
      await deleteDoc(doc(db, `clubs/${clubId}/joinRequests/${userId}`));
      toast.success("✅ User accepted successfully");
    } catch (err) {
      console.error("Failed to accept user:", err);
      toast.error("❌ Failed to accept user");
    }
  };

  // Reject a user
  const handleReject = async (userId: string) => {
    try {
      await deleteDoc(doc(db, `clubs/${clubId}/joinRequests/${userId}`));
      toast.success("❌ User rejected");
    } catch (err) {
      console.error("Failed to reject user:", err);
      toast.error("❌ Failed to reject user");
    }
  };

  // Remove a member
  const handleRemoveMember = async (userId: string) => {
    try {
      await deleteDoc(doc(db, `clubs/${clubId}/members/${userId}`));
      await setDoc(doc(db, `users/${userId}`), { role: "visitor" }, { merge: true });
      toast.success(" Member removed");
    } catch (err) {
      console.error("Failed to remove member:", err);
      toast.error("❌ Failed to remove member");
    }
  };

  // Bulk actions
  const handleAcceptAll = async () => {
    try {
      const promises = joinRequests.map(req => 
        handleAccept(req.id, req.name || req.email || req.id, req.email || "")
      );
      await Promise.all(promises);
      toast.success(`✅ Approved ${joinRequests.length} requests`);
    } catch (err) {
      toast.error("❌ Failed to approve all");
    }
  };

  const handleRejectAll = async () => {
    try {
      const promises = joinRequests.map(req => handleReject(req.id));
      await Promise.all(promises);
      toast.success(`❌ Rejected ${joinRequests.length} requests`);
    } catch (err) {
      toast.error("❌ Failed to reject all");
    }
  };

  // Filter members based on search and filter
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "new") {
      const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
      return matchesSearch && member.joinedAt > oneWeekAgo;
    }
    if (activeFilter === "inactive") {
      const oneMonthAgo = new Date(Date.now() - 30 * 86400000);
      return matchesSearch && member.joinedAt < oneMonthAgo;
    }
    return matchesSearch;
  });

  // Get recent members for timeline
  const recentMembers = [...members]
    .sort((a,b) => b.joinedAt - a.joinedAt)
    .slice(0, 3);

  const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();

  // 🟢 Active Members Sheet
  const memberSheet = workbook.addWorksheet('Active Members');
  memberSheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Join Date', key: 'joinedAt', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
  ];

  members.forEach(member => {
    memberSheet.addRow({
      name: member.name || "N/A",
      email: member.email || "N/A",
      joinedAt: member.joinedAt?.toLocaleDateString() || "N/A",
      status: "Active",
    });
  });

  // 🟡 Pending Requests Sheet
  const requestSheet = workbook.addWorksheet('Pending Requests');
  requestSheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Join Date', key: 'requestedAt', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
  ];

  joinRequests.forEach(request => {
    requestSheet.addRow({
      name: request.name || request.email || "N/A",
      email: request.email || "N/A",
      requestedAt: request.requestedAt?.toLocaleDateString() || "N/A",
      status: "Pending",
    });
  });

  // 📝 Create Excel File
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const filename = `club_members_${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(blob, filename);

  // ✅ Toast Success
  toast.success(
    <div className="flex items-center gap-2">
      <FileText className="w-5 h-5 text-green-400" />
      <span>Exported {members.length} members and {joinRequests.length} requests</span>
    </div>,
    { duration: 3000 }
  );
};

  return (
    <div className="bg-black py-15">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-900/70 to-purple-900/70 rounded-lg border border-blue-700/50">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              <span className="text-green-400">$</span> Member Management
            </h1>
            <p className="text-gray-400 text-sm">
              {clubId ? `Club ID: ${clubId}` : "Loading club data..."}
            </p>
          </div>
        </div>

        {/* Status Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800/50">
            <p className="text-xs text-blue-400">New Requests</p>
            <p className="text-xl font-mono">{joinRequests.length}</p>
          </div>
          <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-800/50">
            <p className="text-xs text-purple-400">Active Members</p>
            <p className="text-xl font-mono">{members.length}</p>
          </div>
          <div className="bg-green-900/20 p-3 rounded-lg border border-green-800/50">
            <p className="text-xs text-green-400">Recent Joins</p>
            <p className="text-xl font-mono">
              {members.filter(m => m.joinedAt > new Date(Date.now() - 7 * 86400000)).length}
            </p>
          </div>
          <div className="bg-amber-900/20 p-3 rounded-lg border border-amber-800/50">
            <p className="text-xs text-amber-400">Avg. Response</p>
            <p className="text-xl font-mono">12h</p>
          </div>
        </div>

        {/* Join Requests Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden"
        >
          <button
            onClick={() => setExpandedSection(expandedSection === "requests" ? "members" : "requests")}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h2 className="font-semibold text-lg">
                Join Requests <span className="text-sm text-amber-400 ml-2">({joinRequests.length} pending)</span>
              </h2>
            </div>
            {expandedSection === "requests" ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSection === "requests" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {loading.requests ? (
                  <div className="p-6 flex justify-center">
                    <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                  </div>
                ) : joinRequests.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p>No pending join requests</p>
                    <p className="text-sm text-gray-600 mt-1">All clear!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800/50">
                    {joinRequests.map((req) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 hover:bg-gray-800/30 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                              <User className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium">{req.name || req.email || req.id}</p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                                {req.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {req.email}
                                  </span>
                                )}
                                {req.requestedAt && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> 
                                    {req.requestedAt.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 sm:ml-auto">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAccept(req.id, req.name || req.email || req.id, req.email || "")}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-900/50 hover:bg-emerald-800/50 text-emerald-400 rounded-lg border border-emerald-800/50 text-sm"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleReject(req.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-rose-900/50 hover:bg-rose-800/50 text-rose-400 rounded-lg border border-rose-800/50 text-sm"
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Members Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden"
        >
          <button
            onClick={() => setExpandedSection(expandedSection === "members" ? "requests" : "members")}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="font-semibold text-lg">
                Club Members <span className="text-sm text-purple-400 ml-2">({members.length} total)</span>
              </h2>
            </div>
            {expandedSection === "members" ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSection === "members" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {/* Member Filters */}
                <div className="flex flex-wrap gap-2 p-4 border-b border-gray-800">
                  <button 
                    onClick={() => setActiveFilter("all")}
                    className={`px-3 py-1 text-xs rounded-full border ${
                      activeFilter === "all" 
                        ? "bg-purple-900/50 border-purple-700/50 text-purple-400"
                        : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                    }`}
                  >
                    All Members
                  </button>
                  <button 
                    onClick={() => setActiveFilter("new")}
                    className={`px-3 py-1 text-xs rounded-full border ${
                      activeFilter === "new" 
                        ? "bg-blue-900/50 border-blue-700/50 text-blue-400"
                        : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                    }`}
                  >
                    New This Week
                  </button>
                  <button 
                    onClick={() => setActiveFilter("inactive")}
                    className={`px-3 py-1 text-xs rounded-full border ${
                      activeFilter === "inactive" 
                        ? "bg-amber-900/50 border-amber-700/50 text-amber-400"
                        : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                    }`}
                  >
                    Inactive
                  </button>
                  <div className="relative ml-auto">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="$ search members..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1 text-sm bg-gray-900/50 border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                {loading.members ? (
                  <div className="p-6 flex justify-center">
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p>No members found</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {searchTerm ? "Try a different search term" : "Approved members will appear here"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800/50">
                    {filteredMembers.map((member) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 hover:bg-gray-800/30 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                              <User className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{member.name || member.email || member.id}</p>
                                <div className="relative group">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-800/50">
                                    Member
                                  </span>
                                  <div className="absolute z-10 hidden group-hover:block w-48 p-2 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                                    <p className="text-xs text-gray-300">Permissions:</p>
                                    <ul className="text-xs text-gray-400 mt-1 space-y-1">
                                      <li className="flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                                        Event Access
                                      </li>
                                      <li className="flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                                        Club Chat
                                      </li>
                                      <li className="flex items-center gap-1">
                                        <XCircle className="w-3 h-3 text-rose-400" />
                                        Admin Controls
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                                {member.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {member.email}
                                  </span>
                                )}
                                {member.joinedAt && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> 
                                    Joined: {member.joinedAt.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRemoveMember(member.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-rose-900/50 hover:bg-rose-800/50 text-rose-400 rounded-lg border border-rose-800/50 text-sm sm:ml-auto"
                          >
                            <Trash2 className="w-4 h-4" /> Remove
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      {/* Bulk Actions Terminal */}
<div className="mt-6 rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
  {/* Header */}
  <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2 bg-gray-900">
    <Terminal className="w-4 h-4 text-green-400 flex-shrink-0" />
    <span className="text-sm font-mono text-green-400">admin-console</span>
    <span className="text-xs text-gray-500 truncate">~/members</span>
  </div>

  {/* Command Section */}
  <div className="p-4 font-mono text-sm">
    <div className="flex items-center gap-2 text-gray-500 mb-3">
      <span className="text-green-400">$</span>
      <span>Available commands:</span>
    </div>

    <div className="space-y-2 pl-5">
      {/* Approve All */}
      <motion.button
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAcceptAll}
        disabled={joinRequests.length === 0}
        className={`flex items-center gap-2 w-full text-left group ${joinRequests.length === 0 ? 'opacity-50' : ''}`}
      >
        <span className="text-blue-400 group-hover:text-blue-300">→</span>
        <span className="text-gray-300 group-hover:text-white">
          approve --all
          {joinRequests.length > 0 && (
            <span className="ml-2 text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">
              {joinRequests.length} pending
            </span>
          )}
        </span>
      </motion.button>

      {/* Reject All */}
      <motion.button
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleRejectAll}
        disabled={joinRequests.length === 0}
        className={`flex items-center gap-2 w-full text-left group ${joinRequests.length === 0 ? 'opacity-50' : ''}`}
      >
        <span className="text-rose-400 group-hover:text-rose-300">→</span>
        <span className="text-gray-300 group-hover:text-white">
          reject --all
        </span>
      </motion.button>

      {/* Export to Excel */}
      <motion.button
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.98 }}
        onClick={exportToExcel}
        className="flex items-center gap-2 w-full text-left group"
      >
        <span className="text-emerald-400 group-hover:text-emerald-300">→</span>
        <span className="text-gray-300 group-hover:text-white">
          export --format=xlsx
          <span className="ml-2 text-xs bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded">
            {members.length + joinRequests.length} records
          </span>
        </span>
      </motion.button>

      {/* Filter (Static) */}
      <div className="flex items-center gap-2 text-gray-500 pt-1">
        <span className="text-gray-600">→</span>
        <span className="text-gray-500">
          filter --active --sort=recent
        </span>
      </div>
    </div>
  </div>
</div>


        {/* Activity Timeline and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Member Activity Timeline */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {recentMembers.length > 0 ? (
                recentMembers.map((member, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      {index < recentMembers.length - 1 && (
                        <div className="w-px h-8 bg-gray-700 my-1"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="text-purple-400">{member.name || member.email}</span> joined
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.joinedAt.toLocaleDateString()} at {member.joinedAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No recent member activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Analytics Preview Card */}
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-800/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Membership Growth
              </h3>
              <span className="text-xs bg-purple-900/50 px-2 py-1 rounded-full">Last 30 Days</span>
            </div>
            <div className="h-24 bg-gray-900/30 rounded-lg border border-gray-800/50 flex items-end p-2">
              {[3, 5, 7, 4, 8, 6, 9].map((height, i) => (
                <div 
                  key={i} 
                  className="flex-1 mx-0.5 bg-gradient-to-t from-purple-500/70 to-blue-500/70 rounded-t-sm"
                  style={{ height: `${height * 8}px` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>+12% from last month</span>
              <button className="text-blue-400 hover:text-blue-300">
                View Full Report →
              </button>
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 pt-4 border-t border-gray-800 text-xs text-gray-500 flex flex-wrap gap-4"
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>System: Member Management v1.0.0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span>Requests: {joinRequests.length} pending</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span>Members: {members.length} active</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}