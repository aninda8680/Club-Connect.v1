import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role?: string;
  clubId?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  stream?: string;
  course?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  profileComplete: boolean;
  setProfileComplete: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  profileComplete: false,
  setProfileComplete: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        let role = "";
        let clubId = "";
        let phone = "";
        let dob = "";
        let gender = "";
        let stream = "";
        let course = "";

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          role = data.role || "";
          clubId = data.clubId || "";
          phone = data.phone || "";
          dob = data.dob || "";
          gender = data.gender || "";
          stream = data.stream || "";
          course = data.course || "";
        }

        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role,
          clubId,
          phone,
          dob,
          gender,
          stream,
          course,
        };

        setUser(authUser);

        // ✅ Profile check
        const isComplete =
          !!authUser.phone &&
          !!authUser.dob &&
          !!authUser.gender &&
          !!authUser.stream &&
          !!authUser.course;

        setProfileComplete(isComplete);
      } else {
        setUser(null);
        setProfileComplete(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, profileComplete, setProfileComplete }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
