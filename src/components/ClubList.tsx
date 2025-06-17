import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

export default function ClubList() {
  const [clubs, setClubs] = useState<any[]>([]);
  const { user } = useAuth();
  const [role, setRole] = useState(""); // For conditional button

  useEffect(() => {
    const fetchClubs = async () => {
      const snapshot = await getDocs(collection(db, "clubs"));
      const clubsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClubs(clubsList);
    };

    const fetchUserRole = async () => {
      const snap = await getDocs(collection(db, "users"));
      const userDoc = snap.docs.find((doc) => doc.id === user?.uid);
      if (userDoc) setRole(userDoc.data().role);
    };

    fetchClubs();
    fetchUserRole();
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
    alert("✅ Request sent");
  } catch (error) {
    console.error("❌ Error sending join request:", error);
    alert("Failed to send request.");
  }
};


  return (
    <div className="mt-8 p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">📚 Explore Clubs</h2>
      {clubs.map((club) => (
        <div key={club.id} className="mb-4 p-3 border border-gray-600 rounded">
          <h3 className="text-lg font-semibold">{club.name}</h3>
          <p className="text-sm text-gray-300 mb-2">{club.description}</p>

          {role !== "admin" && (
            <button
              onClick={() => handleJoinRequest(club.id)}
              className="bg-green-600 px-4 py-1 rounded hover:bg-green-700"
            >
              🙋 Request to Join
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
