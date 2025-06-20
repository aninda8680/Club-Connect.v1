import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../AuthContext";

export default function MemberPanel() {
  const { user } = useAuth();
  const [clubName, setClubName] = useState<string | null>(null);

  useEffect(() => {
    const checkMembership = async () => {
      if (!user) return;

      try {
        const clubsSnapshot = await getDocs(collection(db, "clubs"));

        for (const clubDoc of clubsSnapshot.docs) {
          const clubId = clubDoc.id;
          const memberDocRef = doc(db, `clubs/${clubId}/members/${user.uid}`);
          const memberDocSnap = await getDoc(memberDocRef);

          if (memberDocSnap.exists()) {
            setClubName(clubDoc.data().name);
            break; // stop once found
          }
        }
      } catch (error) {
        console.error("Error checking club membership:", error);
      }
    };

    checkMembership();
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
