import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function ToastNotification({ toast, onDismiss }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
  };

  const bgColors = {
    success: "bg-emerald-500/10 border-emerald-500/30",
    error: "bg-red-500/10 border-red-500/30",
  };

  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className={`fixed top-4 left-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl backdrop-blur-xl border shadow-2xl shadow-black/30 ${bgColors[toast.type] || bgColors.success}`}
        >
          {icons[toast.type] || icons.success}
          <span className="text-sm font-medium text-slate-100">{toast.message}</span>
          <button onClick={onDismiss} className="ml-2 text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}