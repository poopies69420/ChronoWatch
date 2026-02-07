import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Library, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";

import AnimeGrid from "../components/anime/AnimeGrid";
import AnimeDetailModal from "../components/anime/AnimeDetailModal";
import StatusTabs from "../components/anime/StatusTabs";
import ToastNotification from "../components/anime/ToastNotification";

export default function MyList() {
  const { animeId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [toast, setToast] = useState(null);
  const queryClient = useQueryClient();

  const { data: myList = [], isLoading } = useQuery({
    queryKey: ["animeEntries"],
    queryFn: () => base44.entities.AnimeEntry.list(),
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

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AnimeEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animeEntries"] });
      showToast("Removed from list", "success");
    },
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(null), 3000);
  };

  const counts = useMemo(() => {
    const c = { watching: 0, completed: 0, plan_to_watch: 0, dropped: 0 };
    myList.forEach(e => { if (c[e.status] !== undefined) c[e.status]++; });
    return c;
  }, [myList]);

  const filteredList = useMemo(() => {
    if (activeTab === "all") return myList;
    return myList.filter(e => e.status === activeTab);
  }, [myList, activeTab]);

  // Transform list entries to look like Jikan results for the grid
  const animeForGrid = filteredList.map(entry => ({
    mal_id: entry.mal_id,
    title: entry.title,
    images: { jpg: { large_image_url: entry.image_url, image_url: entry.image_url } },
    image_url: entry.image_url,
    score: entry.score,
    episodes: entry.episodes_total,
    episodes_total: entry.episodes_total,
    synopsis: entry.synopsis,
    genres_str: entry.genres,
    studios_str: entry.studios,
    type: entry.type,
    aired: entry.aired,
  }));

  const handleQuickAdd = (item) => {
    // If it's a list entry (has id), increment episode
    if (item.id) {
      const newWatched = Math.min((item.episodes_watched || 0) + 1, item.episodes_total || 999);
      updateMutation.mutate({ id: item.id, data: { episodes_watched: newWatched } });
      showToast(`Episode ${newWatched} watched!`, "success");
    }
  };

  const handleSelectAnime = (anime) => {
    navigate(`${createPageUrl("MyList")}/${anime.mal_id}`);
  };

  const handleCloseModal = () => {
    navigate(createPageUrl("MyList"));
  };

  const getListEntry = (anime) => myList.find(e => e.mal_id === anime.mal_id);

  const selectedAnime = animeId ? animeForGrid.find((a) => a.mal_id === parseInt(animeId)) : null;

  // Stats
  const totalEpisodes = myList.reduce((sum, e) => sum + (e.episodes_watched || 0), 0);
  const avgScore = myList.filter(e => e.user_score > 0).length > 0
    ? (myList.filter(e => e.user_score > 0).reduce((sum, e) => sum + e.user_score, 0) / myList.filter(e => e.user_score > 0).length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 sm:px-6 max-w-7xl mx-auto pt-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-violet-500/20">
              <Library className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">My List</h1>
              <p className="text-xs text-slate-500">{myList.length} anime · {totalEpisodes} episodes · Avg score: {avgScore}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6">
          <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
        </div>

        {/* Grid */}
        <AnimeGrid
          animeList={animeForGrid}
          onSelect={handleSelectAnime}
          onQuickAdd={handleQuickAdd}
          listEntries={myList}
          emptyMessage={
            activeTab === "all"
              ? "Your list is empty. Start adding anime from the Home or Search pages!"
              : `No anime with "${activeTab.replace("_", " ")}" status`
          }
        />
      </div>

      <AnimeDetailModal
        anime={selectedAnime}
        isOpen={!!selectedAnime}
        onClose={handleCloseModal}
        onAddToList={() => {}}
        onUpdateEntry={(id, data) => updateMutation.mutate({ id, data })}
        listEntry={selectedAnime ? getListEntry(selectedAnime) : null}
      />

      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}