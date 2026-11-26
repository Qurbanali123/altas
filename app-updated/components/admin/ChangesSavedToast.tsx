"use client";

import { useEffect, useState } from "react";
import { CMS_SAVED_EVENT } from "@/utils/cmsLiveSync";

/** Listens for successful CMS saves and shows "Changes Saved." */
export default function ChangesSavedToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: number | null = null;

    const onSaved = () => {
      setVisible(true);
      if (hideTimer !== null) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setVisible(false), 2500);
    };

    window.addEventListener(CMS_SAVED_EVENT, onSaved);
    return () => {
      window.removeEventListener(CMS_SAVED_EVENT, onSaved);
      if (hideTimer !== null) window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-[9999] left-1/2 -translate-x-1/2 top-20 sm:top-24 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg pointer-events-none"
      style={{
        backgroundColor: "#591727",
        color: "#F4EEE1",
        border: "1px solid #D9C9A8",
      }}
    >
      Changes Saved.
    </div>
  );
}
