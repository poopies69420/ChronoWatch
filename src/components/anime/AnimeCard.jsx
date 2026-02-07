import React from "react";
import { Star, Plus, Play, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function AnimeCard({ anime, onSelect, onQuickAdd, isInList, listEntry }) {
  const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || anime.image_url;
  const title = anime.title || anime.title_english;
  const score = anime.score || 0;
  const episodes = anime.episodes || anime.episodes_total || "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative cursor-pointer"
      onClick={() => onSelect(anime)}
    >
      {/* Card Container */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 shadow-lg shadow-black/20 hover:shadow-violet-500/10 hover:border-violet-500/30 transition-all duration-500">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80" />

          {/* Score Badge */}
          {score > 0 && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-yellow-500/30">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-yellow-50">{score.toFixed(1)}</span>
            </div>
          )}

          {/* In List Badge */}
          {isInList && (
            <div className="absolute top-3 right-3 bg-violet-500/80 backdrop-blur-md p-1.5 rounded-full">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          )}

          {/* Quick Add Button */}
          {onQuickAdd && isInList && listEntry && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(listEntry);
              }}
              className="absolute bottom-16 right-3 bg-violet-500 hover:bg-violet-400 text-white p-2.5 rounded-full shadow-lg shadow-violet-500/30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
              title="+1 Episode"
            >
              <Play className="w-4 h-4 fill-white" />
            </motion.button>
          )}

          {/* Add to List Button */}
          {onQuickAdd && !isInList && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(anime);
              }}
              className="absolute bottom-16 right-3 bg-emerald-500 hover:bg-emerald-400 text-white p-2.5 rounded-full shadow-lg shadow-emerald-500/30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
              title="Add to List"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Info */}
        <div className="p-3 pb-4">
          <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 leading-tight mb-1.5">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {episodes !== "?" ? `${episodes} eps` : "Ongoing"}
            </span>
            {listEntry && (
              <span className="text-xs text-violet-400 font-medium">
                {listEntry.episodes_watched || 0}/{listEntry.episodes_total || "?"}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}