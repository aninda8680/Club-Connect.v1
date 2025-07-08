import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminPanel from "../components/Panels/ADMIN/AdminPanel";
import LeaderPanel from "../components/Panels/LEADER/LeaderPanel";
import MemberPanel from "../components/Panels/MEMBER/MemberPanel";
import ClubList from "../components/ClubList";
import PublicPanel from "../components/Panels/PUBLIC/PublicPanel";

import {
  Activity, Award, BarChart3, Bell, BookOpen, Building2, Calendar, ChevronRight,
  Clock, Crown, Globe, MessageSquare, Settings, Shield, Star, TrendingUp, 
  UserCheck, Users, Zap, ArrowUpRight, Sparkles, Target, Trophy
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchUserData = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setRole(data?.role || "visitor");
        } else {
          setRole("visitor");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setRole("visitor");
      }
    };

    const fetchStats = async () => {
      try {
        const clubsSnap = await getDocs(collection(db, "clubs"));
        const totalClubs = clubsSnap.size;
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
          activeEvents: Math.floor(totalEvents * 0.6),
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUserData(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, [user, navigate]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="w-7 h-7 text-yellow-400" />;
      case "leader": return <Shield className="w-7 h-7 text-purple-400" />;
      case "member": return <Users className="w-7 h-7 text-blue-400" />;
      default: return <Globe className="w-7 h-7 text-emerald-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "from-yellow-500 via-orange-500 to-red-500";
      case "leader": return "from-purple-500 via-pink-500 to-rose-500";
      case "member": return "from-blue-500 via-cyan-500 to-teal-500";
      default: return "from-emerald-500 via-green-500 to-lime-500";
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case "admin": return "System Administrator";
      case "leader": return "Club Leader";
      case "member": return "Club Member";
      default: return "Welcome Visitor";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin": return "Manage the entire platform with full administrative privileges";
      case "leader": return "Lead your club and organize amazing events for your community";
      case "member": return "Participate in club activities and connect with fellow members";
      default: return "Explore clubs and events to find your perfect community";
    }
  };

  const getQuickActions = (role: string) => {
    switch (role) {
      case "admin":
        return [
          { icon: Building2, label: "Manage Clubs", description: "Create and oversee all clubs", color: "from-blue-500 to-blue-600", href: "/AdminClub" },
          { icon: Calendar, label: "Review Events", description: "Manage events", color: "from-purple-500 to-purple-600", href: "/AdminEvents" },
          { icon: BarChart3, label: "Analytics", description: "View platform insights", color: "from-green-500 to-green-600", href: "#" },
          { icon: Settings, label: "Settings", description: "Configure system settings", color: "from-gray-500 to-gray-600", href: "#" },
        ];
      case "leader":
        return [
          { icon: Calendar, label: "Create Event", description: "Plan your next club event", color: "from-purple-500 to-purple-600", href: "/LeaderEvents" },
          { icon: Users, label: "Manage Members", description: "Handle member requests", color: "from-blue-500 to-blue-600", href: "/manage" },
          { icon: MessageSquare, label: "Announcements", description: "Send club updates", color: "from-green-500 to-green-600", href: "#" },
          { icon: BarChart3, label: "Club Analytics", description: "Track club performance", color: "from-orange-500 to-orange-600", href: "#" },
        ];
      case "member":
        return [
          { icon: Calendar, label: "View Events", description: "Discover upcoming events", color: "from-purple-500 to-purple-600", href: "/events" },
          { icon: Users, label: "Club Members", description: "Connect with members", color: "from-blue-500 to-blue-600", href: "#" },
          { icon: BookOpen, label: "Resources", description: "Access club materials", color: "from-green-500 to-green-600", href: "#" },
          { icon: Award, label: "Achievements", description: "View your progress", color: "from-yellow-500 to-yellow-600", href: "#" },
        ];
      default:
        return [
          { icon: Building2, label: "Explore Clubs", description: "Find your community", color: "from-blue-500 to-blue-600", href: "#" },
          { icon: Calendar, label: "Browse Events", description: "See what's happening", color: "from-purple-500 to-purple-600", href: "/events" },
          { icon: Users, label: "Join Community", description: "Connect with others", color: "from-green-500 to-green-600", href: "#" },
          { icon: Star, label: "Get Started", description: "Begin your journey", color: "from-yellow-500 to-yellow-600", href: "#" },
        ];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-200/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 m-auto border-4 border-transparent border-t-purple-400 rounded-full animate-spin animate-reverse"></div>
            <div className="absolute inset-0 w-16 h-16 m-auto border-4 border-transparent border-t-pink-300 rounded-full animate-spin"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Loading Dashboard
            </h2>
            <p className="text-slate-400 text-lg">Preparing your personalized experience...</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />
      <div className="py-20">
        <div className="max-w-7xl mx-auto lg:p-8 space-y-8">

          {/* Header */}
          <div className="relative overflow-hidden y-30 bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-700/30">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-10">
              <div className="flex items-center gap-4">
                <div className={`p-4 bg-gradient-to-r ${getRoleColor(role)} rounded-2xl shadow-2xl`}>
                  {getRoleIcon(role)}
                </div>
                <div className="py-15">
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Welcome back, {user?.displayName || "User"}!
                  </h1>
                  <p className="text-slate-400 text-lg mt-1">{getRoleTitle(role)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, label: "Total Clubs", value: stats.totalClubs, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/20" },
              { icon: Calendar, label: "Total Events", value: stats.totalEvents, color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/20" },
              { icon: Users, label: "Total Members", value: stats.totalMembers, color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/20" },
              { icon: TrendingUp, label: "Active Events", value: stats.activeEvents, color: "from-orange-500 to-red-500", bgColor: "bg-orange-500/20" },
            ].map((stat, index) => (
              <div key={index} className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                  </div>
                </div>
                <div className={`h-1 bg-gradient-to-r ${stat.color} rounded-full opacity-60 group-hover:opacity-100 transition-opacity`} />
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {getQuickActions(role).map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.href !== "#" && navigate(action.href)}
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

          {/* Panels */}
          {role === "leader" && <LeaderPanel />}
          {role === "member" && <MemberPanel />}
          {(role === "visitor" || !role) && <ClubList />}

          {/* Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Recent Activity</h2>
              </div>
              <button className="text-blue-400 hover:text-blue-300 font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {[
                { icon: UserCheck, text: "New member joined Tech Club", time: "2 hours ago", color: "text-green-400" },
                { icon: Calendar, text: "Event 'AI Workshop' was approved", time: "4 hours ago", color: "text-blue-400" },
                { icon: Star, text: "Your club received a 5-star rating", time: "1 day ago", color: "text-yellow-400" },
                { icon: MessageSquare, text: "New announcement posted", time: "2 days ago", color: "text-purple-400" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition">
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
      <Footer />
    </div>
  );
}
