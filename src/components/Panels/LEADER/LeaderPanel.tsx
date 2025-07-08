import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../AuthContext";

export default function LeaderPanel() {
  const { user } = useAuth();
  const [clubName, setClubName] = useState("");

  useEffect(() => {
    const fetchClub = async () => {
      if (user) {
        const q = query(collection(db, "clubs"), where("leaderId", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const clubDoc = snap.docs[0];
          setClubName(clubDoc.data().name);
        }
      }
    };
    fetchClub();
  }, [user]);

  return (
    <div className=" max-h-screen mt-6 bg-gray-800 p-6 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-4">🏠 Leader Dashboard</h2>
      {clubName ? (
        <p className="text-lg">
          You are managing: <span className="font-semibold text-green-400">{clubName}</span>
        </p>
      ) : (
        <p className="text-yellow-400">No club assigned to you yet.</p>
      )}
      <p className="mt-4 text-sm text-gray-300">
        Use the <span className="font-medium text-yellow-300">"Members"</span> tab to manage join requests and members.
      </p>
    </div>
  );
}