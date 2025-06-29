import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../AuthContext";
import Navbar from "../../Navbar";
import toast from "react-hot-toast"; 


export default function LeaderMember() {
  const { user } = useAuth();
  const [clubId, setClubId] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  // Fetch the leader's club ID
  useEffect(() => {
    const fetchClub = async () => {
      if (user) {
        const q = query(collection(db, "clubs"), where("leaderId", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const clubDoc = snap.docs[0];
          setClubId(clubDoc.id);
        }
      }
    };
    fetchClub();
  }, [user]);

  // Load join requests
  useEffect(() => {
    const fetchJoinRequests = async () => {
      if (!clubId) return;
      const snap = await getDocs(collection(db, `clubs/${clubId}/joinRequests`));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJoinRequests(data);
    };
    fetchJoinRequests();
  }, [clubId]);

  // Load club members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!clubId) return;
      const snap = await getDocs(collection(db, `clubs/${clubId}/members`));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(data);
    };
    fetchMembers();
  }, [clubId]);

  // Accept a user
  const handleAccept = async (userId: string, name: string, email: string) => {
    try {
      await setDoc(doc(db, "users", userId), { role: "member" }, { merge: true });
      await setDoc(doc(db, `clubs/${clubId}/members/${userId}`), {
        name,
        email,
        joinedAt: Timestamp.now(),
      });
      await deleteDoc(doc(db, `clubs/${clubId}/joinRequests/${userId}`));
      setJoinRequests((prev) => prev.filter((r) => r.id !== userId));
      setMembers((prev) => [...prev, { id: userId, name, email }]);
      toast.success("✅ User accepted");
    } catch (err) {
      console.error("❌ Failed to accept user:", err);
      toast.error("Failed to accept user.");
    }
  };

  // Reject a user
  const handleReject = async (userId: string) => {
    try {
      await deleteDoc(doc(db, `clubs/${clubId}/joinRequests/${userId}`));
      setJoinRequests((prev) => prev.filter((r) => r.id !== userId));
      toast.success("❌ User rejected");
    } catch (err) {
      console.error("❌ Failed to reject user:", err);
      toast.error("Failed to accept user.")
    }
  };

  // Remove a member
  const handleRemoveMember = async (userId: string) => {
    try {
      await deleteDoc(doc(db, `clubs/${clubId}/members/${userId}`));
      await setDoc(doc(db, `users/${userId}`), { role: "visitor" }, { merge: true });
      setMembers((prev) => prev.filter((m) => m.id !== userId));
      toast.success(" Member removed");
    } catch (err) {
      console.error("❌ Failed to remove member:", err);
      toast.error("Failed to remove member.");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6 lg:p-8">
        <Navbar/>
        <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold mb-6">Join Requests</h2>
      {joinRequests.length === 0 ? (
        <p>No join requests.</p>
      ) : (
        joinRequests.map((req) => (
          <div
            key={req.id}
            className="flex justify-between items-center bg-gray-700 p-3 rounded mb-2"
          >
            <p>{req.name || req.displayName || req.email || req.id}</p>
            <div>
              <button
                onClick={() =>
                  handleAccept(
                    req.id,
                    req.name || req.displayName || req.email || req.id,
                    req.email || ""
                  )
                }
                className="bg-green-600 px-3 py-1 rounded mr-2"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(req.id)}
                className="bg-red-600 px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
            
          </div>
        ))
      )}

      <h2 className="text-2xl font-bold mt-8 mb-6">Club Members</h2>
      {members.length === 0 ? (
        <p>No members yet.</p>
      ) : (
        members.map((member) => (
          <div
            key={member.id}
            className="flex justify-between items-center bg-gray-700 p-3 rounded mb-2"
          >
            <p>
              {member.name || member.email} (
              {member.joinedAt?.toDate().toLocaleDateString()})
            </p>
            <button
              onClick={() => handleRemoveMember(member.id)}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Remove
            </button>
          </div>
        ))
      )}
      </div>
    </div>
  );
}
