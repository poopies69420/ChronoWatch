import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";

import SearchBar from "../components/anime/SearchBar";
import AnimeGrid from "../components/anime/AnimeGrid";
import AnimeDetailModal from "../components/anime/AnimeDetailModal";
import ToastNotification from "../components/anime/ToastNotification";
import AdvancedFilters from "../components/filters/AdvancedFilters";
import { useSearchAnime } from "../components/anime/useJikanApi";

export default function SearchPage() {
  const { animeId } = useParams();
  const navigate = useNavigate();
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({});
  const queryClient = useQueryClient();

  const { results, isLoading, search } = useSearchAnime();

  const { data: myList = [] } = useQuery({
    queryKey: ["animeEntries"],
    queryFn: () => base44.entities.AnimeEntry.list(),
  });

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

  const handleSearch = (query) => {
    if (query) {
      setHasSearched(true);
      search(query);
    } else {
      setHasSearched(false);
    }
  };

  const handleQuickAdd = (anime) => {
    const entry = myList.find(e => e.mal_id === anime.mal_id);
    if (entry) {
      const newWatched = Math.min((entry.episodes_watched || 0) + 1, entry.episodes_total || 999);
      updateMutation.mutate({ id: entry.id, data: { episodes_watched: newWatched } });
      showToast(`Episode ${newWatched} watched!`, "success");
    } else {
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

  const getListEntry = (anime) => myList.find(e => e.mal_id === anime.mal_id);

  const filteredResults = results.filter(anime => {
    if (filters.type && filters.type !== "all" && anime.type !== filters.type) return false;
    if (filters.year && filters.year !== "all" && !anime.aired?.string?.includes(filters.year)) return false;
    if (filters.genre && filters.genre !== "all") {
      const hasGenre = anime.genres?.some(g => g.name === filters.genre);
      if (!hasGenre) return false;
    }
    if (filters.studio && filters.studio !== "all") {
      const hasStudio = anime.studios?.some(s => s.name === filters.studio);
      if (!hasStudio) return false;
    }
    if (filters.minScore > 0 && (anime.score || 0) < filters.minScore) return false;
    return true;
  });

  const selectedAnime = animeId ? results.find((a) => a.mal_id === parseInt(animeId)) : null;

  const handleSelectAnime = (anime) => {
    navigate(`${createPageUrl("SearchPage")}/${anime.mal_id}`);
  };

  const handleCloseModal = () => {
    navigate(createPageUrl("SearchPage"));
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 sm:px-6 max-w-7xl mx-auto pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-slate-100 mb-6">Search Anime</h1>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          {hasSearched && (
            <div className="mt-4">
              <AdvancedFilters onFilterChange={setFilters} />
            </div>
          )}
        </motion.div>

        {/* Results */}
        {!hasSearched ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-slate-800/60 flex items-center justify-center mb-5">
              <Search className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm mb-1">Search for any anime</p>
            <p className="text-slate-600 text-xs">Type at least 3 characters to start</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-slate-500 mb-4">
              {isLoading ? "Searching..." : `${filteredResults.length} result${filteredResults.length !== 1 ? "s" : ""} found`}
            </p>
            <AnimeGrid
              animeList={filteredResults}
              onSelect={handleSelectAnime}
              onQuickAdd={handleQuickAdd}
              listEntries={myList}
              emptyMessage={isLoading ? "Searching..." : "No results found. Try adjusting your filters."}
            />
          </div>
        )}
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