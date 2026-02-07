import React, { useState, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearch = useCallback(
    debounce((q) => {
      if (q.trim().length >= 3) {
        onSearch(q.trim());
      }
    }, 500),
    [onSearch]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    debouncedSearch(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length >= 3) {
      onSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl mx-auto">
      <motion.div
        animate={{
          boxShadow: isFocused ? "0 0 0 2px rgba(139, 92, 246, 0.3), 0 8px 32px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.2)",
        }}
        className="relative flex items-center bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl overflow-hidden transition-colors"
      >
        <div className="pl-4 pr-2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search anime titles..."
          className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 py-3.5 px-2 text-sm outline-none"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={clearSearch}
              className="pr-4 pl-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </form>
  );
}