import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DataImportExport({ myList, onImportComplete }) {
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(myList, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `anime-list-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error("Invalid format: expected an array of anime entries");
      }

      // Bulk create entries
      const entriesToImport = data.map(entry => ({
        mal_id: entry.mal_id,
        title: entry.title,
        image_url: entry.image_url,
        synopsis: entry.synopsis,
        score: entry.score,
        episodes_total: entry.episodes_total,
        episodes_watched: entry.episodes_watched || 0,
        user_score: entry.user_score,
        status: entry.status || "plan_to_watch",
        genres: entry.genres,
        studios: entry.studios,
        type: entry.type,
        aired: entry.aired,
        notes: entry.notes,
        tags: entry.tags,
        year: entry.year,
      }));

      await base44.entities.AnimeEntry.bulkCreate(entriesToImport);
      onImportComplete?.();
    } catch (error) {
      setImportError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle>Import / Export</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-400 mb-4">
            Export your anime list as JSON for backup, or import from a previous export.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExport}
              variant="outline"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export List
            </Button>

            <label>
              <Button
                as="span"
                variant="outline"
                className="bg-slate-800 border-slate-700 hover:bg-slate-700 cursor-pointer"
                disabled={isImporting}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? "Importing..." : "Import List"}
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                disabled={isImporting}
              />
            </label>
          </div>
        </div>

        {importError && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-300">{importError}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}