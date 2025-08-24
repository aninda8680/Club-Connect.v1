"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import { Star } from "lucide-react";
import { ClubCard } from "../../ClubCard";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function PublicPanel() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [hoveredClub, setHoveredClub] = useState<string | null>(null);
  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(new Set());
  const [role, setRole] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchAll = async () => {
      if (!user) return;

      const [clubSnap, userSnap] = await Promise.all([
        getDocs(collection(db, "clubs")),
        getDoc(doc(db, "users", user.uid)),
      ]);

      const clubList = clubSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClubs(clubList);

      if (userSnap.exists()) setRole(userSnap.data().role);

      const joined = new Set<string>();
      for (const c of clubSnap.docs) {
        const reqRef = doc(db, "clubs", c.id, "joinRequests", user.uid);
        const reqSnap = await getDoc(reqRef);
        if (reqSnap.exists()) joined.add(c.id);
      }
      setJoinedClubs(joined);
    };

    fetchAll();
  }, [user]);

  const handleJoinRequest = async (clubId: string) => {
    if (!user) return;
    
    try {
      const ref = doc(db, "clubs", clubId, "joinRequests", user.uid);
      await setDoc(ref, {
        name: user.displayName,
        email: user.email,
        stream: user.stream,  
        course: user.course,  
        status: "pending",
        requestedAt: new Date(),
      });
      
      
      // Update local state
      setJoinedClubs((prev) => {
        const newSet = new Set(prev);
        newSet.add(clubId);
        console.log("Updated joinedClubs:", Array.from(newSet));
        return newSet;
      });
      
      // Show success message
      toast.success("Join request sent successfully!");
    } catch (error) {
      console.error("Error sending join request:", error);
      toast.error("Failed to send join request. Please try again.");
    }
  };

  return (
    <div className="snap-y snap-mandatory h-screen w-screen overflow-y-scroll overflow-x-hidden bg-black text-white">
      


      {/* Section 1: Hero Intro */}
      <section className="snap-start h-screen w-full flex flex-col items-center justify-center px-4 md:px-8 text-center space-y-4">
        <motion.h1
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Welcome to Club-Connect ⚡
        </motion.h1>
        <motion.p
          className="text-gray-400 text-lg max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          A coder-first club management platform. Join, build, collaborate.
        </motion.p>
      </section>

      {/* Section 2: Club Listing */}
      <section className="snap-start h-screen w-full flex items-center justify-center px-4 md:px-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-yellow-400 font-semibold">Featured Clubs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {clubs.map((club) => {
              const isJoined = joinedClubs.has(club.id);
              console.log(`Club ${club.name}: isJoined = ${isJoined}`);
              return (
                <ClubCard
                  key={club.id}
                  club={club}
                  isJoined={isJoined}
                  onJoin={handleJoinRequest}
                  role={role}
                  hovered={hoveredClub}
                  setHovered={setHoveredClub}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Why Join Clubs */}
      <section className="snap-start h-screen w-full flex flex-col items-center justify-center text-center px-4 md:px-8 space-y-6">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
          Why Join a Club?
        </h2>
        <p className="text-gray-400 max-w-xl">
          Clubs help you grow beyond academics — improve Coordinatorship, communication, and real-world project skills.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mt-6">
          <div className="bg-[#1e1e2e] p-6 rounded-xl border border-[#2d2d3d]">🤝 Network with peers</div>
          <div className="bg-[#1e1e2e] p-6 rounded-xl border border-[#2d2d3d]">🚀 Boost your portfolio</div>
          <div className="bg-[#1e1e2e] p-6 rounded-xl border border-[#2d2d3d]">🎯 Learn Coordinatorship</div>
          <div className="bg-[#1e1e2e] p-6 rounded-xl border border-[#2d2d3d]">💡 Build cool things</div>
        </div>
      </section>

      {/* Section 4: Testimonials */}
      <section className="snap-start h-screen w-full flex flex-col items-center justify-center text-center px-4 md:px-8 space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          What Members Say
        </h2>
        <blockquote className="text-gray-300 italic max-w-xl">
          “Being in the Robotics Club changed how I approach tech — real teamwork, real impact.”
        </blockquote>
        <p className="text-sm text-gray-500">— Arjun, 2nd Year ECE</p>
      </section>
    </div>
  );
}
