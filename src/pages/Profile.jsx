import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User, Eye, CheckCircle2, Clock, XCircle, Star, Tv, BarChart3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataImportExport from "../components/import/DataImportExport";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: myList = [] } = useQuery({
    queryKey: ["animeEntries"],
    queryFn: () => base44.entities.AnimeEntry.list(),
  });

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.User.delete(user.id);
      await base44.auth.logout();
    } catch (error) {
      setIsDeleting(false);
      alert("Failed to delete account. Please try again.");
    }
  };

  const stats = useMemo(() => {
    const watching = myList.filter(e => e.status === "watching").length;
    const completed = myList.filter(e => e.status === "completed").length;
    const planned = myList.filter(e => e.status === "plan_to_watch").length;
    const dropped = myList.filter(e => e.status === "dropped").length;
    const totalEps = myList.reduce((sum, e) => sum + (e.episodes_watched || 0), 0);
    const scored = myList.filter(e => e.user_score > 0);
    const avgScore = scored.length > 0
      ? (scored.reduce((s, e) => s + e.user_score, 0) / scored.length).toFixed(1)
      : "—";
    
    // Genre breakdown
    const genreCounts = {};
    myList.forEach(e => {
      if (e.genres) {
        e.genres.split(",").forEach(g => {
          const trimmed = g.trim();
          if (trimmed) genreCounts[trimmed] = (genreCounts[trimmed] || 0) + 1;
        });
      }
    });
    const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

    return { watching, completed, planned, dropped, totalEps, avgScore, topGenres, total: myList.length };
  }, [myList]);

  const statCards = [
    { label: "Watching", value: stats.watching, icon: Eye, color: "from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/20" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/20" },
    { label: "Planned", value: stats.planned, icon: Clock, color: "from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/20" },
    { label: "Dropped", value: stats.dropped, icon: XCircle, color: "from-red-500/20 to-red-600/10 text-red-400 border-red-500/20" },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 sm:px-6 max-w-3xl mx-auto pt-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">My Profile</h1>
          <p className="text-sm text-slate-500">Your anime stats at a glance</p>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 text-center">
            <Tv className="w-5 h-5 text-violet-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
            <p className="text-xs text-slate-500">Total Anime</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 text-center">
            <BarChart3 className="w-5 h-5 text-violet-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{stats.totalEps}</p>
            <p className="text-xs text-slate-500">Episodes</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 text-center">
            <Star className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{stats.avgScore}</p>
            <p className="text-xs text-slate-500">Avg Score</p>
          </div>
        </motion.div>

        {/* Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} border rounded-2xl p-4 flex items-center gap-3`}>
              <div className="p-2 rounded-xl bg-black/20">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-100">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Top Genres */}
        {stats.topGenres.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6"
          >
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Favorite Genres</h3>
            <div className="space-y-3">
              {stats.topGenres.map(([genre, count], i) => {
                const maxCount = stats.topGenres[0][1];
                const percentage = (count / maxCount) * 100;
                const colors = [
                  "bg-violet-500", "bg-purple-500", "bg-pink-500", "bg-rose-500",
                  "bg-blue-500", "bg-cyan-500", "bg-emerald-500", "bg-amber-500"
                ];
                return (
                  <div key={genre} className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-24 truncate">{genre}</span>
                    <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                        className={`h-full rounded-full ${colors[i % colors.length]}`}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Import/Export */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <DataImportExport
            myList={myList}
            onImportComplete={() => queryClient.invalidateQueries({ queryKey: ["animeEntries"] })}
          />
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300 mb-1">Delete Account</p>
              <p className="text-xs text-slate-500">Permanently delete your account and all data</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 border-slate-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-slate-100">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    This action cannot be undone. This will permanently delete your account and remove all your anime list data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>
      </div>
    </div>
  );
}