import React, { useEffect, useState, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { TrendingUp, Sparkles, ChevronRight, RefreshCw } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";

import AnimeGrid from "../components/anime/AnimeGrid";
import AnimeDetailModal from "../components/anime/AnimeDetailModal";
import ToastNotification from "../components/anime/ToastNotification";
import ContinueWatching from "../components/home/ContinueWatching";
import RecommendationSection from "../components/recommendations/RecommendationSection.jsx";
import { useTrendingAnime, useTopAnime, useSeasonalAnime } from "../components/anime/useJikanApi";

export default function Home() {
  const { animeId } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullY = useMotionValue(0);
  const pullProgress = useTransform(pullY, [0, 100], [0, 1]);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const { trending, isLoading: trendingLoading, fetchTrending } = useTrendingAnime();
  const { topAnime, isLoading: topLoading, fetchTop } = useTopAnime();
  const { seasonal, isLoading: seasonalLoading, fetchSeasonal } = useSeasonalAnime();

  const { data: myList = [] } = useQuery({
    queryKey: ["animeEntries"],
    queryFn: () => base44.entities.AnimeEntry.list(),
  });

  useEffect(() => {
    fetchTrending();
    const timer1 = setTimeout(() => fetchSeasonal(), 600);
    const timer2 = setTimeout(() => fetchTop(), 1200);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTrending(), fetchSeasonal(), fetchTop()]);
    setIsRefreshing(false);
  };

  const handleTouchStart = (e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling.current || containerRef.current?.scrollTop !== 0) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) {
      pullY.set(Math.min(diff, 120));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    const currentPull = pullY.get();
    if (currentPull > 80) {
      await handleRefresh();
    }
    animate(pullY, 0, { type: "spring", stiffness: 300, damping: 30 });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const selectedAnime = animeId
    ? [...trending, ...seasonal, ...topAnime].find((a) => a.mal_id === parseInt(animeId))
    : null;

  const handleSelectAnime = (anime) => {
    navigate(`${createPageUrl("Home")}/${anime.mal_id}`);
  };

  const handleCloseModal = () => {
    navigate(createPageUrl("Home"));
  };

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.AnimeEntry.create(data),
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: ["animeEntries"] });
      const previousEntries = queryClient.getQueryData(["animeEntries"]);
      queryClient.setQueryData(["animeEntries"], (old = []) => [
        ...old,
        { ...newEntry, id: `temp-${Date.now()}`, created_date: new Date().toISOString() },
      ]);
      return { previousEntries };
    },
    onError: (err, newEntry, context) => {
      queryClient.setQueryData(["animeEntries"], context.previousEntries);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["animeEntries"] });
    },
    onSuccess: () => {
      showToast("Added to your list!", "success");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AnimeEntry.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["animeEntries"] });
      const previousEntries = queryClient.getQueryData(["animeEntries"]);
      queryClient.setQueryData(["animeEntries"], (old = []) =>
        old.map((entry) => (entry.id === id ? { ...entry, ...data } : entry))
      );
      return { previousEntries };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["animeEntries"], context.previousEntries);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["animeEntries"] });
    },
    onSuccess: () => {
      showToast("Entry updated!", "success");
    },
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(null), 3000);
  };

  const handleQuickAdd = (anime) => {
    const entry = myList.find(e => e.mal_id === anime.mal_id);
    if (entry) {
      // +1 episode
      const newWatched = Math.min((entry.episodes_watched || 0) + 1, entry.episodes_total || 999);
      updateMutation.mutate({ id: entry.id, data: { episodes_watched: newWatched } });
      showToast(`Episode ${newWatched} watched!`, "success");
    } else {
      // Add to list
      const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
      addMutation.mutate({
        mal_id: anime.mal_id,
        title: anime.title,
        image_url: imageUrl,
        score: anime.score || 0,
        episodes_total: anime.episodes || 0,
        episodes_watched: 0,
        status: "plan_to_watch",
        genres: anime.genres?.map(g => g.name).join(", ") || "",
        studios: anime.studios?.map(s => s.name).join(", ") || "",
        type: anime.type || "",
        synopsis: (anime.synopsis || "").substring(0, 2000),
      });
    }
  };

  const getListEntry = (anime) => myList.find(e => e.mal_id === (anime.mal_id));

  const SectionHeader = ({ icon: Icon, title, color, linkTo }) => (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-100">{title}</h2>
      </div>
      {linkTo && (
        <Link to={createPageUrl(linkTo)} className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors">
          See all <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen pb-24 overflow-auto">
      {/* Pull to Refresh Indicator */}
      <motion.div
        style={{ y: pullY }}
        className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
      >
        <motion.div
          style={{ opacity: pullProgress, scale: pullProgress }}
          className="mt-4 bg-violet-500/20 backdrop-blur-md rounded-full p-3 border border-violet-500/30"
        >
          <RefreshCw className={`w-5 h-5 text-violet-400 ${isRefreshing ? "animate-spin" : ""}`} />
        </motion.div>
      </motion.div>

      {/* Hero */}
      <div className="relative overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-slate-900 to-purple-900/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-500/10 rounded-full blur-3xl" />
        <div className="relative px-4 sm:px-6 pt-12 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent mb-3 tracking-tight">
              AniTrack
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
              Discover, track, and manage your anime journey
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        {/* Continue Watching */}
        <ContinueWatching
          myList={myList}
          onSelect={handleSelectAnime}
          onQuickAdd={handleQuickAdd}
          listEntries={myList}
        />

        {/* Recommendations */}
        <RecommendationSection
          myList={myList}
          trendingAnime={trending}
          onSelect={handleSelectAnime}
          onQuickAdd={handleQuickAdd}
          listEntries={myList}
        />

        {/* Trending Now */}
        <section>
          <SectionHeader icon={TrendingUp} title="Trending Now" color="bg-rose-500/20 text-rose-400" />
          <AnimeGrid
            animeList={trending.slice(0, 12)}
            onSelect={handleSelectAnime}
            onQuickAdd={handleQuickAdd}
            listEntries={myList}
            emptyMessage={trendingLoading ? "Loading trending anime..." : "No trending anime found"}
          />
        </section>

        {/* This Season */}
        <section>
          <SectionHeader icon={Sparkles} title="This Season" color="bg-amber-500/20 text-amber-400" />
          <AnimeGrid
            animeList={seasonal.slice(0, 12)}
            onSelect={handleSelectAnime}
            onQuickAdd={handleQuickAdd}
            listEntries={myList}
            emptyMessage={seasonalLoading ? "Loading seasonal anime..." : "No seasonal anime found"}
          />
        </section>
      </div>

      <AnimeDetailModal
        anime={selectedAnime}
        isOpen={!!selectedAnime}
        onClose={handleCloseModal}
        onAddToList={(data) => addMutation.mutate(data)}
        onUpdateEntry={(id, data) => updateMutation.mutate({ id, data })}
        listEntry={selectedAnime ? getListEntry(selectedAnime) : null}
      />

      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}