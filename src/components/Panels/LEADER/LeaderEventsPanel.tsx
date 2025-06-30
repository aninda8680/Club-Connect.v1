import { useEffect, useState } from "react";
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import Navbar from "../../Navbar";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  XCircle,
  CheckCircle,
} from "lucide-react";

type EventProposal = {
  id: string;
  title: string;
  description: string;
  date: any;
  location?: string;
  createdAt?: any;
  submittedBy?: string;
  status: string;
};

export default function LeaderEventsPanel() {
  const { user } = useAuth();
  const [clubId, setClubId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [proposals, setProposals] = useState<EventProposal[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<EventProposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      if (!user) return;
      const q = query(collection(db, "clubs"), where("leaderId", "==", user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const clubDoc = snap.docs[0];
        setClubId(clubDoc.id);
      }
    };
    fetchClub();
  }, [user]);

  const fetchProposals = async () => {
  if (!clubId) return;
  setLoading(true);

  try {
    // 🔹 Get all proposals
    const proposalSnap = await getDocs(collection(db, `clubs/${clubId}/eventProposals`));
    const proposalsData = proposalSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        date: data.date,
        location: data.location,
        createdAt: data.createdAt,
        submittedBy: data.submittedBy,
        status: data.status || "pending",
      } as EventProposal;
    });
    setProposals(proposalsData);

    // 🔹 Get all approved events from `events` collection
    const approvedSnap = await getDocs(collection(db, `clubs/${clubId}/events`));
    const approvedData = approvedSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        date: data.date,
        location: data.location,
        createdAt: data.createdAt,
        submittedBy: data.submittedBy,
        status: data.status || "approved",
      } as EventProposal;
    });
    setApprovedEvents(approvedData);
  } catch (error) {
    console.error("Error fetching proposals or approved events:", error);
  }

  setLoading(false);
};
  useEffect(() => {
    if (clubId) fetchProposals();
  }, [clubId]);

  const handleCreateProposal = async () => {
    if (!title || !date) return alert("Please fill all fields");
    setIsCreating(true);
    try {
      await addDoc(collection(db, `clubs/${clubId}/eventProposals`), {
        title,
        description,
        date: Timestamp.fromDate(new Date(date)),
        location,
        createdAt: Timestamp.now(),
        submittedBy: user?.uid || "",
        status: "pending",
      });
      alert("✅ Event proposal submitted for admin approval!");
      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      fetchProposals();
    } catch (error) {
      console.error("Error creating proposal:", error);
      alert("❌ Failed to submit proposal.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6 lg:p-8">
      <Navbar />
      <div className="max-w-4xl mx-auto space-y-10">

        {/* ✅ Approved Events Section */}
        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/40 shadow">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-400">Approved Events</h2>
              <p className="text-sm text-slate-400">These have been approved by the admin</p>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-slate-400">Loading...</p>
          ) : approvedEvents.length === 0 ? (
            <p className="text-center text-slate-400">No approved events yet.</p>
          ) : (
            <div className="space-y-4">
              {approvedEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-slate-700/40 rounded-xl border border-slate-600/40"
                >
                  <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                  <p className="text-slate-300 text-sm mb-2">{event.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleString() : ""}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="font-bold text-green-400">Approved</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 💬 Proposal Submission Form */}
        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/40 shadow">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-400">Submit Event Proposal</h2>
              <p className="text-sm text-slate-400">Admin will review and approve</p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event Title"
              className="w-full p-3 rounded bg-slate-700/50 text-white border border-slate-600/50"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event Description"
              className="w-full p-3 rounded bg-slate-700/50 text-white border border-slate-600/50 resize-none"
              rows={3}
            />
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded bg-slate-700/50 text-white border border-slate-600/50"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (optional)"
              className="w-full p-3 rounded bg-slate-700/50 text-white border border-slate-600/50"
            />

            <button
              onClick={handleCreateProposal}
              disabled={isCreating}
              className="w-full py-3 rounded bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition-all duration-300 font-semibold"
            >
              {isCreating ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </div>

        {/* 📜 All Proposals List */}
        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/40 shadow">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl">
              <Calendar className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yellow-300">Your Event Proposals</h2>
              <p className="text-sm text-slate-400">Track approval status</p>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-slate-400">Loading...</p>
          ) : proposals.length === 0 ? (
            <p className="text-center text-slate-400">No proposals submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {proposals.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-slate-700/40 rounded-xl border border-slate-600/40"
                >
                  <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                  <p className="text-slate-300 text-sm mb-2">{event.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleString() : ""}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      <span>
                        Status:{" "}
                        <span
                          className={`font-bold ${
                            event.status === "pending"
                              ? "text-yellow-400"
                              : event.status === "rejected"
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {event.status}
                        </span>
                      </span>
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
