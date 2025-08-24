"use client";

import { Plus, ArrowRight, Users } from "lucide-react";
import { motion } from "framer-motion";

interface ClubCardProps {
  club: any;
  isJoined: boolean;
  role: string;
  onJoin: (clubId: string) => Promise<void>;
  hovered: string | null;
  setHovered: (id: string | null) => void;
}

export function ClubCard({ club, isJoined, role, onJoin, hovered, setHovered }: ClubCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setHovered(club.id)}
      onMouseLeave={() => setHovered(null)}
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
        hovered === club.id ? "shadow-2xl shadow-blue-500/20" : "shadow-md shadow-black/40"
      }`}
    >
      {/* Subtle Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${club.color} opacity-15 group-hover:opacity-25 transition`}
      />

      {/* Main Card */}
      <div className="relative bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-6 h-full rounded-2xl">
        {/* Featured Tag */}
        {club.featured && (
          <div className="absolute top-4 right-4 text-xs font-semibold bg-yellow-400/10 border border-yellow-400/30 rounded-full px-3 py-1 text-yellow-300 shadow-sm">
            Featured
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 hover:text-blue-400 transition-colors">
          {club.name}
        </h3>

        {/* Members + Category */}
        <div className="flex items-center gap-3 text-sm text-slate-400 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{club.members} members</span>
          </div>
          <span className="px-2 py-0.5 bg-slate-800/60 rounded-md text-xs">
            {club.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-slate-300 text-sm mb-6 line-clamp-3">{club.description}</p>

        {/* Join Button */}
        {role !== "admin" && (
          <div className="flex justify-end">
            <button
              disabled={isJoined}
              onClick={async () => await onJoin(club.id)}
              className={`group relative px-6 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 overflow-hidden transition-all duration-300 ${
                isJoined
                  ? "bg-green-600 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md hover:shadow-lg"
              }`}
            >
              {isJoined ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  Request Sent
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  Request to Join
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}

              {/* Shimmer Effect */}
              {!isJoined && (
                <span className="absolute inset-0 bg-white/20 -translate-x-[120%] group-hover:translate-x-[120%] transition-transform duration-700 skew-x-12" />
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
