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
  Clock, Crown, Globe, MessageSquare, Settings, Shield, Star, TrendingUp, UserCheck, Users, Zap
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
      case "admin": return <Crown className="w-6 h-6 text-yellow-400" />;
      case "leader": return <Shield className="w-6 h-6 text-purple-400" />;
      case "member": return <Users className="w-6 h-6 text-blue-400" />;
      default: return <Globe className="w-6 h-6 text-green-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "from-yellow-500 to-orange-500";
      case "leader": return "from-purple-500 to-pink-500";
      case "member": return "from-blue-500 to-cyan-500";
      default: return "from-green-500 to-emerald-500";
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

  const getQuickActions = (role: string) => {
    switch (role) {
      case "admin":
        return [
          { icon: Building2, label: "Manage Clubs", color: "bg-blue-500", href: "/AdminClub" },
          { icon: Calendar, label: "Review Events", color: "bg-purple-500", href: "/AdminEvents" },
          
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
      {/* Panels */}
          {role === "leader" && <LeaderPanel />}
          {role === "member" && <MemberPanel />}
          {(role === "visitor" || !role) && <PublicPanel />}

        
      
      <Footer />
    </div>
  );
}
