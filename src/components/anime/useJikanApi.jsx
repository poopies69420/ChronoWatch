import { useState, useCallback } from "react";

const BASE_URL = "https://api.jikan.moe/v4";

// Simple rate limiter - Jikan allows ~3 requests/sec
let lastRequestTime = 0;
const MIN_INTERVAL = 400;

async function jikanFetch(url) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 429) {
      // Rate limited - wait and retry once
      await new Promise(resolve => setTimeout(resolve, 1500));
      const retryResponse = await fetch(url);
      if (!retryResponse.ok) throw new Error("Rate limited by Jikan API");
      return retryResponse.json();
    }
    throw new Error(`Jikan API error: ${response.status}`);
  }
  return response.json();
}

export function useSearchAnime() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (query) => {
    if (!query) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    const data = await jikanFetch(`${BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=24&sfw=true`);
    setResults(data.data || []);
    setIsLoading(false);
  }, []);

  return { results, isLoading, search };
}

export function useTrendingAnime() {
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTrending = useCallback(async () => {
    setIsLoading(true);
    const data = await jikanFetch(`${BASE_URL}/top/anime?filter=airing&limit=24&sfw=true`);
    setTrending(data.data || []);
    setIsLoading(false);
  }, []);

  return { trending, isLoading, fetchTrending };
}

export function useTopAnime() {
  const [topAnime, setTopAnime] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTop = useCallback(async () => {
    setIsLoading(true);
    const data = await jikanFetch(`${BASE_URL}/top/anime?limit=24&sfw=true`);
    setTopAnime(data.data || []);
    setIsLoading(false);
  }, []);

  return { topAnime, isLoading, fetchTop };
}

export function useSeasonalAnime() {
  const [seasonal, setSeasonal] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSeasonal = useCallback(async () => {
    setIsLoading(true);
    const data = await jikanFetch(`${BASE_URL}/seasons/now?limit=24&sfw=true`);
    setSeasonal(data.data || []);
    setIsLoading(false);
  }, []);

  return { seasonal, isLoading, fetchSeasonal };
}