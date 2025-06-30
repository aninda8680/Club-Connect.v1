import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { Users, Star, Plus, ArrowRight } from "lucide-react"; // <-- Add your icon library here

export default function ClubList() {
  const [clubs, setClubs] = useState<any[]>([]);
  const { user } = useAuth();
  const [role, setRole] = useState(""); // For conditional button
  const [hoveredClub, setHoveredClub] = useState<string | null>(null); // <-- Added
  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(new Set()); // <-- Added

  useEffect(() => {
    const fetchClubs = async () => {
      const snapshot = await getDocs(collection(db, "clubs"));
      const clubsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClubs(clubsList);
    };

    const fetchUserRole = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) setRole(userDoc.data().role);
    };

    // Fetch clubs the user has already requested to join
    const fetchJoinedClubs = async () => {
      if (!user) return;
      const joinRequestsSnapshot = await getDocs(collection(db, "clubs"));
      const joined = new Set<string>();
      for (const clubDoc of joinRequestsSnapshot.docs) {
        const joinReqRef = doc(db, "clubs", clubDoc.id, "joinRequests", user.uid);
        const joinReqSnap = await getDoc(joinReqRef);
        if (joinReqSnap.exists()) {
          joined.add(clubDoc.id);
        }
      }
      setJoinedClubs(joined);
    };

    fetchClubs();
    fetchUserRole();
    fetchJoinedClubs();
  }, [user]);

  const handleJoinRequest = async (clubId: string) => {
    try {
      const joinRef = doc(db, "clubs", clubId, "joinRequests", user!.uid);
      await setDoc(joinRef, {
        email: user!.email,
        displayName: user!.displayName || "",
        status: "pending",
        requestedAt: new Date(),
      });
      setJoinedClubs((prev) => new Set(prev).add(clubId));
      alert("✅ Request sent");
    } catch (error) {
      console.error("❌ Error sending join request:", error);
      alert("Failed to send request.");
    }
  };

  return (
    <div className=" h-screen p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Explore Clubs
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover communities that match your interests and connect with like-minded individuals
          </p>
        </div>

        {/* Featured Clubs Badge */}
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
          <span className="text-yellow-400 font-semibold">Featured Communities</span>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clubs.map((club) => (
            <div
              key={club.id}
              className={`group relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl ${
                hoveredClub === club.id ? 'shadow-2xl' : 'shadow-lg'
              }`}
              onMouseEnter={() => setHoveredClub(club.id)}
              onMouseLeave={() => setHoveredClub(null)}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${club.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
              
              {/* Glass Effect Background */}
              <div className="relative bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 p-6 h-full">
                {/* Featured Badge */}
                {club.featured && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-1 text-xs font-semibold text-yellow-400">
                      Featured
                    </div>
                  </div>
                )}

                {/* Club Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                      {club.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{club.members} members</span>
                      </div>
                      <div className="px-2 py-1 bg-slate-700 rounded-md text-xs">
                        {club.category}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-300 leading-relaxed mb-6 text-sm">
                  {club.description}
                </p>

                {/* Action Button */}
                {role !== "admin" && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleJoinRequest(club.id)}
                      disabled={joinedClubs.has(club.id)}
                      className={`group/btn relative overflow-hidden px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                        joinedClubs.has(club.id)
                          ? 'bg-green-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {joinedClubs.has(club.id) ? (
                          <>
                            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                              <div className="w-2 h-2 bg-green-600 rounded-full" />
                            </div>
                            <span>Request Sent!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300" />
                            <span>Request to Join</span>
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                          </>
                        )}
                      </div>
                      
                      {/* Button hover effect */}
                      {!joinedClubs.has(club.id) && (
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Subtle border glow on hover */}
              <div className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r ${club.color} opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10`} />
            </div>
          ))}
        </div>

        
      </div>
    </div>
  );
}