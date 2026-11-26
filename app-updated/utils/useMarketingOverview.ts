"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "@/utils/api";
import { getToken } from "@/utils/auth";
import {
  DEFAULT_MARKETING_OVERVIEW,
  mergeMarketingOverview,
  validateMarketingOverview,
  type MarketingOverview,
} from "@/utils/marketingData";
import { setupVisiblePolling } from "@/utils/visiblePolling";

const REFRESH_MS = 30_000;

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export type MarketingFetchState = {
  data: MarketingOverview;
  loading: boolean;
  error: string | null;
  lastFetchedAt: Date | null;
  refresh: () => Promise<void>;
};

export function useMarketingOverview(
  enabled = true,
  refreshIntervalMs = REFRESH_MS
): MarketingFetchState {
  const [data, setData] = useState<MarketingOverview>(DEFAULT_MARKETING_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const fetchingRef = useRef(false);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("Authentication required.");
      setLoading(false);
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const response = await fetch(apiUrl("/api/statistics/marketing-overview"), {
        headers: authHeaders(),
        cache: "no-store",
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(json.message || `Request failed (${response.status})`);
      }

      if (!validateMarketingOverview(json.data)) {
        throw new Error("Invalid marketing data received from server.");
      }

      setData(mergeMarketingOverview(json.data));
      setError(null);
      setLastFetchedAt(new Date());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load marketing data.";
      setError(message);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const load = async () => {
      if (!cancelled) await refresh();
    };

    const stopPolling = setupVisiblePolling(load, refreshIntervalMs);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [enabled, refresh, refreshIntervalMs]);

  return { data, loading, error, lastFetchedAt, refresh };
}
