export type HoleCount = 9 | 18;

export interface Game {
  players: string[];
  holeCount: HoleCount;
  /** Par of each hole, entered by the players as they reach it. */
  pars: (number | null)[];
  /** Strokes per hole, then per player. */
  strokes: (number | null)[][];
  currentHole: number;
  /** ISO date; missing on games saved before version 2. */
  startedAt?: string;
}

const STORAGE_KEY = "la-chouette:partie";
const LEGACY_KEYS = ["scores", "pars", "currentLink"];

export function createGame(players: string[], holeCount: HoleCount): Game {
  return {
    players,
    holeCount,
    pars: Array(holeCount).fill(null),
    strokes: Array.from({ length: holeCount }, () =>
      Array(players.length).fill(null),
    ),
    currentHole: 0,
    startedAt: new Date().toISOString(),
  };
}

export function loadGame(): Game | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved ? (JSON.parse(saved) as Game) : migrateLegacyGame();
  } catch {
    return null;
  }
}

export function saveGame(game: Game) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  } catch {
    // Storage full or blocked: the game keeps working for this session.
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Nothing to clear.
  }
}

/** Picks up a game saved by version 1, which kept players in the URL. */
function migrateLegacyGame(): Game | null {
  const link = localStorage.getItem("currentLink");

  if (!link) return null;

  const params = new URL(link).searchParams;
  const players = JSON.parse(params.get("players") ?? "[]") as string[];

  if (players.length < 3 || players.length > 4) return null;

  const game = createGame(
    players,
    params.get("is18Holes") === "true" ? 18 : 9,
  );
  const pars = JSON.parse(localStorage.getItem("pars") ?? "[]") as number[];
  const scores = JSON.parse(
    localStorage.getItem("scores") ?? "[]",
  ) as number[][];
  const orNull = (n: number) => (n > 0 ? n : null);

  if (pars.length === game.holeCount && scores.length === game.holeCount) {
    game.pars = pars.map(orNull);
    game.strokes = scores.map((row) => row.map(orNull));
    const next = game.pars.findIndex(
      (par, hole) => par === null || game.strokes[hole].includes(null),
    );

    game.currentHole = next === -1 ? game.holeCount - 1 : next;
  }

  saveGame(game);
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));

  return game;
}
