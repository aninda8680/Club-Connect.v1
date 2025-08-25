// src/components/CoordinatorMember/ClubMembers.tsx
import { useState, useEffect } from "react";
import { db } from "../../../../firebase";
import { useAuth } from "../../../../AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, Trash2, Search, Users, Mail, GraduationCap, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ClubMembers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubId, setClubId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // fetch club id
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "clubs"),
      where("coordinatorId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) setClubId(snap.docs[0].id);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // fetch members
  useEffect(() => {
    if (!clubId) return;
    const q = query(collection(db, "clubs", clubId, "members"));
    const unsub = onSnapshot(q, (snap) => {
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [clubId]);

  const handleRemove = async (id: string, memberName: string) => {
    setRemovingId(id);
    if (!clubId) return;
    try {
      await deleteDoc(doc(db, "clubs", clubId, "members", id));
      toast.success(`${memberName} removed successfully`);
    } catch {
      toast.error("Error removing member");
    } finally {
      setRemovingId(null);
    }
  };

  // filter members
  const filteredMembers = members.filter(
    (m) =>
      m.name?.toLowerCase().includes(filter.toLowerCase()) ||
      m.email?.toLowerCase().includes(filter.toLowerCase()) ||
      m.stream?.toLowerCase().includes(filter.toLowerCase()) ||
      m.course?.toLowerCase().includes(filter.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants ={
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring", 
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-black to-indigo-100">
      <div className="fixed top-30 left-20 z-50">
      <Button
                variant="outline"
                onClick={() => navigate("/coordinator-member")}
                className="flex items-center gap-2 bg-white backdrop-blur-sm border-slate-200 hover:bg-white transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Club Members
                  </h1>
                  <p className="text-slate-100 mt-1">Manage your active members</p>
                </div>
              </div>
            </div>
            
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredMembers.length}</div>
                <div className="text-sm text-slate-600">Active Members</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-700">Search Members</span>
            </div>
            <Input
              placeholder="Search by name, email, stream, or course..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300"
            />
        </motion.div>

        {/* Members Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filteredMembers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-white/50"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-slate-100 rounded-full">
                    <AlertCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-700 mb-2">
                      {filter ? "No members match your search" : "No members found"}
                    </h3>
                    <p className="text-slate-500">
                      {filter ? "Try adjusting your search terms" : "Members will appear here once they join your club"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    variants={itemVariants}
                    layout
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-5">
                      {/* Avatar and Name */}
                      <div className="flex flex-col items-center text-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg mb-3">
                          {member.name?.charAt(0)?.toUpperCase() || 'M'}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {member.name || 'Unknown Member'}
                        </h3>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-2 text-slate-600">
                          <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                          <span className="text-sm break-all">{member.email || 'No email provided'}</span>
                        </div>
                        
                        <div className="flex items-start gap-2 text-slate-600">
                          <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                          <span className="text-sm">
                            <span className="font-medium">Stream:</span> {member.stream || 'Not specified'}
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-2 text-slate-600">
                          <GraduationCap className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-500" />
                          <span className="text-sm">
                            <span className="font-medium">Course:</span> {member.course || 'Not specified'}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemove(member.id, member.name)}
                        disabled={removingId === member.id}
                        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {removingId === member.id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        {removingId === member.id ? 'Removing...' : 'Remove'}
                      </Button>
                    </div>
                    
                    {/* Hover Effect Gradient */}
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Stats */}
        {filteredMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-slate-600 border border-white/50">
              <Users className="w-4 h-4" />
              Showing {filteredMembers.length} of {members.length} members
              {filter && ` matching "${filter}"`}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}