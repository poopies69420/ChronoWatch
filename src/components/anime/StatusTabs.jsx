import React from "react";
import { motion } from "framer-motion";
import { Eye, CheckCircle2, Clock, XCircle, LayoutGrid } from "lucide-react";

const tabs = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "watching", label: "Watching", icon: Eye },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
  { key: "plan_to_watch", label: "Planned", icon: Clock },
  { key: "dropped", label: "Dropped", icon: XCircle },
];

export default function StatusTabs({ activeTab, onTabChange, counts = {} }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = activeTab === key;
        const count = key === "all"
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[key] || 0;

        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              isActive
                ? "text-white"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-violet-500/20 border border-violet-500/30 rounded-xl"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <Icon className={`w-4 h-4 relative z-10 ${isActive ? "text-violet-400" : ""}`} />
            <span className="relative z-10">{label}</span>
            {count > 0 && (
              <span className={`relative z-10 text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-violet-500/30 text-violet-300" : "bg-slate-700/60 text-slate-500"
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}