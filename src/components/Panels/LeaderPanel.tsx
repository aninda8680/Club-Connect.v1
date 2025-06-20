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
import { db } from "../../firebase";
import { useAuth } from "../../AuthContext";

export default function LeaderPanel() {
  const { user } = useAuth();
  const [clubId, setClubId] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  // Step 1: Find leader's club
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

  // Step 2: Load join requests
  useEffect(() => {
    const fetchJoinRequests = async () => {
      if (!clubId) return;
      const q = collection(db, `clubs/${clubId}/joinRequests`);
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJoinRequests(data);
    };
    fetchJoinRequests();
  }, [clubId]);

  // Step 3: Load members
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

  const handleAccept = async (userId: string, name: string, email: string) => {
    try {
      await setDoc(doc(db, "users", userId), { role: "member" }, { merge: true });
      await setDoc(doc(db, `clubs/${clubId}/members/${userId}`), {
        name : name,
        email : email,
        joinedAt: Timestamp.now(),
      });
      await deleteDoc(doc(db, `clubs/${clubId}/joinRequests/${userId}`));
      setJoinRequests((prev) => prev.filter((r) => r.id !== userId));
      setMembers((prev) => [...prev, { id: userId, name, email }]);
      alert("✅ User accepted");
    } catch (err) {
      console.error("❌ Failed to accept user:", err);
      alert("Failed to accept user.");
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await deleteDoc(doc(db, `clubs/${clubId}/joinRequests/${userId}`));
      setJoinRequests((prev) => prev.filter((r) => r.id !== userId));
      alert("User rejected.");
    } catch (err) {
      console.error("❌ Failed to reject user:", err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await deleteDoc(doc(db, `clubs/${clubId}/members/${userId}`));
      await setDoc(doc(db, `users/${userId}`), { role: "visitor" }, { merge: true });
      setMembers((prev) => prev.filter((m) => m.id !== userId));
      alert("❌ Member removed");
    } catch (err) {
      console.error("❌ Failed to remove member:", err);
    }
  };

  return (
    <div className="mt-6 bg-gray-800 p-6 rounded-lg text-white">
      <h2 className="text-xl font-bold mb-4">Join Requests</h2>
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

      <h2 className="text-xl font-bold mt-8 mb-4">Club Members</h2>
      {members.length === 0 ? (
        <p>No members yet.</p>
      ) : (
        members.map((member) => (
          <div
            key={member.id}
            className="flex justify-between items-center bg-gray-700 p-3 rounded mb-2"
          >
            <p>
              {member.name || member.email} 
            
                
             
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
  );
}
