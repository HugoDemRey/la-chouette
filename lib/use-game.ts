"use client";

import { useCallback, useSyncExternalStore } from "react";

import { type Game, clearGame, loadGame, saveGame } from "@/lib/game";

const listeners = new Set<() => void>();
/** undefined until local storage has been read. */
let current: Game | null | undefined;

function subscribe(listener: () => void) {
  const onStorage = () => {
    current = undefined;
    listener();
  };

  listeners.add(listener);
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  if (current === undefined) current = loadGame();

  return current;
}

const getServerSnapshot = () => undefined;

/** Replaces the saved game (or clears it) and refreshes every screen using it. */
export function setStoredGame(game: Game | null) {
  current = game;
  if (game) saveGame(game);
  else clearGame();
  listeners.forEach((listener) => listener());
}

/** The game saved on this phone; `isLoaded` is false during the first render. */
export function useGame() {
  const game = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const update = useCallback((recipe: (game: Game) => Game) => {
    const prev = getSnapshot();

    if (prev) setStoredGame(recipe(prev));
  }, []);

  return { game: game ?? null, isLoaded: game !== undefined, update };
}
