import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiCalendar,
  FiShield,
  FiPlus,
  FiCheck,
  FiX,
  FiEye,
  FiSettings,
  FiBell,
  FiSearch,
  FiTrendingUp,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';
import {
  Building2,
  Crown,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users as LucideUsers,
  Code,
  Terminal,
  Cpu,
  Database,
  Server
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  where,
  collectionGroup
} from 'firebase/firestore';
import { db } from '../../../firebase';
// import Navbar from '../../Navbar';
// import Footer from '../../Footer';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';

interface DashboardStats {
  totalClubs: number;
  totalLeaders: number;
  totalMembers: number;
  pendingProposals: number;
  approvedEvents: number;
  activeLeaders: number;
}

interface EventProposal {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  timestamp: any;
  [key: string]: any;
}

interface Club {
  id: string;
  leaderId: string;
  name: string;
  [key: string]: any;
}

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

const AdminPanel = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClubs: 0,
    totalLeaders: 0,
    totalMembers: 0,
    pendingProposals: 0,
    approvedEvents: 0,
    activeLeaders: 0
  });

  const [pendingProposals, setPendingProposals] = useState<EventProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Simulate loading delay for animations
      await new Promise(resolve => setTimeout(resolve, 800));

      const clubsSnap = await getDocs(collection(db, 'clubs'));
      const clubs = clubsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Club));

      const leadersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'leader')));
      const membersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'member')));

      const proposalsSnap = await getDocs(collectionGroup(db, 'eventProposals'));
      const pendingProps = proposalsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as EventProposal))
        .filter(prop => prop.status === 'pending');

      const eventsSnap = await getDocs(collectionGroup(db, 'events'));
      const approvedEvs = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const activeLeaderIds = new Set(clubs.map(club => club.leaderId));

      setStats({
        totalClubs: clubs.length,
        totalLeaders: leadersSnap.docs.length,
        totalMembers: membersSnap.docs.length,
        pendingProposals: pendingProps.length,
        approvedEvents: approvedEvs.length,
        activeLeaders: activeLeaderIds.size
      });

      setPendingProposals(pendingProps.slice(0, 5));
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Total Clubs',
      value: stats.totalClubs,
      icon: Terminal,
      change: '+3',
      color: 'blue',
      link: '/AdminClub'
    },
    {
      title: 'Pending Events',
      value: stats.pendingProposals,
      icon: Cpu,
      change: '+2',
      color: 'yellow',
      link: '/AdminEvents'
    },
    {
      title: 'Active Leaders',
      value: stats.activeLeaders,
      icon: Code,
      change: '0',
      color: 'purple',
      link: '/AdminClub'
    },
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: Database,
      change: '+12',
      color: 'green',
      link: '/dashboard'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-900/70 to-blue-800/70 border-blue-700/50 hover:border-blue-500/70',
      yellow: 'from-amber-900/70 to-amber-800/70 border-amber-700/50 hover:border-amber-500/70',
      purple: 'from-purple-900/70 to-purple-800/70 border-purple-700/50 hover:border-purple-500/70',
      green: 'from-emerald-900/70 to-emerald-800/70 border-emerald-700/50 hover:border-emerald-500/70'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-400 group-hover:text-blue-300',
      yellow: 'text-amber-400 group-hover:text-amber-300',
      purple: 'text-purple-400 group-hover:text-purple-300',
      green: 'text-emerald-400 group-hover:text-emerald-300'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-amber-900/30 text-amber-400 border-amber-700/50',
      approved: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50',
      rejected: 'bg-rose-900/30 text-rose-400 border-rose-700/50'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };


  return (
    <div className = "bg-black">

      <main className="pt-10 pr-20 pb-15 px-4 sm:px-6 lg:px-50 w-full max-w-none">
        <div className="w-full">
          {/* Header */}
          <ScrollAnimationWrapper>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex flex-wrap items-center gap-10 mb-4">
                <motion.div 
                  whileHover={{ rotate: 5 }}
                  className="p-3 bg-gradient-to-br from-blue-900/70 to-purple-900/70 rounded-xl border border-blue-700/50"
                >
                  <Terminal className="w-8 h-8 text-blue-400" />
                </motion.div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Admin Console
                  </h1>
                  <p className="text-slate-400 text-sm md:text-lg">
                    <span className="text-green-400">$</span> Manage your digital ecosystem
                  </p>
                </div>
              </div>
            </motion.div>
          </ScrollAnimationWrapper>

          

          {/* Quick Actions */}
          <ScrollAnimationWrapper>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className=" backdrop-blur-sm rounded-xl p-7 mb-8"
            >
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Quick Commands
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 pl-8">Execute common administrative tasks</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <motion.div whileHover={{ y: -2 }}>
                    <Link 
                      to="/AdminClub" 
                      className="flex flex-col items-start p-4 space-y-2 bg-gradient-to-br from-blue-900/50 to-blue-900/30 hover:from-blue-800/50 hover:to-blue-800/30 rounded-lg border border-blue-800/30 hover:border-blue-600/50 transition-all duration-200 h-full"
                    >
                      <div className="p-2 bg-blue-900/50 rounded-lg border border-blue-800/50">
                        <FiPlus className="w-5 h-5 text-blue-400" />
                      </div>
                      <h4 className="font-medium text-white">Create Club</h4>
                      <p className="text-xs text-slate-400">Initialize new club instance</p>
                      <div className="mt-2 text-xs font-mono text-blue-300 bg-blue-900/30 px-2 py-1 rounded">
                        $ admin create --club
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }}>
                    <Link 
                      to="/AdminEvents" 
                      className="flex flex-col items-start p-4 space-y-2 bg-gradient-to-br from-emerald-900/50 to-emerald-900/30 hover:from-emerald-800/50 hover:to-emerald-800/30 rounded-lg border border-emerald-800/30 hover:border-emerald-600/50 transition-all duration-200 h-full"
                    >
                      <div className="p-2 bg-emerald-900/50 rounded-lg border border-emerald-800/50">
                        <FiCheck className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h4 className="font-medium text-white">Review Events</h4>
                      <p className="text-xs text-slate-400">Approve pending submissions</p>
                      <div className="mt-2 text-xs font-mono text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded">
                        $ admin review --events
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }}>
                    <Link 
                      to="/AdminClub" 
                      className="flex flex-col items-start p-4 space-y-2 bg-gradient-to-br from-purple-900/50 to-purple-900/30 hover:from-purple-800/50 hover:to-purple-800/30 rounded-lg border border-purple-800/30 hover:border-purple-600/50 transition-all duration-200 h-full"
                    >
                      <div className="p-2 bg-purple-900/50 rounded-lg border border-purple-800/50">
                        <FiUsers className="w-5 h-5 text-purple-400" />
                      </div>
                      <h4 className="font-medium text-white">Manage Leaders</h4>
                      <p className="text-xs text-slate-400">Configure leadership roles</p>
                      <div className="mt-2 text-xs font-mono text-purple-300 bg-purple-900/30 px-2 py-1 rounded">
                        $ admin config --leaders
                      </div>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </ScrollAnimationWrapper>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Proposals */}
            <ScrollAnimationWrapper>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                      Pending Proposals
                    </span>
                  </h3>
                  <Link to="/AdminEvents" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center">
                    <span>view all</span>
                    <span className="ml-1">→</span>
                  </Link>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 0.8 }}
                          transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
                          className="h-20 bg-slate-800/50 rounded-lg border border-slate-700/50"
                        />
                      ))}
                    </div>
                  ) : pendingProposals.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <FiClock className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-500">No pending proposals</p>
                      <p className="text-slate-600 text-sm mt-1">All clear!</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {pendingProposals.map((proposal, index) => (
                          <motion.div
                            key={proposal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            exit={{ opacity: 0 }}
                            whileHover={{ scale: 1.02 }}
                            className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600/70 transition-all cursor-pointer"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-white mb-1">{proposal.title}</h4>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(proposal.status)}`}>
                                {proposal.status}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm mb-2 line-clamp-2">{proposal.description}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">@{proposal.submittedBy}</span>
                              <div className="flex gap-2">
                                <motion.button 
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-1 sm:p-2 bg-emerald-900/30 hover:bg-emerald-800/50 rounded text-emerald-400 transition-colors border border-emerald-800/50"
                                >
                                  <FiCheck className="w-4 h-4" />
                                </motion.button>
                                <motion.button 
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-1 sm:p-2 bg-rose-900/30 hover:bg-rose-800/50 rounded text-rose-400 transition-colors border border-rose-800/50"
                                >
                                  <FiX className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            </ScrollAnimationWrapper>

            {/* System Health */}
            <ScrollAnimationWrapper>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-800">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Server className="w-5 h-5 text-emerald-400" />
                    <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                      System Status
                    </span>
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-3 bg-emerald-900/10 border border-emerald-800/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">All Systems Operational</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-emerald-400 mr-2">100%</span>
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                  </motion.div>
                  <div className="space-y-3 text-sm sm:text-base">
                    {[
                      { label: 'Active Clubs', value: stats.totalClubs, icon: <Terminal className="w-4 h-4 text-blue-400" /> },
                      { label: 'Leaders Assigned', value: stats.activeLeaders, icon: <Code className="w-4 h-4 text-purple-400" /> },
                      { label: 'Pending Reviews', value: stats.pendingProposals, icon: <Cpu className="w-4 h-4 text-amber-400" /> },
                      { label: 'Total Events', value: stats.approvedEvents, icon: <Database className="w-4 h-4 text-emerald-400" /> }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ x: 5 }}
                        className="flex justify-between items-center p-2 hover:bg-slate-800/30 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 text-slate-400">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <span className="font-semibold font-mono">{item.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </ScrollAnimationWrapper>
          </div>

          {/* Recent Activity Placeholder */}
          <ScrollAnimationWrapper>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-8"
            >
              <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FiBell className="w-5 h-5 text-blue-400" />
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Activity Log
                    </span>
                  </h3>
                </div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="p-6 text-center py-8"
                >
                  <div className="inline-block p-4 bg-slate-800/50 rounded-full border border-slate-700/50 mb-4">
                    <FiBell className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400">Activity feed coming in v2.0</p>
                  <p className="text-slate-600 text-sm mt-1">Track all system activities in real-time</p>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="mt-4 inline-block px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-400"
                  >
                    View changelog
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </ScrollAnimationWrapper>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;