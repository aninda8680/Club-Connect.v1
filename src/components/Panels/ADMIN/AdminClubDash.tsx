import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";
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
} from "lucide-react";

export default function AdminClubDash() {
  const { user } = useAuth();
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState<any>(null);
  const [leader, setLeader] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      if (!clubId) return;

      try {
        const clubDoc = await getDoc(doc(db, "clubs", clubId));
        if (!clubDoc.exists()) {
          console.warn("Club not found");
          return;
        }

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId]);

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


  async function handleChangeLeader() {
  if (!clubId) return;

  const eligibleUsersSnap = await getDocs(collection(db, "users"));
  const eligibleUsers = eligibleUsersSnap.docs
    .filter(doc => doc.data().role !== "admin")
    .map(doc => ({
      id: doc.id,
      ...(doc.data() as { displayName?: string; email?: string; role?: string })
    }));

  const selectedEmail = prompt(
    `Enter email of the new leader:\n\n${eligibleUsers.map(u => `• ${u.displayName || u.email}`).join("\n")}`
  );
  if (!selectedEmail) return;

  const newLeader = eligibleUsers.find(u => u.email === selectedEmail);
  if (!newLeader) return alert("❌ No user found with this email.");

  try {
    // Update club's leaderId
    await updateDoc(doc(db, "clubs", clubId), {
      leaderId: newLeader.id,
    });

    // Promote new leader
    await updateDoc(doc(db, "users", newLeader.id), {
      role: "leader",
    });

    // Optionally demote old leader (if you want)
    if (club?.leaderId) {
      await updateDoc(doc(db, "users", club.leaderId), {
        role: "member",
      });
    }

    alert("✅ Club leader changed successfully.");
    window.location.reload();
  } catch (error) {
    console.error("Error changing leader:", error);
    alert("❌ Failed to change leader.");
  }
}


  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={handleBackToDashboard}
            className="mb-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Admin Dashboard</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {club?.name}
              </h1>
              <p className="text-slate-400 text-lg">Comprehensive club management and analytics</p>
            </div>
            
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Members</p>
                <p className="text-3xl font-bold text-white">{members.length}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold text-white">{events.length}</p>
                <p className="text-blue-400 text-sm">2 upcoming</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>       
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-1">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'events', label: 'Events', icon: Calendar },
              
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Club Information */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700/50 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Building2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Club Information</h3>
                      <p className="text-slate-400">General details and description</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                    <p className="text-slate-300 leading-relaxed">{club?.description || "No description available"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Created</label>
                      <p className="text-white font-medium">{club?.createdAt?.toDate ? club.createdAt.toDate().toLocaleDateString() : "N/A"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                      <p className="text-white font-medium">{club?.category || "General"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leader Information */}
<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
  <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-slate-700/50 p-6">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-purple-500/20 rounded-lg">
        <Crown className="w-6 h-6 text-purple-400" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">Club Leader</h3>
        <p className="text-slate-400">Leadership information</p>
      </div>
    </div>
  </div>
  <div className="p-6">
    {leader ? (
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">
            {leader.avatar || (leader.displayName?.charAt(0) ?? leader.email?.charAt(0) ?? "L")}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold text-lg">{leader.displayName}</h4>
          <p className="text-slate-400">{leader.email}</p>
          <p className="text-purple-400 text-sm font-medium">{leader.role}</p>
          <p className="text-slate-500 text-sm">
            Leading since {leader.joinedAt?.toDate ? leader.joinedAt.toDate().toLocaleDateString() : ""}
          </p>
        </div>
        <button
          onClick={handleChangeLeader}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm"
        >
          🔁 Change Leader
        </button>
      </div>
    ) : (
      <p className="text-slate-400 italic">Leader information not available</p>
    )}
  </div>
</div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border-b border-slate-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Users className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Club Members ({members.length})</h3>
                      <p className="text-slate-400">Manage member roster</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {members.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg font-medium">No members yet</p>
                    <p className="text-slate-500 text-sm">Members will appear here once they join</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {members.map((member) => (
                      <div key={member.id} className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 hover:bg-slate-700/70 transition-all duration-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {member.displayName?.charAt(0) || member.email?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold">{member.displayName || member.name || 'Unknown Member'}</h4>
                            <p className="text-slate-400 text-sm">{member.email}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-blue-400 text-sm font-medium">{member.role}</span>
                              <span className="text-slate-500 text-sm">
                                Joined {member.joinedAt?.toDate ? member.joinedAt.toDate().toLocaleDateString() : ""}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-green-400" />
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
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-b border-slate-700/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Club Events ({events.length})</h3>
                    <p className="text-slate-400">Event history and upcoming activities</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg font-medium">No events scheduled</p>
                    <p className="text-slate-500 text-sm">Events will appear here once created</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {events.map((event) => (
                      <div key={event.id} className="bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 hover:bg-slate-700/70 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{getEventTypeIcon(event.type)}</div>
                            <div>
                              <h4 className="text-white font-semibold text-lg">{event.title}</h4>
                              <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {event.date?.toDate
                                      ? event.date.toDate().toLocaleDateString()
                                      : ""}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Users className="w-4 h-4" />
                                  <span>{event.attendees ?? 0} attendees</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
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
  );
}