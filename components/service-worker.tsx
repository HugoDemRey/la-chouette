"use client";

import { useEffect } from "react";

/** Registers the offline service worker in production builds. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Without it the app still works, just not offline.
      });
  }, []);

  return null;
}
