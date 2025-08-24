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
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // ✅ using shadcn/ui Input
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ClubMembers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubId, setClubId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  // fetch club id
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "clubs"),
      where("coordinatorId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) setClubId(snap.docs[0].id);
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

  const handleRemove = async (id: string) => {
    if (!clubId) return;
    try {
      await deleteDoc(doc(db, "clubs", clubId, "members", id));
      toast.success("Member removed");
    } catch {
      toast.error("Error removing member");
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

  return (
    <div className="min-h-screen bg-black p-6 md:p-10">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4 mb-8"
      >
        <Button
          variant="outline"
          onClick={() => navigate("/coordinator-member")}
          className="flex items-center gap-2 shadow-md hover:shadow-lg transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-white">
          Active Club Members
        </h1>
      </motion.div>

      {/* Filter/Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center gap-2"
      >
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          placeholder="Search by name or email or stream or course...."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md"
        />
      </motion.div>

      {/* Members Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-black backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-gray-200"
      >
        {filteredMembers.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No members found.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredMembers.map((m, index) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex justify-between items-center p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border shadow-sm hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">{m.name}</p>
                  <p className="text-sm text-gray-500">{m.email}</p>
                  <p className="text-slate-400 text-sm mb-1">Stream: {m.stream}</p>
                  <p className="text-slate-400 text-sm mb-4">Course: {m.course}</p>
                </div>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={() => handleRemove(m.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
