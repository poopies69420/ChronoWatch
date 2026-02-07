import React from "react";
import AnimeCard from "./AnimeCard";

export default function AnimeGrid({ animeList, onSelect, onQuickAdd, listEntries = [], emptyMessage = "Nothing to show yet." }) {
  if (!animeList || animeList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-800/60 flex items-center justify-center mb-4">
          <span className="text-3xl">📺</span>
        </div>
        <p className="text-slate-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const getListEntry = (anime) => {
    const malId = anime.mal_id;
    return listEntries.find(e => e.mal_id === malId);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
      {animeList.map((anime, index) => {
        const entry = getListEntry(anime);
        return (
          <AnimeCard
            key={anime.mal_id || index}
            anime={anime}
            onSelect={onSelect}
            onQuickAdd={onQuickAdd}
            isInList={!!entry}
            listEntry={entry}
          />
        );
      })}
    </div>
  );
}