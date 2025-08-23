// src/pages/ProfileCompletionPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiPhone, FiCalendar, FiChevronDown, FiArrowLeft } from "react-icons/fi";

export default function ProfileCompletionPage() {
  const { user, setProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [phone, setPhone] = useState("+91");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [stream, setStream] = useState("");
  const [course, setCourse] = useState("");

  useEffect(() => {
    // Pre-fill data if available
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          phone,
          dob,
          gender,
          stream,
          course,
          role: user.role || "visitor",
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL || "",
        },
        { merge: true }
      );

      setProfileComplete(true);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error completing profile:", error);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black to-red-800 p-4 overflow-hidden">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <motion.form
            onSubmit={handleSubmit}
            className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full border border-gray-800 relative overflow-hidden"
            style={{ maxHeight: "90vh" }}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              type="button"
              onClick={() => navigate("/")}
              className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-gray-800/80 border border-gray-700 text-gray-200 hover:bg-gray-700 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 z-20"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Go to landing page"
            >
              <FiArrowLeft className="text-sm" />
              <span>Back</span>
            </motion.button>
            {/* Decorative elements */}
            <motion.div 
              className="absolute -top-20 -right-20 w-40 h-40 bg-white rounded-full opacity-10"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <motion.div 
              className="absolute -top-10 -left-10 w-32 h-32 bg-white rounded-full opacity-10"
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <motion.div 
              className="absolute -bottom-10 -right-10 w-32 h-32 bg-white rounded-full opacity-10"
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <motion.div 
              className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full opacity-10"
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-4"
            >
              <div className="flex justify-center mb-2">
                <motion.div
                  className="w-14 h-14 rounded-full bg-black flex items-center justify-center border-2 border-blue-500"
                  whileHover={{ scale: 1.05 }}
                >
                  <FiUser className="text-xl text-blue-400" />
                </motion.div>
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-1">
                Complete Your Profile
              </h2>
              <p className="text-gray-400 text-xs">
                Just a few more details to get started
              </p>
            </motion.div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {/* Custom scrollbar */}
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 4px;
                }
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background: #3b82f6;
                  border-radius: 2px;
                }
              `}</style>

              {/* Phone */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block mb-1 text-xs text-gray-300">Phone *</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                        let value = e.target.value;

                        // Always enforce "+91 " prefix
                        if (!value.startsWith("+91 ")) {
                        value = "+91 " + value.replace(/^\+91\s?/, "");
                        }

                        setPhone(value);
                    }}
                    onKeyDown={(e) => {
                        // Prevent deleting inside the "+91 " prefix
                        const input = e.target as HTMLInputElement;
                        if (
                          phone.startsWith("+91 ") &&
                          input.selectionStart !== null &&
                          input.selectionStart <= 4 &&
                          (e.key === "Backspace" || e.key === "Delete")
                        ) {
                          e.preventDefault();
                        }
                    }}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                    />

                </div>
              </motion.div>

              {/* DOB */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block mb-1 text-xs text-gray-300">Date of Birth *</label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="date"
                    lang="en-GB"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none transition"
                  />
                </div>
              </motion.div>

              {/* Gender */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block mb-1 text-xs text-gray-300">Gender *</label>
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    className="w-full pl-3 pr-8 py-2 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none transition"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                </div>
              </motion.div>

              {/* Stream */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block mb-1 text-xs text-gray-300">Stream *</label>
                <div className="relative">
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    required
                    className="w-full pl-3 pr-8 py-2 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none transition"
                  >
                    <option value="">Select Stream</option>
                    <option value="cse">Computer Science & Engineering</option>
                    <option value="ece">Electronics & Communication</option>
                    <option value="mech">Mechanical Engineering</option>
                    <option value="civil">Civil Engineering</option>
                    <option value="electrical">Electrical Engineering</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                </div>
              </motion.div>

              {/* Course */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block mb-1 text-xs text-gray-300">Course *</label>
                <div className="relative">
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                    className="w-full pl-3 pr-8 py-2 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none transition"
                  >
                    <option value="">Select Course</option>
                    <option value="btech">B.Tech</option>
                    <option value="mtech">M.Tech</option>
                    <option value="bca">BCA</option>
                    <option value="mca">MCA</option>
                    <option value="diploma">Diploma</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                </div>
              </motion.div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-xs text-center mt-2"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-4"
            >
              <motion.button
                type="submit"
                className="w-full py-2 px-4 text-sm rounded-lg bg-gradient-to-r from-red-800 to-black text-white font-medium hover:from-black hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                <span className="relative z-10">
                  {isSubmitting ? "Saving..." : "Save & Continue"}
                </span>
                {isSubmitting && (
                  <motion.span
                    className="absolute inset-0 bg-blue-700 z-0"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}