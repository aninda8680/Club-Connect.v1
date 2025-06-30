import { useEffect, useState } from "react";
import {
  collectionGroup,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  collection,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  Sparkles,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Building2,
  Calendar,
  Clock,
} from "lucide-react";
import Navbar from "../../Navbar";

interface Proposal {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: any;
  submittedBy: string;
  status: string;
  clubName?: string;
}

interface Event {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: any;
  clubName?: string;
}

export default function AdminEvents() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [clubNames, setClubNames] = useState<Record<string, string>>({});

  // Helper: Format Firestore Timestamp or Date
  function formatDate(date: any) {
    if (!date) return "";
    if (date.toDate) {
      return date.toDate().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    if (typeof date === "string" || date instanceof Date) {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return "";
  }

  // Fetch all club names for mapping
  const fetchClubNames = async () => {
    const snap = await getDocs(collection(db, "clubs"));
    const names: Record<string, string> = {};
    snap.forEach((doc) => {
      names[doc.id] = doc.data().name || "Unknown Club";
    });
    setClubNames(names);
  };

  // 🔍 Fetch event proposals
  const fetchProposals = async () => {
    try {
      const snapshot = await getDocs(collectionGroup(db, "eventProposals"));
      const result: Proposal[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const clubId = docSnap.ref.parent.parent?.id || "unknown";
        if (data.status === "pending") {
          result.push({
            id: docSnap.id,
            clubId,
            title: data.title,
            description: data.description,
            date: data.date,
            submittedBy: data.submittedBy,
            status: data.status,
            clubName: clubNames[clubId] || "Unknown Club",
          });
        }
      });

      setProposals(result);
    } catch (err) {
      console.error("❌ Error fetching proposals:", err);
    }
  };

  // 🔍 Fetch approved events
  const fetchEvents = async () => {
    try {
      const snapshot = await getDocs(collectionGroup(db, "events"));
      const result: Event[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const clubId = docSnap.ref.parent.parent?.id || "unknown";
        result.push({
          id: docSnap.id,
          clubId,
          title: data.title,
          description: data.description,
          date: data.date,
          clubName: clubNames[clubId] || "Unknown Club",
        });
      });

      setEvents(result);
    } catch (err) {
      console.error("❌ Error fetching events:", err);
    }
  };

  // Load all data
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchClubNames();
      setLoading(false);
    };
    loadAll();
  }, []);

  // Fetch proposals and events after clubNames are loaded
  useEffect(() => {
    if (Object.keys(clubNames).length === 0) return;
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProposals(), fetchEvents()]);
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line
  }, [clubNames]);

  const handleApprove = async (proposal: Proposal) => {
    try {
      const eventRef = doc(db, "clubs", proposal.clubId, "events", proposal.id);
      await setDoc(eventRef, {
        title: proposal.title,
        description: proposal.description,
        date: proposal.date,
        approvedBy: "admin",
      });

      const proposalRef = doc(
        db,
        "clubs",
        proposal.clubId,
        "eventProposals",
        proposal.id
      );
      await deleteDoc(proposalRef);

      fetchProposals();
      fetchEvents();
    } catch (err) {
      console.error("❌ Error approving proposal:", err);
    }
  };

  const handleReject = async (proposal: Proposal) => {
    try {
      const proposalRef = doc(
        db,
        "clubs",
        proposal.clubId,
        "eventProposals",
        proposal.id
      );
      await setDoc(proposalRef, { status: "rejected" }, { merge: true });
      fetchProposals();
    } catch (err) {
      console.error("❌ Error rejecting proposal:", err);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6 lg:p-8">
      <Navbar/>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Event Management Dashboard
            </h1>
          </div>
          <p className="text-slate-400 text-lg">Review and manage event proposals from clubs</p>
        </div>

        

        {/* Pending Proposals Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Pending Event Proposals</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : proposals.length === 0 ? (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 text-center">
              <Clock className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No pending proposals at the moment</p>
              <p className="text-slate-500 text-sm mt-2">New proposals will appear here for review</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:border-purple-500/30"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <Calendar className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">{proposal.title}</h3>
                          <p className="text-slate-300 leading-relaxed">{proposal.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                          <User className="w-4 h-4" />
                          <span>Submitted by: <span className="text-purple-400 font-medium">{proposal.submittedBy}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Building2 className="w-4 h-4" />
                          <span>Club: <span className="text-blue-400 font-medium">{proposal.clubName}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-green-400 font-medium">{formatDate(proposal.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(proposal)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(proposal)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Events Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Approved Events</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : events.length === 0 ? (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 text-center">
              <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No approved events yet</p>
              <p className="text-slate-500 text-sm mt-2">Approved events will be displayed here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
                      <p className="text-slate-300 mb-3 leading-relaxed">{event.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Building2 className="w-4 h-4" />
                          <span>Club: <span className="text-blue-400 font-medium">{event.clubName}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-green-400 font-medium">{formatDate(event.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}