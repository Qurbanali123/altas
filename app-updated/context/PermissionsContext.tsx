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
import { setAuth, getToken, getAdmin, endDashboardSession, validateAuthSession } from "@/utils/auth";
import type { AdminSession } from "@/utils/auth";
import { canEdit, canView } from "@/utils/permissions";
interface PermissionsContextValue {
  session: AdminSession | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  canViewModule: (moduleKey: string) => boolean;
  canEditModule: (moduleKey: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(() => {
    if (typeof window === "undefined") return null;
    return getAdmin();
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return !getAdmin();
  });

  const refreshSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      endDashboardSession();
      setSession(null);
      setLoading(false);
      return;
    }

    const hasCachedSession = Boolean(getAdmin());

    try {
      if (!hasCachedSession) {
        setLoading(true);
      }

      const admin = await validateAuthSession();
      if (!admin) {
        setSession(null);
        return;
      }
      setSession(admin);
      setAuth(token, admin);
    } catch {
      endDashboardSession();
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const value = useMemo<PermissionsContextValue>(
    () => ({
      session,
      loading,
      refreshSession,
      canViewModule: (moduleKey: string) =>
        canView(
          session?.permissions,
          moduleKey,
          Boolean(session?.isSuperAdmin || session?.roleSlug === "super-admin")
        ),
      canEditModule: (moduleKey: string) =>
        canEdit(
          session?.permissions,
          moduleKey,
          Boolean(session?.isSuperAdmin || session?.roleSlug === "super-admin")
        ),
    }),
    [session, loading, refreshSession]
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within PermissionsProvider");
  }
  return context;
}
