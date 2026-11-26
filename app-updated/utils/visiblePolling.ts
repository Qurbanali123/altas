import { subscribeCmsUpdated } from "@/utils/cmsLiveSync";
import { invalidateClientCache } from "@/utils/clientFetchCache";

/** Default dashboard/API refresh when the tab is visible. */
export const DASHBOARD_POLL_MS = 60_000;

/** Public CMS pages — refresh while tab is open so dashboard edits appear live.
 * Keep this modest: many parallel polls overwhelm shared hosting. */
export const PUBLIC_CMS_POLL_MS = 30_000;

/**
 * Poll on an interval only while the document tab is visible.
 * Still refreshes immediately on mount, window focus, and CMS dashboard saves
 * (same-origin tabs via BroadcastChannel / localStorage).
 */
export function setupVisiblePolling(
  load: () => void | Promise<void>,
  intervalMs: number = DASHBOARD_POLL_MS,
): () => void {
  let intervalId: number | null = null;

  const runIfVisible = () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }
    void load();
  };

  const startInterval = () => {
    if (intervalId !== null) return;
    intervalId = window.setInterval(runIfVisible, intervalMs);
  };

  const stopInterval = () => {
    if (intervalId === null) return;
    window.clearInterval(intervalId);
    intervalId = null;
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      stopInterval();
      return;
    }
    runIfVisible();
    startInterval();
  };

  runIfVisible();
  startInterval();
  window.addEventListener("focus", runIfVisible);
  document.addEventListener("visibilitychange", onVisibilityChange);
  const stopCms = subscribeCmsUpdated(() => {
    invalidateClientCache("public:");
    void load();
  });

  return () => {
    stopInterval();
    stopCms();
    window.removeEventListener("focus", runIfVisible);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}
