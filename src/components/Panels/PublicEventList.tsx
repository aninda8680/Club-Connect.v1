import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Calendar, MapPin, Users, Clock, Sparkles, ArrowRight } from "lucide-react"; // <-- Added ArrowRight
import Navbar from "../Navbar";


// Optional: Map icon names to components if your events have an 'icon' field as a string
const ICON_MAP: Record<string, React.ElementType> = {
  Calendar,
  MapPin,
  Users,
  Clock,
  Sparkles,
};

export default function PublicEventList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [interestedEvents, setInterestedEvents] = useState<Set<string>>(new Set());
  const [selectedClub, setSelectedClub] = useState<string>("All");
  const [clubNames, setClubNames] = useState<string[]>([]);


  useEffect(() => {
  const fetchEvents = async () => {
    try {
      const clubsSnapshot = await getDocs(collection(db, "clubs"));
      let allEvents: any[] = [];
      const clubSet = new Set<string>();

      for (const clubDoc of clubsSnapshot.docs) {
        const clubId = clubDoc.id;
        const clubName = clubDoc.data().name || "Unnamed Club";
        clubSet.add(clubName);

        const eventsRef = collection(db, `clubs/${clubId}/events`);
        const eventsSnap = await getDocs(eventsRef);

        const eventsData = eventsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          clubName: clubName,
          icon: ICON_MAP[(doc.data().icon as string) || "Sparkles"] || Sparkles,
        }));

        allEvents = [...allEvents, ...eventsData];
      }

      setClubNames(["All", ...Array.from(clubSet).sort()]);
      setEvents(allEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchEvents();
}, []);


  // Handler for marking interest
  const handleInterested = (eventId: string) => {
    setInterestedEvents((prev) => {
      const updated = new Set(prev);
      if (updated.has(eventId)) {
        updated.delete(eventId);
      } else {
        updated.add(eventId);
      }
      return updated;
    });
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

  if (events.length === 0) {
    return (


      <div className="relative overflow-hidden ">
        <Navbar/>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl"></div>
        <div className="relative p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Calendar className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Events Yet</h3>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Stay tuned! Exciting club events are coming your way soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="m-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-700/30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-2xl">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Events
              </h1>
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg">
                Discover amazing experiences from clubs around campus
              </p>
            </div>
          </div>
          {/* Background decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-blue-500/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-purple-500/20 rounded-full blur-2xl"></div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex justify-end mb-4">
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-white px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {clubNames.map((club) => (
              <option key={club} value={club}>
                {club}
              </option>
            ))}
          </select>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
          {events
                  .filter((event) => selectedClub === "All" || event.clubName === selectedClub)
                  .map((event, index) => {
            const IconComponent = event.icon;
            return (
              <div
                key={event.id}
                className="group relative bg-slate-800/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-3 border border-slate-700/50 flex flex-col"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Card glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${event.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative p-5 sm:p-6 lg:p-8 flex flex-col flex-1">
                  {/* Event badges */}
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex gap-2">
                    {event.featured && (
                      <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                        <span className="text-xs font-bold text-yellow-400 tracking-wide">FEATURED</span>
                      </div>
                    )}
                    <div className={`px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r ${event.gradient} rounded-full shadow-lg`}>
                      <span className="text-xs font-bold text-white tracking-wide">UPCOMING</span>
                    </div>
                  </div>

                  {/* Event icon and title */}
                  <div className="flex items-start gap-4 mb-5 sm:mb-6 pr-16 sm:pr-24">
                    <div className={`p-3 bg-gradient-to-r ${event.gradient} rounded-xl shadow-lg flex-shrink-0`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-blue-300 transition-colors duration-300 leading-tight">
                        {event.title}
                      </h3>
                      <div className="px-2 py-1 bg-slate-700/50 rounded-md text-xs text-slate-300 inline-block mb-3">
                        {event.category}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 flex-1">
                    {event.description}
                  </p>

                  {/* Event details */}
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                        <Calendar className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-sm font-medium truncate">
                        {new Date(event.date?.seconds * 1000).toLocaleString()
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg flex-shrink-0">
                        <Clock className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-sm font-medium truncate">{event.time}</span>
                    </div>

                  

                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="p-1.5 sm:p-2 bg-orange-500/20 rounded-lg flex-shrink-0">
                        <Users className="w-4 h-4 text-orange-400" />
                      </div>
                      <span className="text-sm font-medium">{event.attendees} interested</span>
                    </div>
                  </div>

                  {/* Club info and actions */}
                  <div className="flex flex-col gap-4 pt-4 sm:pt-6 border-t border-slate-700/50 mt-auto">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${event.gradient} rounded-full flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Hosted by</p>
                        <p className="text-sm font-bold text-slate-200 truncate">{event.clubName}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleInterested(event.id)}
                        className={`flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 transform ${
                          interestedEvents.has(event.id)
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                        }`}
                      >
                        {interestedEvents.has(event.id) ? '✓ Interested' : 'Mark Interested'}
                      </button>
                      
                      <button className={`px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r ${event.gradient} hover:opacity-90 text-white text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 transform whitespace-nowrap flex items-center gap-2`}>
                        Learn More
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Animated border */}
                <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r ${event.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-sm transform scale-105`}></div>
              </div>
            );
          })}
        </div>

        {/* Load More Section */}
        <div className="text-center p-8 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30">
          <h3 className="text-xl font-semibold text-white mb-2">Looking for more events?</h3>
          <p className="text-slate-400 mb-4">Explore events from all clubs and discover new communities</p>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            View All Events
          </button>
        </div>

        {/* Bottom spacing */}
        <div className="h-8 sm:h-12"></div>
      </div>
    </div>
  );
}