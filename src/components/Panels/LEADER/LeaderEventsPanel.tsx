import { useEffect, useState } from "react";
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import Navbar from "../../Navbar";
import { Calendar, Plus, Trash2, Clock, MapPin, Users, FileText, Sparkles, Edit3, Save, X } from 'lucide-react';

export default function LeaderEventsPanel() {
  const { user } = useAuth();
  const [clubId, setClubId] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState(""); // <-- Added
  const [isCreating, setIsCreating] = useState(false); // <-- Added

  // Edit state
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
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

  useEffect(() => {
    const fetchEvents = async () => {
      if (!clubId) return;
      setLoading(true); 
      const eventSnap = await getDocs(collection(db, `clubs/${clubId}/events`));
      const eventsData = eventSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
      setLoading(false);
    };
    fetchEvents();
  }, [clubId]);

  const handleCreateEvent = async () => {
    if (!title || !date) return alert("Please fill all fields");
    setIsCreating(true);
    try {
      await addDoc(collection(db, `clubs/${clubId}/events`), {
        title,
        description,
        date: Timestamp.fromDate(new Date(date)),
        location, // <-- Save location
        createdAt: Timestamp.now(),
      });
      alert("✅ Event created!");
      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      // Refresh events
      const eventSnap = await getDocs(collection(db, `clubs/${clubId}/events`));
      setEvents(eventSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, `clubs/${clubId}/events/${eventId}`));
      setEvents(events.filter((event) => event.id !== eventId));
      alert("🗑️ Event deleted.");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("❌ Failed to delete event.");
    }
  };

  // Edit event handlers
  const handleEditEvent = (event: any) => {
    setEditingEvent({ ...event });
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;
    try {
      await updateDoc(doc(db, `clubs/${clubId}/events/${editingEvent.id}`), {
        title: editingEvent.title,
        description: editingEvent.description,
      });
      setEvents(events.map(ev => ev.id === editingEvent.id ? { ...ev, ...editingEvent } : ev));
      setEditingEvent(null);
      alert("✅ Event updated!");
    } catch (err) {
    console.error("Error updating event:", err);
    alert("❌ Failed to update event.");
  }
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
  };

  if (loading) {
    return (
      <div className="max-h-screen w-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-8 h-8 m-auto border-4 border-transparent border-t-purple-400 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6 lg:p-8">
      <Navbar />
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Create Event Section */}
        <div className="relative bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-700/30 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>

          <div className="relative">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Create Event
                </h2>
                <p className="text-slate-400">Design and schedule your next amazing event</p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Event Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Sparkles className="w-4 h-4" />
                  Event Title
                </label>
                <input
                  type="text"
                  placeholder="Enter an engaging event title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                />
              </div>

              {/* Event Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <FileText className="w-4 h-4" />
                  Event Description
                </label>
                <textarea
                  placeholder="Describe what makes this event special..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-none"
                />
              </div>

              {/* Date and Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Clock className="w-4 h-4" />
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Event location (optional)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateEvent}
                disabled={!title.trim() || !description.trim() || !date || isCreating}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 transform flex items-center justify-center gap-3"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Event...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Your Events Section */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-slate-700/30">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Your Events
              </h3>
              <p className="text-slate-400">Manage and track your created events</p>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-400 text-lg">No events created yet</p>
              <p className="text-slate-500 text-sm">Create your first event to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="group bg-slate-700/30 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6 hover:bg-slate-700/50 transition-all duration-300 hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {editingEvent?.id === event.id ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editingEvent.title}
                        onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                        className="w-full p-3 rounded-lg bg-slate-600/50 border border-slate-500/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      <textarea
                        value={editingEvent.description}
                        onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                        rows={3}
                        className="w-full p-3 rounded-lg bg-slate-600/50 border border-slate-500/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
                              {event.title}
                            </h4>
                            <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                              {event.description}
                            </p>

                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span>{event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleString() : ""}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-purple-400" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-green-400" />
                                <span>{event.attendees ?? 0} attendees</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 flex-shrink-0">
                        
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}