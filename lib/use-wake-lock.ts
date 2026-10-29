"use client";

import { useEffect } from "react";

/** Keeps the screen on while the page is visible, where the browser allows it. */
export function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;

    const request = async () => {
      if (!("wakeLock" in navigator) || document.visibilityState !== "visible")
        return;
      try {
        lock = await navigator.wakeLock.request("screen");
      } catch {
        // Refused (battery saver, unsupported context): the round goes on.
      }
    };

    request();
    document.addEventListener("visibilitychange", request);

    return () => {
      document.removeEventListener("visibilitychange", request);
      lock?.release().catch(() => {});
    };
  }, []);
}
