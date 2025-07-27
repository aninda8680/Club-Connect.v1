import { useEffect, useState } from "react";
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Terminal,
  Sparkles,
  Server,
  Bell,
  GitBranch,
  Database,
  Zap,
  ChevronRight,
  Code,
  Users,
  Activity,
  Shield,
  Star,
} from "lucide-react";

type EventProposal = {
  id: string;
  title: string;
  description: string;
  date: any;
  location?: string;
  createdAt?: any;
  submittedBy?: string;
  status: string;
};

const ScrollAnimationWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default function LeaderEventsPanel() {
  const { user } = useAuth();
  const [clubId, setClubId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [proposals, setProposals] = useState<EventProposal[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<EventProposal[]>([]);
  const [loading, setLoading] = useState(true);

  // Define stats for the dashboard cards
  const stats = [
    {
      label: "Pending Proposals",
      value: proposals.length,
      icon: AlertTriangle,
      color: "text-amber-400",
    },
    {
      label: "Approved Events",
      value: approvedEvents.length,
      icon: CheckCircle,
      color: "text-emerald-400",
    },
    {
      label: "Total Events",
      value: proposals.length + approvedEvents.length,
      icon: Calendar,
      color: "text-blue-400",
    },
    {
      label: "Live Events",
      value: approvedEvents.length,
      icon: Database,
      color: "text-cyan-400",
    },
  ];

  useEffect(() => {
    const fetchClub = async () => {
      if (!user) return;
      const q = query(collection(db, "clubs"), where("leaderId", "==", user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const clubDoc = snap.docs[0];
        setClubId(clubDoc.id);
      }
    };
    fetchClub();
  }, [user]);

  const fetchProposals = async () => {
    if (!clubId) return;
    setLoading(true);

    try {
      const proposalSnap = await getDocs(collection(db, `clubs/${clubId}/eventProposals`));
      const proposalsData = proposalSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          date: data.date,
          location: data.location,
          createdAt: data.createdAt,
          submittedBy: data.submittedBy,
          status: data.status || "pending",
        } as EventProposal;
      });
      setProposals(proposalsData);

      const approvedSnap = await getDocs(collection(db, `clubs/${clubId}/events`));
      const approvedData = approvedSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          date: data.date,
          location: data.location,
          createdAt: data.createdAt,
          submittedBy: data.submittedBy,
          status: data.status || "approved",
        } as EventProposal;
      });
      setApprovedEvents(approvedData);
    } catch (error) {
      console.error("Error fetching proposals or approved events:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (clubId) fetchProposals();
  }, [clubId]);

  const handleCreateProposal = async () => {
    if (!title || !date) return alert("Please fill all fields");
    setIsCreating(true);
    try {
      await addDoc(collection(db, `clubs/${clubId}/eventProposals`), {
        title,
        description,
        date: Timestamp.fromDate(new Date(date)),
        location,
        createdAt: Timestamp.now(),
        submittedBy: user?.uid || "",
        status: "pending",
      });
      alert("✅ Event proposal submitted for admin approval!");
      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      fetchProposals();
    } catch (error) {
      console.error("Error creating proposal:", error);
      alert("❌ Failed to submit proposal.");
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-amber-900/30 text-amber-400 border-amber-700/50",
      approved: "bg-emerald-900/30 text-emerald-400 border-emerald-700/50",
      rejected: "bg-rose-900/30 text-rose-400 border-rose-700/50",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-black">
      
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20 pointer-events-none" />
      
      <main className="relative pt-8 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <ScrollAnimationWrapper>
            <div className="mb-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex items-center gap-6">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.05 }}
                    className="relative p-4 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl border border-blue-500/30 backdrop-blur-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl blur-xl" />
                    <Terminal className="relative w-10 h-10 text-blue-400" />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      Event Management
                    </h1>
                    <p className="text-slate-400 text-lg mt-2 flex items-center gap-2">
                      <span className="text-green-400 font-mono">$</span> 
                      <span>Orchestrate your club's digital events</span>
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl blur-xl group-hover:blur-lg transition-all" />
                      <div className="relative p-4 bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl group-hover:border-slate-600/50 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="w-2 h-2 bg-slate-600 rounded-full"
                          />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>

          {/* Enhanced Quick Actions */}
          <ScrollAnimationWrapper>
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl blur-xl" />
              <div className="relative backdrop-blur-sm rounded-2xl p-8 bg-slate-900/70 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Mission Control
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-yellow-400/30 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div whileHover={{ y: -8, scale: 1.02 }} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl blur-xl group-hover:blur-lg transition-all" />
                    <button
                      onClick={() => document.getElementById('proposal-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="relative w-full p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all group text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                          <Plus className="w-6 h-6 text-blue-400" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h4 className="font-bold text-white mb-2">Deploy Event</h4>
                      <p className="text-sm text-slate-400 mb-3">Initialize new event proposal</p>
                      <div className="flex items-center gap-2 text-xs font-mono text-blue-300 bg-blue-900/30 px-3 py-2 rounded-lg">
                        <Code className="w-3 h-3" />
                        event.create()
                      </div>
                    </button>
                  </motion.div>

                  <motion.div whileHover={{ y: -8, scale: 1.02 }} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl blur-xl group-hover:blur-lg transition-all" />
                    <div className="relative w-full p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl border border-emerald-500/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                          <Database className="w-6 h-6 text-emerald-400" />
                        </div>
                        <Activity className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h4 className="font-bold text-white mb-2">Event Registry</h4>
                      <p className="text-sm text-slate-400 mb-3">{approvedEvents.length} events in production</p>
                      <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-900/30 px-3 py-2 rounded-lg">
                        <Shield className="w-3 h-3" />
                        status: active
                      </div>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -8, scale: 1.02 }} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl blur-xl group-hover:blur-lg transition-all" />
                    <div className="relative w-full p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-500/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                          <GitBranch className="w-6 h-6 text-purple-400" />
                        </div>
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <h4 className="font-bold text-white mb-2">Pipeline Status</h4>
                      <p className="text-sm text-slate-400 mb-3">{proposals.length} proposals in review</p>
                      <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-900/30 px-3 py-2 rounded-lg">
                        <Star className="w-3 h-3" />
                        queue: processing
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>

          {/* Enhanced Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
            {/* Pending Proposals */}
            <ScrollAnimationWrapper>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl group-hover:blur-lg transition-all" />
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >

                          <AlertTriangle className="w-6 h-6 text-amber-400" />
                        </motion.div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                          Proposal Queue
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        <span className="text-sm font-mono text-amber-400 bg-amber-900/30 px-3 py-1 rounded-full border border-amber-700/50">
                          {proposals.length} pending
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 max-h-96 overflow-y-auto">
                    {proposals.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <Bell className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg font-semibold">No proposals in queue</p>
                        <p className="text-slate-600 text-sm mt-2">Your event proposals will appear here</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        <AnimatePresence>
                          {proposals.map((proposal, index) => (
                            <motion.div
                              key={proposal.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, x: 8 }}
                              className="relative group/item"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl blur-sm group-hover/item:blur-none transition-all" />
                              <div className="relative p-5 bg-slate-800/70 rounded-xl border border-slate-700/50 group-hover/item:border-slate-600/70 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-bold text-white text-lg leading-tight">
                                    {proposal.title}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(proposal.status)}`}>
                                      {proposal.status}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover/item:text-slate-400 group-hover/item:translate-x-1 transition-all" />
                                  </div>
                                </div>
                                <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                                  {proposal.description}
                                </p>
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 text-slate-500">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-mono">
                                      {proposal.date?.seconds
                                        ? new Date(proposal.date.seconds * 1000).toLocaleString()
                                        : ""}
                                    </span>
                                  </div>
                                  {proposal.location && (
                                    <div className="flex items-center gap-2 text-slate-500">
                                      <MapPin className="w-4 h-4" />
                                      <span>{proposal.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollAnimationWrapper>

            {/* Approved Events */}
            <ScrollAnimationWrapper>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl blur-xl group-hover:blur-lg transition-all" />
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <CheckCircle className="w-6 h-6 text-emerald-400" />
                        </motion.div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                          Production Events
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        {/* <span className="text-sm font-mono text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-700/50">
                          {approvedEvents.length} live
                        </span> */}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 max-h-96 overflow-y-auto">
                    {approvedEvents.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg font-semibold">No events deployed</p>
                        <p className="text-slate-600 text-sm mt-2">Approved events will appear here</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        <AnimatePresence>
                          {approvedEvents.map((event, index) => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, x: -8 }}
                              className="relative group/item"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/30 to-green-800/30 rounded-xl blur-sm group-hover/item:blur-none transition-all" />
                              <div className="relative p-5 bg-slate-800/70 rounded-xl border border-slate-700/50 group-hover/item:border-emerald-600/50 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    <h4 className="font-bold text-white text-lg leading-tight">
                                      {event.title}
                                    </h4>
                                  </div>
                                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    live
                                  </span>
                                </div>
                                <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                                  {event.description}
                                </p>
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 text-slate-500">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-mono">
                                      {event.date?.seconds
                                        ? new Date(event.date.seconds * 1000).toLocaleString()
                                        : ""}
                                    </span>
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center gap-2 text-slate-500">
                                      <MapPin className="w-4 h-4" />
                                      <span>{event.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollAnimationWrapper>
          </div>

          {/* Enhanced Proposal Form */}
          <ScrollAnimationWrapper>
            <div id="proposal-form" className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl blur-xl group-hover:blur-lg transition-all" />
              <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="p-8 border-b border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.5 }}
                      className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl border border-blue-500/30"
                    >
                      <Plus className="w-6 h-6 text-blue-400" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Initialize New Event
                      </h3>
                      <p className="text-slate-400 mt-1">Deploy your event proposal to the review pipeline</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                          <Terminal className="w-4 h-4" />
                          Event Title
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter event name..."
                          className="w-full p-4 rounded-xl bg-slate-800/70 text-white border border-slate-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                          <Clock className="w-4 h-4" />
                          Event DateTime
                        </label>
                        <input
                          type="datetime-local"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full p-4 rounded-xl bg-slate-800/70 text-white border border-slate-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                        <MapPin className="w-4 h-4" />
                        Location (Optional)
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Where will this event take place?"
                        className="w-full p-4 rounded-xl bg-slate-800/70 text-white border border-slate-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                        <Activity className="w-4 h-4" />
                        Event Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your event in detail..."
                        className="w-full p-4 rounded-xl bg-slate-800/70 text-white border border-slate-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none backdrop-blur-sm"
                        rows={4}
                      />
                    </div>
                    
                    <motion.button
                      onClick={handleCreateProposal}
                      disabled={isCreating || !title || !date}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed transition-all duration-300 font-bold text-white flex items-center justify-center gap-3 border border-blue-500/30 hover:border-blue-400/50 shadow-lg hover:shadow-blue-500/25"
                    >
                      {isCreating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </motion.div>
                          <span>Deploying Event...</span>
                        </>
                      ) : (
                        <>
                          <Terminal className="w-5 h-5" />
                          <span>Initialize Event Proposal</span>
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>

          {/* Footer Terminal */}
          <ScrollAnimationWrapper>
            <div className="mt-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 to-slate-700/20 rounded-xl blur-xl" />
              <div className="relative p-6 bg-slate-900/50 backdrop-blur-sm border border-slate-700/30 rounded-xl">
                <div className="flex items-center gap-3 text-sm font-mono text-slate-400">
                  <span className="text-green-400">●</span>
                  <span>System Status: Operational</span>
                  <span className="text-slate-600">|</span>
                  <span>Events Pipeline: Active</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-blue-400">Last Deploy: 2 minutes ago</span>
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </main>
    </div>
  );
}