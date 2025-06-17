import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

export default function MemberPanel() {
  const { user } = useAuth();
  const [clubName, setClubName] = useState<string | null>(null);

  useEffect(() => {
    const fetchClubName = async () => {
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const clubId = userData?.clubId;

      if (clubId) {
        const clubDoc = await getDoc(doc(db, "clubs", clubId));
        setClubName(clubDoc.data()?.name || null);
      }
    };

    fetchClubName();
  }, [user]);

  return (
    <div className="p-6 mt-4 bg-gray-800 rounded-lg">
      <h2 className="text-white text-xl font-bold">
        {clubName
          ? `🎉 Welcome to the club: ${clubName}`
          : "You are not in any club yet."}
      </h2>
    </div>
  );
}
