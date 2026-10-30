import type { Game } from "@/lib/game";

export const MIN_STROKES = 1;
export const MAX_STROKES = 10;
export const PAR_OPTIONS = [3, 4, 5];

/**
 * Points given to each finishing place on a hole. Tied players share the
 * points of the places they occupy, e.g. two leaders at 4 players get
 * (6 + 4) / 2 = 5 each.
 */
const PLACE_POINTS: Record<number, number[]> = {
  3: [4, 2, 0],
  4: [6, 4, 2, 0],
};

export type ScoreMark = "eagle" | "birdie" | "par" | "bogey" | "double";

/** Points of each player on one hole, or null while a score is missing. */
export function holePoints(strokes: (number | null)[]): number[] | null {
  if (strokes.some((s) => s === null)) return null;

  const played = strokes as number[];
  const placePoints = PLACE_POINTS[played.length];
  const sorted = [...played].sort((a, b) => a - b);

  return played.map((s) => {
    const shared = placePoints.slice(
      sorted.indexOf(s),
      sorted.lastIndexOf(s) + 1,
    );

    return shared.reduce((a, b) => a + b, 0) / shared.length;
  });
}

export function isHoleComplete(game: Game, hole: number) {
  return (
    game.pars[hole] !== null && game.strokes[hole].every((s) => s !== null)
  );
}

export function completedHoles(game: Game) {
  return game.pars.filter((_, hole) => isHoleComplete(game, hole)).length;
}

/**
 * Running points of each player, simplified by removing the lowest total
 * from everyone, plus their rank (tied players share a rank).
 */
export function standings(game: Game) {
  const absolutePoints = game.players.map(() => 0);

  game.strokes.forEach((strokes, hole) => {
    const points = isHoleComplete(game, hole) ? holePoints(strokes) : null;

    points?.forEach((p, player) => (absolutePoints[player] += p));
  });

  const lowest = Math.min(...absolutePoints);
  const relativePoints = absolutePoints.map((p) => p - lowest);
  const ranks = relativePoints.map((p) => 1 + relativePoints.filter((o) => o > p).length);

  return { absolutePoints, relativePoints, ranks };
}

export function rankLabel(rank: number) {
  return rank === 1 ? "1er" : `${rank}e`;
}

export function formatStrokes(strokes: number) {
  return strokes === MAX_STROKES ? "X" : strokes.toString();
}

export function scoreTerm(strokes: number, par: number) {
  if (strokes === MAX_STROKES) return "Relevée";

  const diff = strokes - par;

  if (strokes === 1) return "Trou en un";
  if (diff <= -3) return "Albatros";
  if (diff === -2) return "Eagle";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double";

  return `+${diff}`;
}

export function scoreMark(strokes: number, par: number): ScoreMark {
  const diff = strokes - par;

  if (diff <= -2) return "eagle";
  if (diff === -1) return "birdie";
  if (diff === 0) return "par";
  if (diff === 1) return "bogey";

  return "double";
}
