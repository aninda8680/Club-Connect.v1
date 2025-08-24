import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, UserCheck, FileDown, Terminal, ChevronRight } from "lucide-react";
import { db } from "../../../../firebase";
import { useAuth } from "../../../../AuthContext";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

const ScrollAnimationWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default function CoordinatorMember() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubId, setClubId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);

  // fetch club id
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "clubs"), where("coordinatorId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) setClubId(snap.docs[0].id);
    });
    return () => unsub();
  }, [user]);

  // fetch members
  useEffect(() => {
    if (!clubId) return;
    const fetchMembers = async () => {
      const q = query(collection(db, "clubs", clubId, "members"));
      const snap = await getDocs(q);
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchMembers();
  }, [clubId]);

  // export handler (moved inside)
  const handleExport = async () => {
    if (!members.length) {
      toast.error("No members to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Members");

      worksheet.columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Joined At", key: "joinedAt", width: 20 },
        { header: "Stream", key: "stream", width: 20 },
        { header: "Course", key: "course", width: 20 },
      ];

      members.forEach((member) => {
        worksheet.addRow({
          name: member.name,
          email: member.email,
          stream: member.stream,
          course: member.course,
          joinedAt: member.joinedAt?.toDate?.()?.toLocaleDateString() || "N/A",
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `club-members-${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Error exporting data");
    }
  };

  const cards = [
    {
      title: "New Requests",
      desc: "Review and manage new member requests",
      command: "admin.members.requests()",
      icon: Users,
      color: "from-blue-500/20 to-blue-600/20",
      glow: "from-blue-500/10 to-blue-600/10",
      border: "border-blue-500/30",
      button: "View Requests",
      onClick: () => navigate("/join-requests"),
    },
    {
      title: "Active Members",
      desc: "View, manage, and remove club members",
      command: "admin.members.manage()",
      icon: UserCheck,
      color: "from-emerald-500/20 to-emerald-600/20",
      glow: "from-emerald-500/10 to-emerald-600/10",
      border: "border-emerald-500/30",
      button: "Manage Members",
      onClick: () => navigate("/club-members"),
    },
    {
      title: "Export Data",
      desc: "Export all members into Excel/CSV file",
      command: "admin.members.export()",
      icon: FileDown,
      color: "from-amber-500/20 to-orange-500/20",
      glow: "from-amber-500/10 to-orange-500/10",
      border: "border-amber-500/30",
      button: "Export",
      onClick: handleExport, // ✅ direct export
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] 
        bg-[size:4rem_4rem] 
        [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] 
        opacity-20 pointer-events-none" 
      />

      <main className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <ScrollAnimationWrapper>
            <div className="mb-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex items-center gap-6">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.05 }}
                  className="relative p-4 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl border border-green-500/30 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-2xl blur-xl" />
                  <Terminal className="relative w-10 h-10 text-green-400" />
                </motion.div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Member Management
                  </h1>
                  <p className="text-slate-400 text-lg mt-2 flex items-center gap-2">
                    <span className="text-green-400 font-mono">$</span> 
                    <span>Oversee your club’s member operations</span>
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                  </p>
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>

          {/* Cards */}
          <ScrollAnimationWrapper>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} rounded-xl blur-xl group-hover:blur-2xl transition-all`} />
                  <div className={`relative p-6 bg-gradient-to-br ${card.glow} backdrop-blur-sm border ${card.border} rounded-xl`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg border bg-black/20">
                        <card.icon className="w-6 h-6 text-white" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">{card.title}</h2>
                    <p className="text-slate-400 text-sm mb-4">{card.desc}</p>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-black/30 px-3 py-2 rounded-lg mb-5">
                      <span className="text-green-400">$</span> {card.command}
                    </div>
                    <button
                      onClick={card.onClick}
                      className="w-full py-3 rounded-lg font-mono text-white bg-black/40 border border-slate-700 hover:bg-black/60 hover:border-slate-500 transition-all flex items-center justify-center gap-2"
                    >
                      {card.button}
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollAnimationWrapper>

          {/* Footer */}
          <ScrollAnimationWrapper>
            <div className="text-center text-slate-600 text-xs font-mono mt-16">
              <p>System: Member Management Module v2.5</p>
              <p className="mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </ScrollAnimationWrapper>

        </div>
      </main>
    </div>
  );
}
