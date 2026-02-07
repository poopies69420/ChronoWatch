import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Search, Library, User, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", icon: Home, page: "Home" },
  { name: "Search", icon: Search, page: "SearchPage" },
  { name: "My List", icon: Library, page: "MyList" },
  { name: "Community", icon: Users, page: "Community" },
  { name: "Stats", icon: TrendingUp, page: "Statistics" },
  { name: "Profile", icon: User, page: "Profile" },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        :root {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 4.9%;
          --card-foreground: 210 40% 98%;
          --popover: 222.2 84% 4.9%;
          --popover-foreground: 210 40% 98%;
          --primary: 263.4 70% 50.4%;
          --primary-foreground: 210 40% 98%;
          --secondary: 217.2 32.6% 17.5%;
          --secondary-foreground: 210 40% 98%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
          --accent: 217.2 32.6% 17.5%;
          --accent-foreground: 210 40% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --input: 217.2 32.6% 17.5%;
          --ring: 263.4 70% 50.4%;
        }
        body {
          background-color: rgb(2, 6, 23);
          color: rgb(226, 232, 240);
          overscroll-behavior: none;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
        input, textarea, [contenteditable] {
          user-select: text;
          -webkit-user-select: text;
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.3) transparent;
        }
        *::-webkit-scrollbar {
          width: 6px;
        }
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        *::-webkit-scrollbar-thumb {
          background-color: rgba(100, 116, 139, 0.3);
          border-radius: 20px;
        }
      `}</style>

      {/* Page Content */}
      <main className="pb-20 sm:pb-0 sm:pl-20">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        <div className="bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/60">
          <div className="grid grid-cols-6 px-2 py-2">
            {navItems.map(({ name, icon: Icon, page }) => {
              const isActive = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="relative flex flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all"
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileNav"
                      className="absolute inset-0 bg-violet-500/15 rounded-2xl"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 transition-colors ${isActive ? "text-violet-400" : "text-slate-500"}`} />
                  <span className={`text-[9px] font-medium relative z-10 transition-colors ${isActive ? "text-violet-300" : "text-slate-500"}`}>
                    {name}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Safe area spacer for iOS */}
          <div className="h-safe-area-inset-bottom bg-slate-900/90" />
        </div>
      </nav>

      {/* Desktop Side Nav */}
      <nav className="hidden sm:flex fixed left-0 top-0 bottom-0 w-20 z-50 flex-col items-center py-6 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/60">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-8 shadow-lg shadow-violet-500/20">
          <span className="text-white font-bold text-sm">AT</span>
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          {navItems.map(({ name, icon: Icon, page }) => {
            const isActive = currentPageName === page;
            return (
              <Link
                key={page}
                to={createPageUrl(page)}
                className="relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all group"
                title={name}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktopNav"
                    className="absolute inset-0 bg-violet-500/15 rounded-2xl"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                <span className={`text-[9px] font-medium relative z-10 transition-colors ${isActive ? "text-violet-300" : "text-slate-600 group-hover:text-slate-400"}`}>
                  {name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}