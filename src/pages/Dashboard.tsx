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
          { icon: Calendar, label: "Review Events", description: "Approve and manage events", color: "from-purple-500 to-purple-600", href: "/AdminEvents" },
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
      
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Enhanced Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>
            
            <div className="relative p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className={`relative p-5 bg-gradient-to-r ${getRoleColor(role)} rounded-3xl shadow-2xl`}>
                    {getRoleIcon(role)}
                    <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                        Welcome back
                      </h1>
                      <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                    </div>
                    <p className="text-2xl lg:text-3xl font-semibold text-slate-300">
                      {user?.displayName || "User"}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 bg-gradient-to-r ${getRoleColor(role)} rounded-full text-white font-semibold text-sm shadow-lg`}>
                        {getRoleTitle(role)}
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Online</span>
                    </div>
                    <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                      {getRoleDescription(role)}
                    </p>
                  </div>
                </div>
                
                <div className="lg:ml-auto flex items-center gap-4">
                  <button className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-300 hover:scale-105">
                    <Bell className="w-6 h-6 text-slate-300" />
                  </button>
                  <button className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-300 hover:scale-105">
                    <Settings className="w-6 h-6 text-slate-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Building2, 
                label: "Total Clubs", 
                value: stats.totalClubs, 
                change: "+12%",
                color: "from-blue-500 to-cyan-500", 
                bgColor: "bg-blue-500/10",
                borderColor: "border-blue-500/20"
              },
              { 
                icon: Calendar, 
                label: "Total Events", 
                value: stats.totalEvents, 
                change: "+8%",
                color: "from-purple-500 to-pink-500", 
                bgColor: "bg-purple-500/10",
                borderColor: "border-purple-500/20"
              },
              { 
                icon: Users, 
                label: "Total Members", 
                value: stats.totalMembers, 
                change: "+24%",
                color: "from-green-500 to-emerald-500", 
                bgColor: "bg-green-500/10",
                borderColor: "border-green-500/20"
              },
              { 
                icon: TrendingUp, 
                label: "Active Events", 
                value: stats.activeEvents, 
                change: "+16%",
                color: "from-orange-500 to-red-500", 
                bgColor: "bg-orange-500/10",
                borderColor: "border-orange-500/20"
              },
            ].map((stat, index) => (
              <div key={index} className={`group relative bg-slate-800/50 backdrop-blur-sm border ${stat.borderColor} rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}>
                <div className={`absolute inset-0 ${stat.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-300">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-1 justify-end">
                        <ArrowUpRight className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-semibold">{stat.change}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                    <div className={`h-2 bg-slate-700 rounded-full overflow-hidden`}>
                      <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 group-hover:w-full`} style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Quick Actions
                  </h2>
                  <p className="text-slate-400 text-lg">Get things done faster</p>
                </div>
              </div>
              <Target className="w-8 h-8 text-slate-500" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {getQuickActions(role).map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.href !== "#" && navigate(action.href)}
                  className="group relative bg-slate-700/30 hover:bg-slate-600/50 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-slate-600/30 hover:border-slate-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative space-y-4">
                    <div className={`p-4 bg-gradient-to-r ${action.color} rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors duration-300">
                        {action.label}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                        {action.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-500 font-medium">Click to access</span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Role-specific Panels */}
          <div className="space-y-8">
            {role === "admin" && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-3xl p-1">
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8">
                  <AdminPanel />
                </div>
              </div>
            )}
            {role === "leader" && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl p-1">
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8">
                  <LeaderPanel />
                </div>
              </div>
            )}
            {role === "member" && (
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl p-1">
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8">
                  <MemberPanel />
                </div>
              </div>
            )}
            {(role === "visitor" || !role) && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-3xl p-1">
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8">
                  <ClubList />
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Recent Activity
                  </h2>
                  <p className="text-slate-400 text-lg">Stay updated with latest happenings</p>
                </div>
              </div>
              <button className="text-blue-400 hover:text-blue-300 font-semibold px-4 py-2 rounded-xl hover:bg-blue-500/10 transition-all duration-300">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { icon: UserCheck, text: "New member joined Tech Club", time: "2 hours ago", color: "text-green-400", bgColor: "bg-green-500/10" },
                { icon: Calendar, text: "Event 'AI Workshop' was approved", time: "4 hours ago", color: "text-blue-400", bgColor: "bg-blue-500/10" },
                { icon: Trophy, text: "Your club received a 5-star rating", time: "1 day ago", color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
                { icon: MessageSquare, text: "New announcement posted", time: "2 days ago", color: "text-purple-400", bgColor: "bg-purple-500/10" },
              ].map((activity, index) => (
                <div key={index} className="group flex items-center gap-4 p-6 bg-slate-700/30 hover:bg-slate-700/50 rounded-2xl transition-all duration-300 hover:-translate-y-1 border border-slate-600/30 hover:border-slate-500/50">
                  <div className={`p-3 ${activity.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <activity.icon className={`w-6 h-6 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-lg group-hover:text-blue-300 transition-colors duration-300">
                      {activity.text}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">{activity.time}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
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