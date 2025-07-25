import { Github, Linkedin, Instagram, Mail, Users, Calendar, Shield, Home } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full overflow-x-hidden bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white px-6 py-8 text-sm relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 overflow-hidden max-w-screen">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-600/20"></div>
        <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-6 left-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left Side: Website Details */}
        <div className="flex items-center gap-5">
          {/* Logo Container */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 p-0.5 hover:from-cyan-500 hover:to-blue-500 transition-all duration-500">
              <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden flex items-center justify-center relative">
                <Shield className="w-10 h-10 text-blue-400 group-hover:text-purple-400 transition-colors duration-300" />
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-gray-900 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Website Details */}
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hover:from-blue-400 hover:to-purple-400 transition-all duration-300 cursor-default">
              ClubConnect
            </h3>
            <div className="flex items-center text-gray-300 gap-2 text-sm hover:text-blue-400 transition-colors duration-300">
              <Users className="w-4 h-4" />
              <span className="font-medium">University Club Management System</span>
            </div>
            <div className="flex items-center text-gray-400 gap-2 text-xs">
              <Calendar className="w-3 h-3" />
              <span>Connecting students through activities</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Links */}
        <div className="flex gap-3">
          {[
            {
              icon: <Home size={18} />,
              href: "/",
              label: "Home",
              color: "hover:bg-blue-700/30",
            },
            {
              icon: <Users size={18} />,
              href: "/clubs",
              label: "Clubs",
              color: "hover:bg-purple-700/30",
            },
            {
              icon: <Calendar size={18} />,
              href: "/events",
              label: "Events",
              color: "hover:bg-emerald-700/30",
            },
            {
              icon: <Shield size={18} />,
              href: "/admin",
              label: "Admin",
              color: "hover:bg-amber-700/30",
            },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className={`w-11 h-11 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300 flex items-center justify-center hover:scale-105 hover:border-gray-600 hover:text-white transition-all duration-300 group relative ${item.color}`}
              aria-label={item.label}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {item.icon}
              {/* Tooltip */}
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Footer Text */}
      <div className="text-center mt-6 pt-4 border-t border-gray-800/50">
        <div className="text-gray-400 text-xs space-y-1">
          <p>© 2025 ClubConnect • All rights reserved</p>
          <p className="text-gray-500">Empowering student organizations through technology</p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(1deg); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(147, 51, 234, 0.3); }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }

        a:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </footer>
  );
};

export default Footer;