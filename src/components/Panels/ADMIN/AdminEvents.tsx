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
  Terminal,
  AlertTriangle,
  Check,
  X,
  User,
  Users,
  CalendarDays,
  Clock
} from "lucide-react";

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

  const fetchClubNames = async () => {
    const snap = await getDocs(collection(db, "clubs"));
    const names: Record<string, string> = {};
    snap.forEach((doc) => {
      names[doc.id] = doc.data().name || "Unknown Club";
    });
    setClubNames(names);
  };

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
      console.error("Error fetching proposals:", err);
    }
  };

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
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchClubNames();
      setLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (Object.keys(clubNames).length === 0) return;
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProposals(), fetchEvents()]);
      setLoading(false);
    };
    loadData();
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
      console.error("Error approving proposal:", err);
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
      console.error("Error rejecting proposal:", err);
    }
  };

  return (
    <div className = "bg-black">
      <div className="py-10">
        <div className="max-w-7xl mx-auto p-4 space-y-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-900/50 rounded-lg border border-green-800/50">
                <Terminal className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-400">
                  $ Admin Console
                </h1>
                <p className="text-gray-400 text-sm">Manage your digital ecosystem</p>
              </div>
            </div>
          </div>

          
          {/* Pending Proposals Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-800/50 border border-gray-700 rounded-t-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-gray-300">
                Pending Event Proposals
              </h2>
              <span className="ml-auto text-xs bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded">
                {proposals.length} pending
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500 border border-gray-700 rounded-b-lg">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Loading proposals...</span>
              </div>
            ) : proposals.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border border-gray-700 rounded-b-lg">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No pending proposals at the moment</p>
                <p className="text-xs mt-1">New proposals will appear here for review</p>
              </div>
            ) : (
              <div className="space-y-3 border border-gray-700 border-t-0 rounded-b-lg p-4">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-yellow-500/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-1.5 bg-yellow-900/50 rounded border border-yellow-800/50">
                            <CalendarDays className="w-4 h-4 text-yellow-400" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-200 mb-1">
                              {proposal.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                              {proposal.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs">
                          <div className="flex items-center gap-2 text-gray-500">
                            <User className="w-3 h-3" />
                            <span>
                              Submitted by:{" "}
                              <span className="text-gray-300">
                                {proposal.submittedBy}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Users className="w-3 h-3" />
                            <span>
                              Club:{" "}
                              <span className="text-blue-400">
                                {proposal.clubName}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <CalendarDays className="w-3 h-3" />
                            <span className="text-green-400">
                              {formatDate(proposal.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(proposal)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-900/50 hover:bg-green-800/50 text-green-400 text-xs font-medium rounded-lg border border-green-800/50 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(proposal)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-400 text-xs font-medium rounded-lg border border-red-800/50 transition-colors"
                        >
                          <X className="w-3 h-3" />
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
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-800/50 border border-gray-700 rounded-t-lg">
              <Check className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold text-gray-300">
                Approved Events
              </h2>
              <span className="ml-auto text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded">
                {events.length} approved
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500 border border-gray-700 rounded-b-lg">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Loading events...</span>
              </div>
            ) : events.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border border-gray-700 rounded-b-lg">
                <CalendarDays className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No approved events yet</p>
                <p className="text-xs mt-1">Approved events will be displayed here</p>
              </div>
            ) : (
              <div className="space-y-3 border border-gray-700 border-t-0 rounded-b-lg p-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-green-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-green-900/50 rounded border border-green-800/50">
                        <Check className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-200 mb-1">
                          {event.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                          {event.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Users className="w-3 h-3" />
                            <span>
                              Club:{" "}
                              <span className="text-blue-400">
                                {event.clubName}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <CalendarDays className="w-3 h-3" />
                            <span className="text-green-400">
                              {formatDate(event.date)}
                            </span>
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
    </div>
  );
}