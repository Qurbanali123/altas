import { invalidateClientCache } from "@/utils/clientFetchCache";

/** Cross-tab signal when dashboard CMS content is saved. */

const CHANNEL = "atlas-cms-updated";
const STORAGE_KEY = "atlas-cms-updated-at";

/** Same-tab dashboard toast: "Changes Saved." */
export const CMS_SAVED_EVENT = "atlas-cms-saved";

export type CmsUpdatePayload = {
  key?: string;
  at: number;
};

function canUseBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Call after a successful dashboard CMS save so open public tabs refresh. */
export function notifyCmsUpdated(key?: string): void {
  if (!canUseBrowser()) return;
  invalidateClientCache("public:");
  const payload: CmsUpdatePayload = { key, at: Date.now() };

  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage(payload);
    bc.close();
  } catch {
    /* BroadcastChannel unsupported */
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* private mode / quota */
  }

  window.dispatchEvent(new CustomEvent(CMS_SAVED_EVENT, { detail: payload }));
}

/** Subscribe to CMS save signals (same origin tabs). Returns unsubscribe. */
export function subscribeCmsUpdated(
  onUpdate: (payload: CmsUpdatePayload) => void,
): () => void {
  if (!canUseBrowser()) return () => {};

  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = (event) => {
      const data = event.data as CmsUpdatePayload | undefined;
      if (data && typeof data.at === "number") onUpdate(data);
    };
  } catch {
    bc = null;
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      const data = JSON.parse(event.newValue) as CmsUpdatePayload;
      if (data && typeof data.at === "number") onUpdate(data);
    } catch {
      /* ignore */
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    bc?.close();
    window.removeEventListener("storage", onStorage);
  };
}
