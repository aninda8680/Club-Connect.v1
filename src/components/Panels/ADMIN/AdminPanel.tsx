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
  Users as LucideUsers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  collectionGroup,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '../../../firebase';
import Navbar from '../../Navbar';
import Footer from '../../Footer';

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
  [key: string]: any; // For any additional properties
}

interface Club {
  id: string;
  leaderId: string;
  name: string;
  [key: string]: any; // For any additional properties
}

interface RecentActivity {
  id: string;
  type: 'club_created' | 'event_proposed' | 'event_approved' | 'member_joined';
  title: string;
  description: string;
  timestamp: any;
  clubName?: string;
}

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalClubs: 0,
    totalLeaders: 0,
    totalMembers: 0,
    pendingProposals: 0,
    approvedEvents: 0,
    activeLeaders: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingProposals, setPendingProposals] = useState<EventProposal[]>([]);

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get all clubs
      const clubsSnap = await getDocs(collection(db, 'clubs'));
      const clubs = clubsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Club));

      // Get all users with different roles
      const leadersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'leader')));
      const membersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'member')));

      // Get pending proposals
      const proposalsSnap = await getDocs(collectionGroup(db, 'eventProposals'));
      const pendingProps = proposalsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as EventProposal))
        .filter(prop => prop.status === 'pending');

      // Get approved events
      const eventsSnap = await getDocs(collectionGroup(db, 'events'));
      const approvedEvs = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate active leaders (leaders who have clubs)
      const activeLeaderIds = new Set(clubs.map(club => club.leaderId));

      setStats({
        totalClubs: clubs.length,
        totalLeaders: leadersSnap.docs.length,
        totalMembers: membersSnap.docs.length,
        pendingProposals: pendingProps.length,
        approvedEvents: approvedEvs.length,
        activeLeaders: activeLeaderIds.size
      });

      setPendingProposals(pendingProps.slice(0, 5)); // Get first 5 for quick view

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
      icon: Building2, 
      change: '+3', 
      color: 'blue',
      link: '/AdminClub'
    },
    { 
      title: 'Pending Events', 
      value: stats.pendingProposals, 
      icon: FiClock, 
      change: '+2', 
      color: 'yellow',
      link: '/AdminEvents'
    },
    { 
      title: 'Active Leaders', 
      value: stats.activeLeaders, 
      icon: Crown, 
      change: '0', 
      color: 'purple',
      link: '/AdminClub'
    },
    { 
      title: 'Total Members', 
      value: stats.totalMembers, 
      icon: LucideUsers, 
      change: '+12', 
      color: 'green',
      link: '/dashboard'
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-600/20 to-blue-500/20 border-blue-500/30',
      yellow: 'from-yellow-600/20 to-yellow-500/20 border-yellow-500/30',
      purple: 'from-purple-600/20 to-purple-500/20 border-purple-500/30',
      green: 'from-green-600/20 to-green-500/20 border-green-500/30'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-400',
      yellow: 'text-yellow-400',
      purple: 'text-purple-400',
      green: 'text-green-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 w-full max-w-none overflow-x-hidden">
        <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30">
                <FiShield className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-slate-400 text-lg">Manage your club ecosystem with powerful admin tools</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <Link 
                key={index} 
                to={stat.link}
                className="block group"
              >
                <div className={`bg-gradient-to-br ${getColorClasses(stat.color)} backdrop-blur-sm border rounded-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">
                        {loading ? '...' : stat.value}
                      </p>
                      <p className="text-green-400 text-sm mt-1">{stat.change} this week</p>
                    </div>
                    <div className={`p-3 bg-slate-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`w-8 h-8 ${getIconColor(stat.color)}`} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/AdminClub"
                className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
              >
                <FiPlus className="w-5 h-5" />
                <span className="font-semibold">Create New Club</span>
              </Link>
              <Link 
                to="/AdminEvents"
                className="flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
              >
                <FiCheck className="w-5 h-5" />
                <span className="font-semibold">Review Events</span>
              </Link>
              <Link 
                to="/AdminClub"
                className="flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                <FiUsers className="w-5 h-5" />
                <span className="font-semibold">Manage Leaders</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Event Proposals */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Pending Event Proposals
                  </h3>
                  <Link 
                    to="/AdminEvents"
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8 text-slate-400">
                    <div className="animate-pulse">Loading...</div>
                  </div>
                ) : pendingProposals.length === 0 ? (
                  <div className="text-center py-8">
                    <FiClock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No pending proposals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingProposals.slice(0, 3).map((proposal) => (
                      <div key={proposal.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
                        <h4 className="font-semibold text-white mb-1">{proposal.title}</h4>
                        <p className="text-slate-400 text-sm mb-2 line-clamp-2">{proposal.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">By {proposal.submittedBy}</span>
                          <div className="flex gap-2">
                            <button className="p-1 bg-green-600/20 hover:bg-green-600/30 rounded text-green-400 transition-colors">
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button className="p-1 bg-red-600/20 hover:bg-red-600/30 rounded text-red-400 transition-colors">
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* System Health */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl">
              <div className="p-6 border-b border-slate-700/50">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  System Overview
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-600/10 border border-green-600/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">All Systems Operational</span>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Active Clubs</span>
                    <span className="text-white font-semibold">{stats.totalClubs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Leaders Assigned</span>
                    <span className="text-white font-semibold">{stats.activeLeaders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Pending Reviews</span>
                    <span className="text-yellow-400 font-semibold">{stats.pendingProposals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Events</span>
                    <span className="text-white font-semibold">{stats.approvedEvents}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="mt-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl">
              <div className="p-6 border-b border-slate-700/50">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FiBell className="w-5 h-5 text-blue-400" />
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <FiBell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Activity feed coming soon</p>
                  <p className="text-slate-500 text-sm">Track all system activities in real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPanel;
