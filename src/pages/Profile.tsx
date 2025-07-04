import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { useAuth } from "../AuthContext";
import Navbar from "../components/Navbar";

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

  if (!user || isLoading) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <p className="text-xl mb-4 animate-pulse">🔄 Loading your deatils...</p>
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-8 h-8 m-auto border-4 border-transparent border-t-purple-400 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

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
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'manager':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'member':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-4 md:p-8">

    <div className="">
      <Navbar/>
      <div className="max-w-4xl mx-auto">
        {/* Header with animated gradient */}
        <div className="relative mb-8 p-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-zinc-700/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-indigo-400/5"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Image with enhanced styling */}
            <div className="relative group">

              <img
  src={
    user.photoURL && user.photoURL !== ""
      ? user.photoURL
      : "https://ui-avatars.com/api/?name=" + (user.displayName || "User")
  }
  alt="Profile"
  className="w-24 h-24 rounded-full border-2 border-gray-300"
/>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-zinc-800 animate-pulse"></div>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left space-y-2 flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {user.displayName || "Unnamed User"}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start space-x-2 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(userData?.role)}`}>
                  {userData?.role || "Member"}
                </span>
                {clubName && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full text-sm font-semibold">
                    {clubName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Account Details Card */}
          <div className="group p-6 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-zinc-700/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Account Details</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Member Since</span>
                <span className="text-gray-900 dark:text-white font-semibold">{createdAt}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300 font-medium">User ID</span>
                <span className="text-gray-900 dark:text-white font-mono text-sm">{user.uid.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* Organization Card */}
          <div className="group p-6 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-zinc-700/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Organization</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Role</span>
                <span className={`px-2 py-1 rounded-md text-sm font-semibold ${getRoleColor(userData?.role)}`}>
                  {userData?.role || "Member"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Club</span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {clubName || "Not assigned"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="p-6 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-zinc-700/30">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Account Actions</h3>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="group w-full relative px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            <div className="relative flex items-center justify-center space-x-2">
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}