// src/pages/LandingPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { FiArrowRight, FiClock, FiUsers, FiCalendar, FiStar, FiTrendingUp, FiMapPin } from "react-icons/fi";
import { Typewriter } from 'react-simple-typewriter';

export default function LandingPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(new Set());
  const [interestedEvents, setInterestedEvents] = useState<Set<string>>(new Set());
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      const clubSnap = await getDocs(collection(db, "clubs"));
      const clubList = clubSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClubs(clubList);

      let allEvents: any[] = [];
      for (const clubDoc of clubSnap.docs) {
        const clubId = clubDoc.id;
        const clubName = clubDoc.data().name || "Unnamed Club";
        const eventsRef = collection(db, `clubs/${clubId}/events`);
        const eventsSnap = await getDocs(eventsRef);
        const eventsData = eventsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          clubName: clubName,
          clubId: clubId,
        }));
        allEvents = [...allEvents, ...eventsData];
      }
      setEvents(allEvents);

      if (user) {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) setRole(userSnap.data().role);

        const joined = new Set<string>();
        for (const c of clubSnap.docs) {
          const reqRef = doc(db, "clubs", c.id, "joinRequests", user.uid);
          const reqSnap = await getDoc(reqRef);
          if (reqSnap.exists()) joined.add(c.id);
        }
        setJoinedClubs(joined);
      }
    };

    fetchAll();

    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const handleJoin = (clubId: string) => {
    if (!user) {
      navigate("/auth");
    } else {
      console.log(`Send join request for club: ${clubId}`);
    }
  };

  const handleInterested = (eventId: string) => {
    if (!user) {
      navigate("/auth");
    } else {
      setInterestedEvents((prev) => {
        const updated = new Set(prev);
        if (updated.has(eventId)) {
          updated.delete(eventId);
        } else {
          updated.add(eventId);
        }
        return updated;
      });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "Date TBD";
    if (date.toDate) {
      return date.toDate().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    if (typeof date === "string" || date instanceof Date) {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return "Date TBD";
  };


  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Alex Chen",
      role: "Club President",
      text: "Club-Connect revolutionized how we manage our members and events. The engagement has doubled since we started using it!",
    },
    {
      id: 2,
      name: "Maria Garcia",
      role: "Student",
      text: "I found all my favorite clubs in one place and never miss their events anymore. The platform is so intuitive!",
    },
    {
      id: 3,
      name: "James Wilson",
      role: "Event Coordinator",
      text: "The event management tools saved us countless hours. RSVP tracking is now a breeze with Club-Connect.",
    },
  ];

  // Stats data
  const stats = [
    { value: "50+", label: "Active Clubs", icon: <FiUsers className="text-2xl" /> },
    { value: "300+", label: "Monthly Events", icon: <FiCalendar className="text-2xl" /> },
    { value: "5K+", label: "Students", icon: <FiUsers className="text-2xl" /> },
    { value: "24/7", label: "Support", icon: <FiClock className="text-2xl" /> },
  ];

  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  // Aurora Background Component
  const AuroraBackground = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    const handleMouseMove = (e: React.MouseEvent) => {
      const { clientX, clientY } = e;
      mouseX.set(clientX);
      mouseY.set(clientY);
    };

    const rotateX = useTransform(mouseY, [0, window.innerHeight], [15, -15]);
    const rotateY = useTransform(mouseX, [0, window.innerWidth], [-15, 15]);

    return (
      <motion.div 
        className="fixed inset-0 overflow-hidden pointer-events-none z-0"
        onMouseMove={handleMouseMove}
        style={{ rotateX, rotateY }}
      >
        {/* Aurora layers */}
        <motion.div
          className="absolute top-[20%] left-[20%] w-[60%] aspect-[2/1] rounded-full bg-red-900/20 blur-[100px]"
          animate={{
            x: ["-10%", "10%", "-10%"],
            y: ["0%", "10%", "0%"],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-[40%] left-[40%] w-[50%] aspect-[3/1] rounded-full bg-red-800/15 blur-[120px]"
          animate={{
            x: ["10%", "-10%", "10%"],
            y: ["5%", "-5%", "5%"],
            opacity: [0.7, 0.9, 0.7]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[10%] w-[40%] aspect-[4/1] rounded-full bg-red-700/10 blur-[80px]"
          animate={{
            x: ["5%", "-5%", "5%"],
            y: ["-5%", "5%", "-5%"],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
        />
        {/* Subtle particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-red-500/10"
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 50],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <div className="bg-black text-white w-full overflow-x-hidden scroll-smooth relative">
      {/* Aurora Background */}
      <AuroraBackground />

      {/* Floating Login Button */}
      <motion.button
        className="fixed top-5 right-5 z-50 px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg backdrop-blur-sm border border-red-900/50"
        onClick={() => navigate("/auth")}
        animate={{
          boxShadow: [
            "0 0 10px rgba(239,68,68,0.6)",
            "0 0 20px rgba(185,28,28,0.8)",
            "0 0 10px rgba(239,68,68,0.6)",
          ],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
      >
        🚀 Login
      </motion.button>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center px-6 relative overflow-hidden z-10">
      <div className="relative z-20 text-center">
        
        {/* Main Title */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600"
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, type: "spring", stiffness: 80 }}
        >
          Welcome to <span className="text-red-500">Club-Connect</span> ⚡
        </motion.h1>

        {/* GenZ Typewriter Heading */}
        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-gray-200 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Typewriter
            words={[
              "Grades fade. Memories don’t.",
              "Because college is not just 9 to 5.",
              "More than attendance, it’s about presence.",
              "Forget library hours. These are club hours.",
              "Every club is a playlist. Find yours."
            ]}
            loop={true}
            cursor
            cursorStyle="|"
            typeSpeed={60}
            deleteSpeed={40}
            delaySpeed={2000}
          />
        </motion.h2>

        {/* Subheading */}
        <motion.h3
          className="text-lg text-gray-400 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          After classes comes the real fun — clubs, events, and memories waiting to happen.
        </motion.h3>

        {/* Buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <motion.button
            className="px-8 py-3 rounded-full text-lg font-semibold bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 transition flex items-center gap-2"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              const section = document.getElementById("clubs-section");
              section?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            🌟 Explore Clubs <FiArrowRight />
          </motion.button>

          <motion.button
            className="px-8 py-3 rounded-full text-lg font-semibold bg-black border-2 border-red-600 hover:bg-red-900/30 transition flex items-center gap-2"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              const section = document.getElementById("events-section");
              section?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            🎉 Explore Events <FiArrowRight />
          </motion.button>
        </motion.div>
      </div>

      {/* Scrolling indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5 }}
      >
        <span className="text-sm text-gray-400 mb-2">Scroll Down</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-4 h-4 border-r-2 border-b-2 border-red-500 transform rotate-45"></div>
        </motion.div>
      </motion.div>
    </section>

      {/* Featured Clubs */}
      <section id="clubs-section" className="min-h-screen py-20 px-6 relative z-10 bg-gradient-to-b from-black/80 to-black">
        <div className="container mx-auto">
          <motion.h2
            className="text-center text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <span className="text-red-500">Featured</span> Clubs
          </motion.h2>
          <motion.p
            className="text-center text-gray-400 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            Discover and join the hottest coding clubs in your area
          </motion.p>
          
          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {clubs.length === 0 ? (
              <p className="text-gray-400">No clubs available right now.</p>
            ) : (
              clubs.map((club) => (
                <motion.div
                  key={club.id}
                  className={`bg-gray-900/70 rounded-xl p-6 shadow-lg cursor-pointer backdrop-blur-sm border border-gray-800 hover:border-red-500/50 transition ${
                    club.name === "Cy-Coders" ? "ring-2 ring-red-500/30" : ""
                  }`}
                  variants={fadeUp}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  onClick={() => {
                    if (club.name === "Cy-Coders") {
                      navigate("/clubs/cy-coders");
                    } else {
                      navigate("/clubs-created");
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{club.name}</h3>
                    {club.name === "Cy-Coders" && (
                      <motion.span
                        className="text-xs bg-gradient-to-r from-red-600 to-red-800 text-white px-3 py-1 rounded-full flex items-center gap-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 150 }}
                      >
                        <FiStar size={12} /> About
                      </motion.span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-6">{club.description}</p>
                  {club.name === "Cy-Coders" && (
                    <p className="text-xs text-red-400 mb-4 flex items-center gap-1">
                      <span>👆 Click to explore this featured club</span>
                    </p>
                  )}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoin(club.id);
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 rounded-lg hover:from-red-500 hover:to-red-700 transition flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {user
                      ? joinedClubs.has(club.id)
                        ? "✅ Joined"
                        : "➕ Join Club"
                      : "🔑 Join Club"}
                  </motion.button>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Widget */}
      <section className="py-20 relative z-10 bg-black/60 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-center text-3xl font-bold mb-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            What <span className="text-red-500">Members</span> Say
          </motion.h2>
          
          <div className="max-w-4xl mx-auto relative h-64">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonials[activeTestimonial].id}
                className="bg-gray-900/70 border border-gray-800 rounded-xl p-8 absolute inset-0 backdrop-blur-sm"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col h-full justify-center">
                  <div className="text-red-500 mb-4">
                    <FiStar className="inline mr-1" />
                    <FiStar className="inline mr-1" />
                    <FiStar className="inline mr-1" />
                    <FiStar className="inline mr-1" />
                    <FiStar className="inline" />
                  </div>
                  <p className="text-lg italic mb-6">"{testimonials[activeTestimonial].text}"</p>
                  <div>
                    <p className="font-bold">{testimonials[activeTestimonial].name}</p>
                    <p className="text-gray-400 text-sm">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full transition ${activeTestimonial === index ? 'bg-red-500' : 'bg-gray-700'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section id="events-section" className="min-h-screen py-20 px-6 relative z-10 bg-gradient-to-b from-black/80 to-black">
        <div className="container mx-auto">
          <motion.h2
            className="text-center text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <span className="text-red-500">Upcoming</span> Events
          </motion.h2>
          <motion.p
            className="text-center text-gray-400 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            Don't miss these exciting coding events and hackathons
          </motion.p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.length === 0 ? (
              <p className="text-gray-400">No events available right now.</p>
            ) : (
              events.map((event, i) => (
                <motion.div
                  key={event.id}
                  className="bg-gray-900/70 rounded-xl p-6 shadow-lg hover:shadow-red-500/20 transition border border-gray-800 hover:border-red-500/30 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="flex items-center gap-2 mb-4"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
                    viewport={{ once: true }}
                  >
                    <span className="px-3 py-1 bg-red-900/50 text-red-400 text-xs rounded-full border border-red-900">
                      {event.clubName}
                    </span>
                    {i % 3 === 0 && (
                      <span className="px-3 py-1 bg-red-900/20 text-red-400 text-xs rounded-full border border-red-900/50 flex items-center gap-1">
                        <FiTrendingUp size={12} /> Trending
                      </span>
                    )}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3">{event.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <div className="text-sm text-gray-300 mb-6 space-y-2">
                    <p className="flex items-center gap-2">
                      <FiCalendar className="text-red-500" /> {formatDate(event.date)}
                    </p>
                    {event.location && (
                      <p className="flex items-center gap-2">
                        <FiMapPin className="text-red-500" /> {event.location}
                      </p>
                    )}
                  </div>
                  <motion.button
                    onClick={() => handleInterested(event.id)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 rounded-lg hover:from-red-500 hover:to-red-700 transition flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {user
                      ? interestedEvents.has(event.id)
                        ? "✅ Interested"
                        : "🎯 I'm Interested"
                      : "🔑 Mark Interest"}
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10 bg-black/70 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.div
            className="bg-gradient-to-r from-black to-gray-900 rounded-2xl p-8 md:p-12 border border-gray-800 shadow-2xl overflow-hidden relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-red-900/20 blur-3xl"></div>
            <div className="relative z-10">
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6"
                variants={fadeUp}
              >
                Ready to <span className="text-red-500">Elevate</span> Your Club Experience?
              </motion.h2>
              <motion.p
                className="text-gray-400 mb-8 max-w-2xl"
                variants={fadeUp}
              >
                Join thousands of students and club coordinators who are already using Club-Connect to revolutionize their campus organizations.
              </motion.p>
              <motion.div variants={fadeUp}>
                <motion.button
                  className="px-8 py-3 rounded-full text-lg font-semibold bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 transition flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/auth")}
                >
                  Get Started Now <FiArrowRight />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}