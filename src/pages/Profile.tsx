"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { useAuth } from "../AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [clubName, setClubName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);

          if (data.clubId) {
            const clubDoc = await getDoc(doc(db, "clubs", data.clubId));
            if (clubDoc.exists()) {
              setClubName(clubDoc.data().name);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const createdAt = auth.currentUser?.metadata?.creationTime
    ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : "N/A";

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'text-red-400';
      case 'manager':
        return 'text-yellow-400';
      case 'member':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-green-400 font-mono">
        <p className="text-xl mb-4 animate-pulse">🔄 Loading your hacker profile...</p>
        <div className="relative">
          <div className="w-12 h-12 border-4 border-green-300 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-8 h-8 m-auto border-4 border-transparent border-t-lime-500 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-green-300 font-mono px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-green-800/30 via-black to-green-900/30 rounded-3xl p-8 border border-green-800 shadow-lg shadow-green-500/10 hover:shadow-green-400/20 transition-all duration-300">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <img
                src={
                  user.photoURL && user.photoURL !== ""
                    ? user.photoURL
                    : "https://ui-avatars.com/api/?name=" + (user.displayName || "User")
                }
                alt="Profile"
                className="w-28 h-28 rounded-full border-4 border-green-500 shadow-xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl font-bold tracking-wide text-lime-300 animate-pulse">{user.displayName || "Unnamed Hacker"}</h1>
              <p className="text-sm text-green-400">{user.email}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                <span className={`px-3 py-1 bg-green-900/50 border border-green-400 text-xs rounded-full ${getRoleColor(userData?.role)}`}>
                  {userData?.role || "Member"}
                </span>
                {clubName && (
                  <span className="px-3 py-1 bg-lime-900/40 text-lime-300 border border-lime-500 text-xs rounded-full">
                    {clubName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-black border border-green-800 rounded-2xl p-6 hover:shadow-green-400/20 transition-all duration-300">
            <h3 className="text-lg mb-4 text-lime-400 tracking-wide">Account Details</h3>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span>Member Since</span>
                <span>{createdAt}</span>
              </p>
              <p className="flex justify-between">
                <span>User ID</span>
                <span>{user.uid.slice(0, 8)}...</span>
              </p>
            </div>
          </div>

          <div className="bg-black border border-green-800 rounded-2xl p-6 hover:shadow-green-400/20 transition-all duration-300">
            <h3 className="text-lg mb-4 text-lime-400 tracking-wide">Organization Info</h3>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span>Role</span>
                <span className={getRoleColor(userData?.role)}>{userData?.role || "Member"}</span>
              </p>
              <p className="flex justify-between">
                <span>Club</span>
                <span>{clubName || "Not Assigned"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center mt-8">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="relative px-8 py-3 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white font-semibold rounded-lg border border-lime-400 transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              {isLoggingOut ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging out...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </div>
              )}
            </button>

        </div>
      </div>
    </div>
  );
}
