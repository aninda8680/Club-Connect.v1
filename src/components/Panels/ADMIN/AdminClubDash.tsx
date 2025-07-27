import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, getDocs, collection} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import {
  Terminal,
  Eye,
  Users,
  CalendarCheck,
  Crown,
  ChevronRight,
  Settings,
  ArrowLeft
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

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-20 ">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/clubs")}
          className="flex items-center gap-2 text-green-500 hover:text-green-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Admin</span>
        </button>

        <div className="flex items-center gap-4 mb-2">
          <Terminal className="w-8 h-8 text-green-500" />
          <h1 className="text-3xl font-bold">Admin Console</h1>
        </div>
        <p className="text-green-600">$ Managing club: {club?.name || "Loading..."}</p>
      </div>

      {/* Main Content */}
      <div className="bg-gray-900 rounded-lg border border-green-800 p-6">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-green-800 pb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-green-900 text-green-300' : 'text-green-600 hover:text-green-400'}`}
          >
            <Eye className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${activeTab === 'members' ? 'bg-green-900 text-green-300' : 'text-green-600 hover:text-green-400'}`}
          >
            <Users className="w-4 h-4" />
            Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded ${activeTab === 'events' ? 'bg-green-900 text-green-300' : 'text-green-600 hover:text-green-400'}`}
          >
            <CalendarCheck className="w-4 h-4" />
            Events ({events.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-green-800 rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Club Stats
                  </h3>
                  <div className="space-y-3">
                    <p><span className="text-green-700">Name:</span> {club?.name || "N/A"}</p>
                    <p><span className="text-green-700">Category:</span> {club?.category || "General"}</p>
                    <p><span className="text-green-700">Created:</span> {club?.createdAt?.toDate?.()?.toLocaleDateString?.() ?? "N/A"}</p>
                    <p><span className="text-green-700">Members:</span> {members.length}</p>
                    <p><span className="text-green-700">Upcoming Events:</span> {upcomingEvents}</p>
                  </div>
                </div>

                <div className="border border-green-800 rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Leader Details
                  </h3>
                  {leader ? (
                    <div className="space-y-3">
                      <p><span className="text-green-700">Name:</span> {leader.displayName}</p>
                      <p><span className="text-green-700">Email:</span> {leader.email}</p>
                      <p><span className="text-green-700">Role:</span> {leader.role}</p>
                      <button 
                        onClick={() => {
                          const newLeader = prompt("Enter new leader's email:");
                          if (newLeader) {
                            // Implement leader change logic here
                            alert(`Leader change request for: ${newLeader}`);
                          }
                        }}
                        className="mt-4 text-xs bg-green-900 hover:bg-green-800 text-green-300 px-3 py-1 rounded border border-green-800"
                      >
                        Change Leader
                      </button>
                    </div>
                  ) : (
                    <p className="text-green-700">No leader information available</p>
                  )}
                </div>
              </div>

              <div className="border border-green-800 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Description
                </h3>
                <p className="text-green-300 whitespace-pre-line">
                  {club?.description || "No description available"}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Member Roster ({members.length})
              </h3>
              {members.length === 0 ? (
                <p className="text-green-700">No members found</p>
              ) : (
                <div className="border border-green-800 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-green-900 text-green-300">
                      <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">Joined</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-t border-green-800 hover:bg-green-900/30">
                          <td className="p-3">{member.displayName}</td>
                          <td className="p-3 text-green-600">{member.email}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              member.role === 'leader' 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-gray-800 text-green-400'
                            }`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="p-3 text-green-600 text-sm">
                            {member?.joinedAt?.toDate?.()?.toLocaleDateString?.() ?? "N/A"}
                          </td>
                          <td className="p-3 text-right">
                            <button className="text-green-600 hover:text-green-400">
                              <Settings className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" />
                Event Schedule ({events.length})
              </h3>
              {events.length === 0 ? (
                <p className="text-green-700">No events found</p>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="border border-green-800 rounded-lg p-4 hover:bg-green-900/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-green-300 font-medium">{event.title}</h4>
                          <p className="text-green-600 text-sm mt-1">
                            {event.date?.toDate?.()?.toLocaleDateString() || "No date set"}
                          </p>
                          {event.description && (
                            <p className="text-green-500 text-sm mt-2">
                              {event.description.length > 100 
                                ? `${event.description.substring(0, 100)}...` 
                                : event.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded">
                            {event.type || "event"}
                          </span>
                          <button className="text-green-600 hover:text-green-400">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}