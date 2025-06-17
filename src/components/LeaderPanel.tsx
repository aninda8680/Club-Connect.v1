import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

export default function LeaderPanel() {
  const { user } = useAuth();
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [clubId, setClubId] = useState<string | null>(null);

  // Step 1: Get the leader's club
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

  // Step 2: Load join requests for that club
  useEffect(() => {
    const fetchRequests = async () => {
      if (clubId) {
        const q = collection(db, `clubs/${clubId}/joinRequests`);
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJoinRequests(data);
      }
    };
    fetchRequests();
  }, [clubId]);

  const handleAccept = async (userId: string) => {
  console.log("Accept clicked for:", userId); // ✅ Add this
  try {
    await setDoc(doc(db, "users", userId), { role: "member", clubId: clubId}, { merge: true });
    await setDoc(doc(db, `clubs/${clubId}/members`, userId), {joinedAt: new Date(),
    });
    await deleteDoc(doc(db, `clubs/${clubId}/joinRequests/${userId}`));
    setJoinRequests(joinRequests.filter(req => req.id !== userId));
    alert("User accepted!");
  } catch (error) {
    console.error("Error accepting user:", error);
  }
};


  const handleReject = async (userId: string) => {
    try {
      await deleteDoc(doc(db, `clubs/${clubId}/joinRequests/${userId}`));
      setJoinRequests(joinRequests.filter(req => req.id !== userId));
      alert("User rejected.");
    } catch (error) {
      console.error("Error rejecting user:", error);
    }
  };

  if (!clubId) return <p className="text-yellow-300">Loading your club data...</p>;
  if (joinRequests.length === 0) return <p>No join requests yet.</p>;

  return (
    <div className="mt-6 bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Join Requests</h2>
      {joinRequests.map((req) => (
  <div key={req.id} className="flex justify-between items-center bg-gray-700 p-3 rounded mb-2">
    <div>
      <p className="text-white font-semibold">
        {req.displayName || req.name || req.email || req.id}
      </p>
    </div>
    <div>
      <button
        onClick={() => handleAccept(req.id)}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mr-2"
      >
        Accept
      </button>
      <button
        onClick={() => handleReject(req.id)}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
      >
        Reject
      </button>
    </div>
  </div>
))}

    </div>
  );
}
