// src/pages/LandingPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      // Always fetch clubs for guests too
      const clubSnap = await getDocs(collection(db, "clubs"));
      const clubList = clubSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClubs(clubList);

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
                className="bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-cyan-500/20 transition"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-xl font-bold mb-2">{club.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{club.description}</p>
                <button
                  onClick={() => handleJoin(club.id)}
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
    </div>
  );
}
