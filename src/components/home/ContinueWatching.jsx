import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";
import AnimeGrid from "../anime/AnimeGrid";

export default function ContinueWatching({ myList, onSelect, onQuickAdd, listEntries }) {
  const continueWatching = useMemo(() => {
    if (!myList) return [];
    
    return myList
      .filter(anime => 
        anime.status === "watching" && 
        anime.episodes_watched < (anime.episodes_total || 999)
      )
      .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
      .slice(0, 12);
  }, [myList]);

  if (continueWatching.length === 0) return null;

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-violet-400" />
          Continue Watching
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimeGrid
          animeList={continueWatching}
          onSelect={onSelect}
          onQuickAdd={onQuickAdd}
          listEntries={listEntries}
        />
      </CardContent>
    </Card>
  );
}