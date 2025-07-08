import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, getDocs, collection, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import {
  Building2,
  Calendar,
  Users,
  ArrowLeft,
  BarChart3,
  Crown,
  UserCheck,
  Clock,
  Eye,
  Shield,
  Activity,
  TrendingUp,
  Star,
  Award,
  ChevronRight,
  Settings,
} from "lucide-react";

export default function AdminClubDash() {
  useAuth();
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState<any>(null);
  const [leader, setLeader] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const now = new Date();
  const upcomingEvents = events.filter((e) => e.date?.toDate?.() > now).length;

  useEffect(() => {
    const fetchData = async () => {
      if (!clubId) return;

      try {
        const clubDoc = await getDoc(doc(db, "clubs", clubId));
        if (!clubDoc.exists()) return;

        const clubData = {
          id: clubDoc.id,
          ...(clubDoc.data() as { leaderId: string; [key: string]: any }),
        };
        setClub(clubData);

        const leaderDoc = await getDoc(doc(db, "users", clubData.leaderId));
        setLeader(leaderDoc.exists() ? leaderDoc.data() : null);

        const membersSnap = await getDocs(collection(db, `clubs/${clubId}/members`));
        setMembers(membersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        const eventsSnap = await getDocs(collection(db, `clubs/${clubId}/events`));
        setEvents(eventsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error loading club data:", error);
      }
    };

    fetchData();
  }, [clubId]);

  async function handleChangeLeader() {
    if (!clubId || !club?.leaderId) return;

    const eligibleUsersSnap = await getDocs(collection(db, "users"));
    const eligibleUsers = eligibleUsersSnap.docs
      .filter((doc) => doc.data().role !== "admin")
      .map((doc) => ({
        id: doc.id,
        ...(doc.data() as { displayName?: string; email?: string; role?: string }),
      }));

    const selectedEmail = prompt(
      `Enter email of the new leader:\n\n${eligibleUsers
        .map((u) => `• ${u.displayName || u.email}`)
        .join("\n")}`
    );
    if (!selectedEmail) return;

    const newLeader = eligibleUsers.find((u) => u.email === selectedEmail);
    if (!newLeader) return alert("❌ No user found with this email.");

    try {
      const currentLeaderDoc = await getDoc(doc(db, "users", club.leaderId));
      const currentLeader = currentLeaderDoc.data();

      await updateDoc(doc(db, "users", club.leaderId), { role: "member" });

      await setDoc(doc(db, `clubs/${clubId}/members/${club.leaderId}`), {
        displayName: currentLeader?.displayName || "",
        email: currentLeader?.email || "",
        role: "member",
        joinedAt: new Date(),
      });

      await updateDoc(doc(db, "users", newLeader.id), { role: "leader" });
      await updateDoc(doc(db, "clubs", clubId), { leaderId: newLeader.id });

      alert("✅ Club leader changed successfully.");
      window.location.reload();
    } catch (error) {
      console.error("Error changing leader:", error);
      alert("❌ Failed to change leader.");
    }
  }

  function handleBackToDashboard() {
    navigate("/admin/clubs");
  }

  function getEventTypeIcon(type: string) {
    switch (type) {
      case "workshop":
        return <BarChart3 className="w-6 h-6 text-blue-400" />;
      case "meeting":
        return <Users className="w-6 h-6 text-green-400" />;
      case "competition":
        return <Crown className="w-6 h-6 text-yellow-400" />;
      default:
        return <Calendar className="w-6 h-6 text-purple-400" />;
    }
  }

  function getEventTypeColor(type: string) {
    switch (type) {
      case "workshop":
        return "from-blue-500/20 to-cyan-500/20";
      case "meeting":
        return "from-green-500/20 to-emerald-500/20";
      case "competition":
        return "from-yellow-500/20 to-orange-500/20";
      default:
        return "from-purple-500/20 to-pink-500/20";
    }
  }


  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBackToDashboard}
              className="mb-6 group flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl px-4 py-2 hover:bg-slate-700/50"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Admin Dashboard</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {club?.name}
                  </h1>
                  <div className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-3 py-1">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 text-sm font-medium">Admin View</span>
                  </div>
                </div>
                <p className="text-slate-400 text-lg">Comprehensive club management and analytics</p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl">
                  <Activity className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Total Members</p>
                  <p className="text-3xl font-bold text-white mb-1">{members.length}</p>
                  <div className="flex items-center gap-1 text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">+12% this month</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Total Events</p>
                  <p className="text-3xl font-bold text-white mb-1">{events.length}</p>
                  <div className="flex items-center gap-1 text-blue-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{upcomingEvents} upcoming</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                  <Calendar className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Engagement</p>
                  <p className="text-3xl font-bold text-white mb-1">94%</p>
                  <div className="flex items-center gap-1 text-green-400">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">Excellent</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                  <Activity className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>

            <div className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Achievements</p>
                  <p className="text-3xl font-bold text-white mb-1">8</p>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Award className="w-4 h-4" />
                    <span className="text-sm">2 this month</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl group-hover:from-yellow-500/30 group-hover:to-orange-500/30 transition-all duration-300">
                  <Award className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-2">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'members', label: 'Members', icon: Users },
                { id: 'events', label: 'Events', icon: Calendar },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="w-4 h-4 opacity-70" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Club Information */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                  <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 border-b border-slate-700/50 p-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-2xl">
                        <Building2 className="w-8 h-8 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Club Information</h3>
                        <p className="text-slate-400">General details and description</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-3">Description</label>
                      <p className="text-slate-300 leading-relaxed bg-slate-700/30 rounded-xl p-4">
                        {club?.description || "No description available"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-slate-700/30 rounded-xl p-4">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Created</label>
                        <p className="text-white font-semibold">{club?.createdAt?.toDate?.()?.toLocaleDateString?.() ?? "N/A"}</p>
                      </div>
                      <div className="bg-slate-700/30 rounded-xl p-4">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                        <p className="text-white font-semibold">{club?.category || "General"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leader Information */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 border-b border-slate-700/50 p-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500/20 rounded-2xl">
                        <Crown className="w-8 h-8 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Club Leader</h3>
                        <p className="text-slate-400">Leadership information</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    {leader ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">
                              {leader.displayName?.charAt(0) || "L"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-xl mb-1">{leader.displayName}</h4>
                            <p className="text-slate-400 mb-2">{leader.email}</p>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                                {leader.role}
                              </span>
                            </div>
                            <p className="text-slate-500 text-sm">
                              Leading since {leader?.joinedAt?.toDate?.()?.toLocaleDateString?.() ?? "N/A"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleChangeLeader}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                          🔁 Change Leader
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Crown className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 italic">Leader information not available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
                <div className="bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-green-600/20 border-b border-slate-700/50 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500/20 rounded-2xl">
                        <Users className="w-8 h-8 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Club Members ({members.length})</h3>
                        <p className="text-slate-400">Manage member roster</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  {members.length === 0 ? (
                    <div className="text-center py-16">
                      <Users className="w-20 h-20 text-slate-600 mx-auto mb-6" />
                      <p className="text-slate-400 text-xl font-semibold mb-2">No members yet</p>
                      <p className="text-slate-500">Members will appear here once they join</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {members.map((member, index) => (
                        <div 
                          key={member.id} 
                          className="group bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 rounded-2xl p-6 transition-all duration-300 hover:scale-102 hover:shadow-lg"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-xl">
                                {member.displayName?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-bold text-lg mb-1">{member.displayName || 'Unknown Member'}</h4>
                              <p className="text-slate-400 mb-2">{member.email}</p>
                              <div className="flex items-center gap-4">
                                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                                  {member.role}
                                </span>
                                <span className="text-slate-500 text-sm">
                                  Joined {member?.joinedAt?.toDate?.()?.toLocaleDateString?.() ?? "N/A"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-500/20 rounded-xl">
                                <UserCheck className="w-6 h-6 text-green-400" />
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-300" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300">
                <div className="bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-yellow-600/20 border-b border-slate-700/50 p-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/20 rounded-2xl">
                      <Calendar className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Club Events ({events.length})</h3>
                      <p className="text-slate-400">Event history and upcoming activities</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  {events.length === 0 ? (
                    <div className="text-center py-16">
                      <Calendar className="w-20 h-20 text-slate-600 mx-auto mb-6" />
                      <p className="text-slate-400 text-xl font-semibold mb-2">No events scheduled</p>
                      <p className="text-slate-500">Events will appear here once created</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {events.map((event, index) => (
                        <div 
                          key={event.id} 
                          className="group bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 rounded-2xl p-6 transition-all duration-300 hover:scale-102 hover:shadow-lg"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div className={`p-4 bg-gradient-to-r ${getEventTypeColor(event.type)} rounded-2xl shadow-lg`}>
                                <div className="text-white">
                                  {getEventTypeIcon(event.type)}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-white font-bold text-xl mb-2">{event.title}</h4>
                                <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-2 text-slate-400">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium">
                                      {event?.date?.toDate?.()?.toLocaleDateString?.() ?? "TBD"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-400">
                                    <Users className="w-5 h-5" />
                                    <span className="font-medium">{event.attendees ?? 0} attendees</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-600/50 rounded-xl">
                                <Settings className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-300" />
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-300" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}