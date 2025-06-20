import { useEffect, useState } from "react";
import { collection, getDocs, query, where, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminPanel() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [clubName, setClubName] = useState("");
  const [selectedLeader, setSelectedLeader] = useState("");

  useEffect(() => {
  const fetchLeaders = async () => {
    const q = query(collection(db, "users"), where("role", "==", "leader"));
    const querySnapshot = await getDocs(q);
    const leadersData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLeaders(leadersData);
  };

  fetchLeaders();
}, []);

  const handleCreateClub = async () => {
    if (!clubName || !selectedLeader) return alert("Fill all fields");

    try {
      await addDoc(collection(db, "clubs"), {
        name: clubName,
        description: "",
        createdAt: Timestamp.now(),
        leaderId: selectedLeader,
      });
      setClubName("");
      setSelectedLeader("");
      alert("Club created!");
    } catch (err) {
      console.error("Error creating club:", err);
    }
  };

  return (
    <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Create a New Club</h2>
      <input
        type="text"
        placeholder="Club Name"
        value={clubName}
        onChange={(e) => setClubName(e.target.value)}
        className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
      />
      <select
  value={selectedLeader}
  onChange={(e) => setSelectedLeader(e.target.value)}
  className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
>
  <option value="">-- Select Leader --</option>
  {leaders.map((leader) => (
    <option key={leader.id} value={leader.id}>
      {leader.displayName || leader.name || leader.email}
    </option>
  ))}
</select>

      <button
        onClick={handleCreateClub}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Create Club
      </button>
    </div>
  );
}
