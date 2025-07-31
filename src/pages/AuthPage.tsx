import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Terminal, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create user doc on first sign in
        await setDoc(userRef, {
          displayName: user.displayName || "No Name",
          email: user.email,
          role: "visitor", // You can dynamically assign roles here if needed
          clubId: "",     // You can also assign this dynamically
        });
      }
    } catch (err: any) {
      console.error("Authentication error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-black text-gray-200 font-mono flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-purple-600 rounded-full filter blur-3xl"></div>
        <div className="absolute top-2/3 right-1/4 w-28 h-28 bg-cyan-500 rounded-full filter blur-3xl"></div>
      </div>

      {/* Binary code animation */}
      <div className="fixed inset-0 overflow-hidden opacity-5 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute text-xs text-green-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              transform: `scale(${Math.random() * 0.5 + 0.5})`,
            }}
          >
            {Math.random() > 0.5 ? "1" : "0"}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Panel - Brand Info */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-700 rounded-lg">
                <Terminal className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Club-Connect
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">
              Developer Portal
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Secure access to the Adamas university's club management system.
              Built for developers, by developers.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span></span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-100 mb-2">
              Authentication Required
            </h3>
            <p className="text-gray-400">
              Sign in with your university Google account
            </p>
          </div>

          <div className="space-y-6">
            {/* Google Sign In */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>

            <div className="text-center text-xs text-gray-500 mt-6">
              <p>
                By authenticating, you agree to our{" "}
                <a
                  href="#"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Privacy Policy
                </a>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <p className="text-gray-500 text-xs">
                Need help? Contact your system administrator
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
