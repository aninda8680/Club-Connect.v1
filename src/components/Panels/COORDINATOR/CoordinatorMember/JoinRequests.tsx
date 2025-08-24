import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, setDoc, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useAuth } from "../../../../AuthContext";
import { motion } from "framer-motion";
import { UserPlus, Check, X, Terminal, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface JoinRequest {
  id: string;
  name: string;
  email: string;
  status: string;
  requestedAt: any;
  stream?: string;
  course?: string;
}

const ScrollAnimationWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

export default function JoinRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [clubId, setClubId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // First, find the club where the user is a coordinator
  useEffect(() => {
    const fetchClubId = async () => {
      if (!user) return;
      
      try {
        const clubsRef = collection(db, "clubs");
        const q = query(clubsRef, where("coordinatorId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const clubDoc = querySnapshot.docs[0];
          setClubId(clubDoc.id);
          console.log("Found club:", clubDoc.id);
        } else {
          console.log("No club found for coordinator:", user.uid);
        }
      } catch (error) {
        console.error("Error fetching club:", error);
      }
    };

    fetchClubId();
  }, [user]);

  // Then, fetch join requests for that club
  useEffect(() => {
    if (!clubId) return;
  
    setLoading(true);
    const joinRequestsRef = collection(db, "clubs", clubId, "joinRequests");
  
    const unsubscribe = onSnapshot(
      joinRequestsRef,
      (snapshot) => {
        const requestsList = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as JoinRequest[];
        setRequests(requestsList);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to requests:", error);
        toast.error("Failed to fetch join requests");
        setLoading(false);
      }
    );
  
    // Clean up listener when component unmounts or clubId changes
    return () => unsubscribe();
  }, [clubId]);

  const handleApprove = async (req: JoinRequest) => {
    if (!clubId) return;
    try {
      await setDoc(doc(db, "clubs", clubId, "members", req.id), {
        name: req.name,
        email: req.email,
        stream: req.stream,
        course: req.course,
        joinedAt: new Date(),
      });
      await deleteDoc(doc(db, "clubs", clubId, "joinRequests", req.id));
  
      // ❌ remove setRequests here, realtime listener will update
      toast.success("Member request accepted successfully!");
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    }
  };
  
  const handleReject = async (id: string) => {
    if (!clubId) return;
    try {
      await deleteDoc(doc(db, "clubs", clubId, "joinRequests", id));
      // ❌ remove setRequests here, realtime listener will update
      toast.success("Request rejected");
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };
  

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading join requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] 
        bg-[size:4rem_4rem] 
        [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] 
        opacity-20 pointer-events-none" 
      />

      <main className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <ScrollAnimationWrapper>
            <div className="mb-16 flex items-center gap-6">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.05 }}
                className="relative p-4 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl border border-indigo-500/30 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-2xl blur-xl" />
                <Terminal className="relative w-10 h-10 text-indigo-400" />
              </motion.div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Join Requests
                </h1>
                <p className="text-slate-400 text-lg mt-2 flex items-center gap-2">
                  <span className="text-indigo-400 font-mono">$</span>
                  <span>Review and approve new members</span>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-indigo-400 rounded-full"
                  />
                </p>
              </div>
            </div>
          </ScrollAnimationWrapper>

          {/* Back Button */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate("/coordinator-member")}
              className="flex items-center gap-2 bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-700/50"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Member Management
            </Button>
          </div>

          {/* Cards for requests */}
          <ScrollAnimationWrapper>
            {requests.length === 0 ? (
              <p className="text-slate-500 text-center mt-20">
                No pending join requests 🚀
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {requests.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative p-6 bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-sm border border-indigo-500/30 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg border bg-black/20">
                          <UserPlus className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">{req.name}</h3>
                      <p className="text-slate-400 text-sm mb-4">{req.email}</p>
                      <p className="text-slate-400 text-sm mb-1">Stream: {req.stream}</p>
                      <p className="text-slate-400 text-sm mb-4">Course: {req.course}</p>

                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(req)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(req.id)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollAnimationWrapper>
        </div>
      </main>
    </div>
  );
}
