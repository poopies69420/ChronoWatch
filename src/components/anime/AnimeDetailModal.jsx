import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Tv, Calendar, Building2, Tag, Plus, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function AnimeDetailModal({ anime, isOpen, onClose, onAddToList, onUpdateEntry, listEntry }) {
  const [status, setStatus] = useState(listEntry?.status || "plan_to_watch");
  const [episodesWatched, setEpisodesWatched] = useState(listEntry?.episodes_watched || 0);
  const [userScore, setUserScore] = useState(listEntry?.user_score || 0);
  const [notes, setNotes] = useState(listEntry?.notes || "");
  const [tags, setTags] = useState(listEntry?.tags || "");

  if (!isOpen || !anime) return null;

  const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || anime.image_url;
  const title = anime.title || anime.title_english;
  const synopsis = anime.synopsis || "No synopsis available.";
  const genres = anime.genres?.map(g => g.name) || (anime.genres_str || "").split(",").filter(Boolean);
  const studios = anime.studios?.map(s => s.name) || (anime.studios_str || "").split(",").filter(Boolean);
  const totalEps = anime.episodes || anime.episodes_total || 0;
  const score = anime.score || 0;
  const aired = anime.aired?.string || anime.aired || "";
  const type = anime.type || "";

  const handleSave = () => {
    const airedString = typeof aired === 'string' ? aired : aired?.string || "";
    const yearMatch = airedString.match(/\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[0]) : null;

    const data = {
      mal_id: anime.mal_id,
      title: title,
      image_url: imageUrl,
      synopsis: synopsis.substring(0, 2000),
      score: score,
      episodes_total: totalEps,
      episodes_watched: episodesWatched,
      user_score: userScore,
      status: status,
      genres: genres.join(", "),
      studios: studios.join(", "),
      type: type,
      aired: airedString,
      notes: notes,
      tags: tags,
      year: year,
    };

    if (listEntry) {
      onUpdateEntry(listEntry.id, data);
    } else {
      onAddToList(data);
    }
    onClose();
  };

  const statusLabels = {
    watching: "Watching",
    completed: "Completed",
    plan_to_watch: "Plan to Watch",
    dropped: "Dropped",
  };

  const statusColors = {
    watching: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    plan_to_watch: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    dropped: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full sm:max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700/60 sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="overflow-y-auto max-h-[90vh] scrollbar-thin">
            {/* Hero Section */}
            <div className="relative h-64 sm:h-72 overflow-hidden">
              <img src={imageUrl} alt={title} className="w-full h-full object-cover blur-sm scale-110 opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 flex gap-5">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-28 h-40 object-cover rounded-xl shadow-xl shadow-black/40 border border-slate-600/40 flex-shrink-0"
                />
                <div className="flex flex-col justify-end min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight line-clamp-2 mb-2">{title}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    {score > 0 && (
                      <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-500/30">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-yellow-200">{score.toFixed(1)}</span>
                      </div>
                    )}
                    {type && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Tv className="w-3.5 h-3.5" />
                        <span className="text-xs">{type}</span>
                      </div>
                    )}
                    {totalEps > 0 && (
                      <span className="text-xs text-slate-400">{totalEps} episodes</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Genres */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre, i) => (
                    <Badge key={i} variant="outline" className="bg-violet-500/10 text-violet-300 border-violet-500/30 text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {genre.trim()}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Studios & Aired */}
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                {studios.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>{studios.join(", ")}</span>
                  </div>
                )}
                {aired && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>{aired}</span>
                  </div>
                )}
              </div>

              {/* Synopsis */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Synopsis</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{synopsis}</p>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-700/60" />

              {/* Tracking Controls */}
              <div className="space-y-5">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Track This Anime</h3>

                {/* Status */}
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key} className="text-slate-200 focus:bg-slate-700 focus:text-white">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Episodes */}
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">
                    Episodes Watched: <span className="text-violet-400 font-bold">{episodesWatched}</span>
                    {totalEps > 0 && <span className="text-slate-600"> / {totalEps}</span>}
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                      onClick={() => setEpisodesWatched(Math.max(0, episodesWatched - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                      <Slider
                        value={[episodesWatched]}
                        onValueChange={([v]) => setEpisodesWatched(v)}
                        max={totalEps || 100}
                        step={1}
                        className="py-2"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                      onClick={() => setEpisodesWatched(Math.min(totalEps || 999, episodesWatched + 1))}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* User Score */}
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">
                    Your Score: <span className="text-yellow-400 font-bold">{userScore > 0 ? userScore : "—"}</span>/10
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() => setUserScore(n === userScore ? 0 : n)}
                        className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all duration-200 ${
                          n <= userScore
                            ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/40"
                            : "bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Notes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your personal notes..."
                    className="bg-slate-800 border-slate-700 text-slate-200 rounded-xl min-h-[80px]"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Tags (comma-separated)</label>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., favorite, must-rewatch, underrated"
                    className="bg-slate-800 border-slate-700 text-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Save Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleSave}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-base shadow-lg shadow-violet-500/20"
                >
                  {listEntry ? (
                    <><Check className="w-5 h-5 mr-2" /> Update Entry</>
                  ) : (
                    <><Plus className="w-5 h-5 mr-2" /> Add to My List</>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}