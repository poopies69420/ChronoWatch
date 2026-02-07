import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import AnimeGrid from "../anime/AnimeGrid";

export default function RecommendationSection({ myList, trendingAnime, onSelect, onQuickAdd, listEntries }) {
  const recommendations = useMemo(() => {
    if (!myList || myList.length === 0 || !trendingAnime) return [];

    // Get user's favorite genres from completed/watching anime
    const genreMap = {};
    myList
      .filter(a => a.status === "completed" || a.status === "watching")
      .forEach(anime => {
        if (anime.genres) {
          anime.genres.split(",").forEach(g => {
            const genre = g.trim();
            genreMap[genre] = (genreMap[genre] || 0) + 1;
          });
        }
      });

    const topGenres = Object.entries(genreMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name.toLowerCase());

    // Filter trending anime that match user's top genres
    const recommended = trendingAnime.filter(anime => {
      const alreadyInList = myList.some(m => m.mal_id === anime.mal_id);
      if (alreadyInList) return false;

      if (anime.genres && topGenres.length > 0) {
        const animeGenres = anime.genres.map(g => g.name.toLowerCase());
        return topGenres.some(topGenre => animeGenres.includes(topGenre));
      }
      return false;
    });

    return recommended.slice(0, 12);
  }, [myList, trendingAnime]);

  if (recommendations.length === 0) return null;

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimeGrid
          animeList={recommendations}
          onSelect={onSelect}
          onQuickAdd={onQuickAdd}
          listEntries={listEntries}
        />
      </CardContent>
    </Card>
  );
}