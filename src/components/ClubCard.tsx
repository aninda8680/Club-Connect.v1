"use client";

import { Plus, ArrowRight, Users } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

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
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setHovered(club.id)}
      onMouseLeave={() => setHovered(null)}
      className={`relative overflow-hidden rounded-2xl shadow-md ${
        hovered === club.id ? "shadow-2xl" : "shadow-lg"
      } group`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${club.color} opacity-10 group-hover:opacity-20 transition`} />
      <div className="relative bg-[#101826]/70 backdrop-blur-md border border-neutral-800 p-6 h-full rounded-2xl">
        {club.featured && (
          <div className="absolute top-4 right-4 text-xs font-semibold bg-yellow-500/10 border border-yellow-500/30 rounded-full px-3 py-1 text-yellow-400">
            Featured
          </div>
        )}

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {club.name}
        </h3>
        <div className="flex items-center gap-3 text-sm text-slate-400 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{club.members} members</span>
          </div>
          <span className="px-2 py-1 bg-[#1e293b] rounded-md text-xs">{club.category}</span>
        </div>
        <p className="text-slate-300 text-sm mb-6">{club.description}</p>

        {role !== "admin" && (
          <div className="flex justify-end">
            <button
              disabled={isJoined}
              onClick={async () => {
                await onJoin(club.id);
                toast.success("Join request sent!");
              }}
              className={`group relative px-6 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 ${
                isJoined
                  ? "bg-green-600 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
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
              {!isJoined && (
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12 pointer-events-none" />
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
