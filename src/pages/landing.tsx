// src/pages/LandingPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(new Set());
  const [interestedEvents, setInterestedEvents] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      // Always fetch clubs for guests too
      const clubSnap = await getDocs(collection(db, "clubs"));
      const clubList = clubSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClubs(clubList);

      // Fetch events from all clubs
      let allEvents: any[] = [];
      for (const clubDoc of clubSnap.docs) {
        const clubId = clubDoc.id;
        const clubName = clubDoc.data().name || "Unnamed Club";
        
        const eventsRef = collection(db, `clubs/${clubId}/events`);
        const eventsSnap = await getDocs(eventsRef);
        
        const eventsData = eventsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          clubName: clubName,
          clubId: clubId,
        }));
        
        allEvents = [...allEvents, ...eventsData];
      }
      setEvents(allEvents);

      // Only fetch role & joined status if logged in
      if (user) {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) setRole(userSnap.data().role);

        const joined = new Set<string>();
        for (const c of clubSnap.docs) {
          const reqRef = doc(db, "clubs", c.id, "joinRequests", user.uid);
          const reqSnap = await getDoc(reqRef);
          if (reqSnap.exists()) joined.add(c.id);
        }
        setJoinedClubs(joined);
      }
    };

    fetchAll();
  }, [user]);

  const handleJoin = (clubId: string) => {
    if (!user) {
      // Redirect guests to auth page
      navigate("/auth");
    } else {
      // TODO: Send join request logic here
      console.log(`Send join request for club: ${clubId}`);
    }
  };

  const handleInterested = (eventId: string) => {
    if (!user) {
      // Redirect guests to auth page
      navigate("/auth");
    } else {
      setInterestedEvents((prev) => {
        const updated = new Set(prev);
        if (updated.has(eventId)) {
          updated.delete(eventId);
        } else {
          updated.add(eventId);
        }
        return updated;
      });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "Date TBD";
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
    return "Date TBD";
  };

  return (
    <div className="bg-black text-white h-screen w-full snap-y snap-mandatory overflow-x-hidden">
      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center snap-start text-center px-6">
        <motion.h1
          className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to Club-Connect ⚡
        </motion.h1>
        <motion.p
          className="text-lg text-gray-300 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          A coder-first club management platform to connect leaders, members, and visitors seamlessly.
        </motion.p>
        <motion.button
          className="relative mt-6 px-8 py-3 rounded-full text-lg font-semibold bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/50"
          onClick={() => navigate("/auth")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🚀 Login & Get Started
        </motion.button>
      </section>

      {/* Featured Clubs */}
      <section className="min-h-screen px-8 py-12 snap-start">
        <h2 className="text-3xl font-bold mb-8">🌟 Featured Clubs</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clubs.length === 0 ? (
            <p className="text-gray-400">No clubs available right now.</p>
          ) : (
            clubs.map((club) => (
              <motion.div
                key={club.id}
                className={`bg-gray-900 rounded-xl p-6 shadow-lg transition cursor-pointer ${
                  club.name === "Cy-Coders" 
                    ? "hover:shadow-cyan-500/30 hover:scale-105 border border-transparent hover:border-cyan-500/50" 
                    : "hover:shadow-cyan-500/20"
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => {
                  // Navigate to specific club page based on club name
                  if (club.name === "Cy-Coders") {
                    navigate("/clubs/cy-coders");
                  } else {
                    // For other clubs, you can add more specific routes later
                    navigate("/clubs-created");
                  }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{club.name}</h3>
                  {club.name === "Cy-Coders" && (
                    <span className="text-xs bg-cyan-600 text-white px-2 py-1 rounded-full">
                      🚀 Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-4">{club.description}</p>
                {club.name === "Cy-Coders" && (
                  <p className="text-xs text-cyan-400 mb-3 flex items-center gap-1">
                    <span>👆 Click to explore</span>
                  </p>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click when button is clicked
                    handleJoin(club.id);
                  }}
                  className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 transition"
                >
                  {user
                    ? joinedClubs.has(club.id)
                      ? "✅ Joined"
                      : "➕ Join"
                    : "🔑 Join"}
                </button>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Featured Events */}
      <section className="min-h-screen px-8 py-12 snap-start">
        <h2 className="text-center text-3xl font-bold mb-8">🎉 Upcoming Events</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.length === 0 ? (
            <p className="text-gray-400">No events available right now.</p>
          ) : (
            events.map((event) => (
              <motion.div
                key={event.id}
                className="bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-fuchsia-500/20 transition"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-fuchsia-600 text-white text-xs rounded-full">
                    {event.clubName}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                <div className="text-sm text-gray-300 mb-4">
                  <p>📅 {formatDate(event.date)}</p>
                  {event.location && <p>📍 {event.location}</p>}
                </div>
                <button
                  onClick={() => handleInterested(event.id)}
                  className="px-4 py-2 bg-fuchsia-600 rounded-lg hover:bg-fuchsia-500 transition"
                >
                  {user
                    ? interestedEvents.has(event.id)
                      ? "✅ Interested"
                      : "🎯 Mark Interested"
                    : "🔑 Mark Interested"}
                </button>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
