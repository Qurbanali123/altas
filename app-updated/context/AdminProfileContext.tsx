"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getToken } from "@/utils/auth";
import { fetchSettingsOverview } from "@/utils/settingsApi";
import type { SettingsProfile } from "@/utils/settingsData";

type AdminProfileContextValue = {
  profile: SettingsProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<SettingsProfile | null>;
  setProfile: (profile: SettingsProfile) => void;
};

const AdminProfileContext = createContext<AdminProfileContextValue | null>(null);

const ADMIN_PROFILE_CACHE_KEY = "admin_profile_cache";

function readCachedProfile(): SettingsProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ADMIN_PROFILE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as SettingsProfile) : null;
  } catch {
    return null;
  }
}

function writeCachedProfile(profile: SettingsProfile): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ADMIN_PROFILE_CACHE_KEY, JSON.stringify(profile));
  } catch {
    // ignore quota errors
  }
}

export function AdminProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<SettingsProfile | null>(() => readCachedProfile());
  const [loading, setLoading] = useState(() => !readCachedProfile());

  const refreshProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const data = await fetchSettingsOverview();
      setProfile(data.profile);
      writeCachedProfile(data.profile);
      return data.profile;
    } catch (error) {
      console.error("Failed to load admin profile:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const value = useMemo(
    () => ({
      profile,
      loading,
      refreshProfile,
      setProfile,
    }),
    [profile, loading, refreshProfile]
  );

  return (
    <AdminProfileContext.Provider value={value}>
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile() {
  const context = useContext(AdminProfileContext);
  if (!context) {
    throw new Error("useAdminProfile must be used within AdminProfileProvider");
  }
  return context;
}
