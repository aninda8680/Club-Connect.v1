import { useEffect, useState } from "react";
import { collection, collectionGroup, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { Globe, Facebook, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Users, Calendar, Trophy, ChevronDown, Star } from "lucide-react";
import { ClubCard } from "./ClubCard";

// Types
interface Club {
  id: string;
  name: string;
  description: string;
  logoURL?: string;
  tag?: string;
  membersCount: number;
  achievementsCount: number;
  achievementImages?: string[];
  socials?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  leaderName?: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  clubName: string;
  description: string;
}

const PublicPanel = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const snapshot = await getDocs(collection(db, "clubs"));
        const clubData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Club[];
        setClubs(clubData);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    };

    const fetchEvents = async () => {
      try {
        const snapshot = await getDocs(collectionGroup(db, "events"));
        const eventData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];
        setEvents(eventData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchClubs();
    fetchEvents();
  }, []);

  return (
    <div className="bg-black text-white min-h-screen overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Orbs */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            top: '10%',
            left: '70%'
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
            top: '60%',
            left: '10%'
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-6 overflow-hidden">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Premium Club Management Platform</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Unite. Lead.
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Thrive.
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover college clubs, events, and your next big opportunity — all in one 
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold"> revolutionary platform</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <button
                onClick={() => document.getElementById("clubs-section")?.scrollIntoView({ behavior: "smooth" })}
                className="group relative bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="relative z-10">Explore Clubs</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-8 py-4 rounded-full hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/60" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6 bg-gradient-to-r from-purple-900/10 to-pink-900/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group transform hover:scale-105 transition-all duration-300">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <Users className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-4xl font-bold mb-2">{clubs.length}+</h3>
                <p className="text-gray-400">Active Clubs</p>
              </div>
            </div>
            <div className="group transform hover:scale-105 transition-all duration-300">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-pink-400" />
                <h3 className="text-4xl font-bold mb-2">{events.length}+</h3>
                <p className="text-gray-400">Upcoming Events</p>
              </div>
            </div>
            <div className="group transform hover:scale-105 transition-all duration-300">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-4xl font-bold mb-2">500+</h3>
                <p className="text-gray-400">Achievements</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clubs Section */}
      <section id="clubs-section" className="relative py-20 px-6">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent"
          style={{ transform: `translateY(${scrollY * -0.1}px)` }}
        />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Featured Clubs
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Discover amazing communities and find your perfect fit
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clubs.map((club, index) => (
              <div
                key={club.id}
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <img
                        src={club.logoURL || "/default-logo.png"}
                        alt={club.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/20 group-hover:border-purple-400/50 transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold group-hover:text-purple-300 transition-colors duration-300">
                        {club.name}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {club.description || "No description available"}
                      </p>
                      {club.tag && (
                        <span className="inline-block mt-1 px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                          #{club.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-400">{club.membersCount ?? 0}</p>
                      <p className="text-xs text-gray-500">Members</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-pink-400">{club.achievementsCount ?? 0}</p>
                      <p className="text-xs text-gray-500">Achievements</p>
                    </div>
                    <div className="text-center">
                      <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Featured</p>
                    </div>
                  </div>

                  {Array.isArray(club.achievementImages) && club.achievementImages.length > 0 && (
                    <div className="flex space-x-2 mb-4">
                      {club.achievementImages.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Achievement ${idx + 1}`}
                          className="w-12 h-12 rounded-lg object-cover border border-white/20 hover:border-purple-400/50 transition-all duration-300"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center space-x-4 mb-4">
                    {club.socials?.website && (
                      <a href={club.socials.website} target="_blank" rel="noreferrer" 
                         className="p-2 bg-white/10 rounded-full hover:bg-purple-600/20 transition-all duration-300 hover:scale-110">
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    {club.socials?.facebook && (
                      <a href={club.socials.facebook} target="_blank" rel="noreferrer"
                         className="p-2 bg-white/10 rounded-full hover:bg-blue-600/20 transition-all duration-300 hover:scale-110">
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {club.socials?.instagram && (
                      <a href={club.socials.instagram} target="_blank" rel="noreferrer"
                         className="p-2 bg-white/10 rounded-full hover:bg-pink-600/20 transition-all duration-300 hover:scale-110">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {club.socials?.linkedin && (
                      <a href={club.socials.linkedin} target="_blank" rel="noreferrer"
                         className="p-2 bg-white/10 rounded-full hover:bg-blue-700/20 transition-all duration-300 hover:scale-110">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => navigate("/auth")}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Explore Club
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="relative py-20 px-6 bg-gradient-to-r from-purple-900/10 to-pink-900/10">
        <div 
          className="absolute inset-0"
          style={{ transform: `translateY(${scrollY * -0.05}px)` }}
        />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Upcoming Events
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Don't miss out on exciting opportunities and experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.slice(0, 6).map((event, index) => (
              <div 
                key={event.id}
                className="group relative bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-black/60 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8 text-pink-400" />
                    <span className="px-3 py-1 bg-pink-600/20 text-pink-300 text-xs rounded-full">
                      {event.date}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-pink-300 transition-colors duration-300">
                    {event.name}
                  </h3>
                  
                  <p className="text-sm text-gray-400 mb-2">
                    Hosted by <span className="text-purple-400 font-semibold">{event.clubName}</span>
                  </p>
                  
                  <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                    {event.description}
                  </p>
                  
                  <button
                    onClick={() => navigate("/auth")}
                    className="group/btn flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 transition-colors duration-300"
                  >
                    Learn More 
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Why Choose <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Club Connect</span>?
          </h2>
          
          <p className="text-xl text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed">
            Experience the future of club management with our cutting-edge platform designed specifically for modern educational institutions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center group-hover:shadow-2xl transition-all duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Connect & Network</h3>
              <p className="text-gray-400">Build lasting relationships with like-minded individuals and expand your professional network.</p>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center group-hover:shadow-2xl transition-all duration-300">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Achieve Excellence</h3>
              <p className="text-gray-400">Track your progress, celebrate achievements, and unlock new opportunities for growth.</p>
            </div>
            
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center group-hover:shadow-2xl transition-all duration-300">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Seamless Experience</h3>
              <p className="text-gray-400">Enjoy a premium, intuitive interface designed for efficiency and user satisfaction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      


    </div>
  );
};

export default PublicPanel;
