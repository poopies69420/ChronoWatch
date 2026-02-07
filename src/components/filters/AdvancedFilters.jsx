import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function AdvancedFilters({ onFilterChange, initialFilters = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: initialFilters.type || "all",
    year: initialFilters.year || "all",
    genre: initialFilters.genre || "all",
    studio: initialFilters.studio || "all",
    minScore: initialFilters.minScore || 0,
    ...initialFilters,
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      type: "all",
      year: "all",
      genre: "all",
      studio: "all",
      minScore: 0,
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== "all" && v !== 0).length;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const genres = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery",
    "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"
  ];

  const studios = [
    "Bones", "Madhouse", "Studio Ghibli", "Kyoto Animation", "Wit Studio",
    "MAPPA", "Ufotable", "A-1 Pictures", "Trigger", "Production I.G"
  ];

  const types = ["TV", "Movie", "OVA", "ONA", "Special"];

  return (
    <div className="mb-6">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="bg-slate-800 border-slate-700 hover:bg-slate-700"
      >
        <Filter className="w-4 h-4 mr-2" />
        Advanced Filters
        {activeFilterCount > 0 && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-violet-500 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Type */}
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Type</label>
                    <Select value={filters.type} onValueChange={(v) => handleFilterChange("type", v)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">All Types</SelectItem>
                        {types.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Year</label>
                    <Select value={filters.year} onValueChange={(v) => handleFilterChange("year", v)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">All Years</SelectItem>
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Genre</label>
                    <Select value={filters.genre} onValueChange={(v) => handleFilterChange("genre", v)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">All Genres</SelectItem>
                        {genres.map(genre => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Studio */}
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Studio</label>
                    <Select value={filters.studio} onValueChange={(v) => handleFilterChange("studio", v)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">All Studios</SelectItem>
                        {studios.map(studio => (
                          <SelectItem key={studio} value={studio}>{studio}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Min Score */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-400 mb-2 block">
                      Minimum Score: {filters.minScore > 0 ? filters.minScore : "Any"}
                    </label>
                    <Slider
                      value={[filters.minScore]}
                      onValueChange={([v]) => handleFilterChange("minScore", v)}
                      max={10}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}