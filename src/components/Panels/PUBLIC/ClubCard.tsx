import React from 'react';
import { Star, Globe, Facebook, Instagram, Linkedin } from 'lucide-react';

interface ClubCardProps {
  club: Club;
  index: number;
  onExploreClick: () => void;
}

export interface Club {
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
}

export const ClubCard: React.FC<ClubCardProps> = ({ club, index, onExploreClick }) => {
  const socialIcons = {
    website: Globe,
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin
  };

  const socialColors = {
    website: 'hover:bg-purple-600/20',
    facebook: 'hover:bg-blue-600/20',
    instagram: 'hover:bg-pink-600/20',
    linkedin: 'hover:bg-blue-700/20'
  };

  return (
    <div
      className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl opacity-0 animate-fade-in-up"
      style={{
        animationDelay: `${index * 0.1}s`,
        animationFillMode: 'forwards'
      }}
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      
      <div className="relative z-10">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <img
              src={club.logoURL || "/api/placeholder/64/64"}
              alt={`${club.name} logo`}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/20 group-hover:border-purple-400/50 transition-all duration-300"
              onError={(e) => {
                e.currentTarget.src = "/api/placeholder/64/64";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold group-hover:text-purple-300 transition-colors duration-300">
              {club.name}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {club.description}
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
            <p className="text-lg font-bold text-purple-400">{club.membersCount}</p>
            <p className="text-xs text-gray-500">Members</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-pink-400">{club.achievementsCount}</p>
            <p className="text-xs text-gray-500">Achievements</p>
          </div>
          <div className="text-center">
            <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Featured</p>
          </div>
        </div>

        {club.achievementImages && club.achievementImages.length > 0 && (
          <div className="flex space-x-2 mb-4">
            {club.achievementImages.slice(0, 3).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Achievement ${idx + 1}`}
                className="w-12 h-12 rounded-lg object-cover border border-white/20 hover:border-purple-400/50 transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.src = "/api/placeholder/48/48";
                }}
              />
            ))}
          </div>
        )}

        <div className="flex justify-center space-x-4 mb-4">
          {club.socials && Object.entries(club.socials).map(([platform, url]) => {
            const Icon = socialIcons[platform as keyof typeof socialIcons];
            const colorClass = socialColors[platform as keyof typeof socialColors];
            
            return (
              <a 
                key={platform}
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`p-2 bg-white/10 rounded-full ${colorClass} transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50`}
                aria-label={`Visit ${club.name} on ${platform}`}
              >
                <Icon className="w-4 h-4" />
              </a>
            );
          })}
        </div>

        <button
          onClick={onExploreClick}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          Explore Club
        </button>
      </div>
    </div>
  );
};