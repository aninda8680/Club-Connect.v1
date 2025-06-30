
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import AdminPanel from "../components/Panels/ADMIN/AdminPanel";
import ClubList from "../components/ClubList";
import LeaderPanel from "../components/Panels/LEADER/LeaderPanel";
import MemberPanel from "../components/Panels/MEMBER/MemberPanel";
import Navbar from "../components/Navbar";
import {
  Crown,
  Users,
  Calendar,
  Building2,
  Activity,
  TrendingUp,
  Bell,
  Settings,
  ChevronRight,
  Award,
  BarChart3,
  Clock,
  UserCheck,
  Star,
  Zap,
  Globe,
  Shield,
  BookOpen,
  MessageSquare,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [role, setRole] = useState("");
  const [stats, setStats] = useState({
    totalClubs: 0,
    totalEvents: 0,
    totalMembers: 0,
    activeEvents: 0,
  });
  // const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role);
          setRole(data.role);
        }
      }
    };
    const fetchStats = async () => {
      try {
        // Fetch clubs count
        const clubsSnap = await getDocs(collection(db, "clubs"));
        const totalClubs = clubsSnap.size;

        // Fetch total events across all clubs
        let totalEvents = 0;
        let totalMembers = 0;
        
        for (const clubDoc of clubsSnap.docs) {
          const eventsSnap = await getDocs(collection(db, `clubs/${clubDoc.id}/events`));
          totalEvents += eventsSnap.size;
          
          const membersSnap = await getDocs(collection(db, `clubs/${clubDoc.id}/members`));
          totalMembers += membersSnap.size;
        }

        setStats({
          totalClubs,
          totalEvents,
          totalMembers,
          activeEvents: Math.floor(totalEvents * 0.6), // Mock active events
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUserData(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  const getRoleIcon = (userRole: string) => {
    switch (userRole) {
      case "admin":
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case "leader":
        return <Shield className="w-6 h-6 text-purple-400" />;
      case "member":
        return <Users className="w-6 h-6 text-blue-400" />;
      default:
        return <Globe className="w-6 h-6 text-green-400" />;
    }
  };

  const getRoleColor = (userRole: string) => {
    switch (userRole) {
      case "admin":
        return "from-yellow-500 to-orange-500";
      case "leader":
        return "from-purple-500 to-pink-500";
      case "member":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-green-500 to-emerald-500";
    }
  };

  const getRoleTitle = (userRole: string) => {
    switch (userRole) {
      case "admin":
        return "System Administrator";
      case "leader":
        return "Club Leader";
      case "member":
        return "Club Member";
      default:
        return "Welcome Visitor";
    }
  };

  const getQuickActions = (userRole: string) => {
    switch (userRole) {
      case "admin":
        return [
          { icon: Building2, label: "Manage Clubs", color: "bg-blue-500", href: "#" },
          { icon: Calendar, label: "Review Events", color: "bg-purple-500", href: "/AdminEvents" },
          { icon: Users, label: "User Management", color: "bg-green-500", href: "#" },
          { icon: BarChart3, label: "Analytics", color: "bg-orange-500", href: "#" },
        ];
      case "leader":
        return [
          { icon: Calendar, label: "Create Event", color: "bg-purple-500", href: "/LeaderEvents" },
          { icon: Users, label: "Manage Members", color: "bg-blue-500", href: "/manage" },
          { icon: MessageSquare, label: "Announcements", color: "bg-green-500", href: "#" },
          { icon: BarChart3, label: "Club Analytics", color: "bg-orange-500", href: "#" },
        ];
      case "member":
        return [
          { icon: Calendar, label: "View Events", color: "bg-purple-500", href: "/events" },
          { icon: Users, label: "Club Members", color: "bg-blue-500", href: "#" },
          { icon: BookOpen, label: "Resources", color: "bg-green-500", href: "#" },
          { icon: Award, label: "Achievements", color: "bg-yellow-500", href: "#" },
        ];
      default:
        return [
          { icon: Building2, label: "Explore Clubs", color: "bg-blue-500", href: "#" },
          { icon: Calendar, label: "Browse Events", color: "bg-purple-500", href: "/events" },
          { icon: Users, label: "Join Community", color: "bg-green-500", href: "#" },
          { icon: Star, label: "Get Started", color: "bg-yellow-500", href: "#" },
        ];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 m-auto border-4 border-transparent border-t-purple-400 rounded-full animate-spin animate-reverse"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Dashboard</h2>
          <p className="text-slate-400">Preparing your personalized experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-700/30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 bg-gradient-to-r ${getRoleColor(role)} rounded-2xl shadow-2xl`}>
                {getRoleIcon(role)}
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Welcome back, {user?.displayName || "User"}!
                </h1>
                <p className="text-slate-400 text-lg mt-1">{getRoleTitle(role)}</p>
              </div>
            </div>
            
            <div className="lg:ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-xl">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Online</span>
              </div>
              <button className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-colors duration-200">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-colors duration-200">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Building2, label: "Total Clubs", value: stats.totalClubs, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/20" },
            { icon: Calendar, label: "Total Events", value: stats.totalEvents, color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/20" },
            { icon: Users, label: "Total Members", value: stats.totalMembers, color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/20" },
            { icon: TrendingUp, label: "Active Events", value: stats.activeEvents, color: "from-orange-500 to-red-500", bgColor: "bg-orange-500/20" },
          ].map((stat, index) => (
            <div key={index} className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                </div>
              </div>
              <div className={`h-1 bg-gradient-to-r ${stat.color} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getQuickActions(role).map((action, index) => (
              <button
                key={index}
                className="group flex items-center gap-4 p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`p-3 ${action.color} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
                    {action.label}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </button>
            ))}
          </div>
        </div>

        {/* Role-specific Content */}
        <div className="space-y-8">
          {role === "admin" && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-b border-slate-700/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Admin Control Panel</h3>
                    <p className="text-slate-400">Manage the entire platform</p>
                  </div>
                </div>
              </div>
              <AdminPanel />
            </div>
          )}

          {role === "leader" && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-slate-700/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Leadership Dashboard</h3>
                    <p className="text-slate-400">Manage your club and members</p>
                  </div>
                </div>
              </div>
              <LeaderPanel />
            </div>
          )}

          {role === "member" && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-slate-700/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Member Portal</h3>
                    <p className="text-slate-400">Your club activities and updates</p>
                  </div>
                </div>
              </div>
              <MemberPanel />
            </div>
          )}

          {role === "visitor" && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-slate-700/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Globe className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Explore Communities</h3>
                    <p className="text-slate-400">Discover clubs that match your interests</p>
                  </div>
                </div>
              </div>
              <ClubList />
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            </div>
            <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { icon: UserCheck, text: "New member joined Tech Club", time: "2 hours ago", color: "text-green-400" },
              { icon: Calendar, text: "Event 'AI Workshop' was approved", time: "4 hours ago", color: "text-blue-400" },
              { icon: Star, text: "Your club received a 5-star rating", time: "1 day ago", color: "text-yellow-400" },
              { icon: MessageSquare, text: "New announcement posted", time: "2 days ago", color: "text-purple-400" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors duration-200">
                <div className="p-2 bg-slate-600/50 rounded-lg">
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.text}</p>
                  <p className="text-slate-400 text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}