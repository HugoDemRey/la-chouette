import type { Game } from "@/lib/game";

import { useState } from "react";
import clsx from "clsx";

import { CardActions } from "./export-card";
import { TAB_BAR_SPACE } from "./tab-bar";

import { AppHeader } from "@/components/app-header";
import { TrophyIcon } from "@/components/icons";
import { PlayerAvatar } from "@/components/player-avatar";
import {
  completedHoles,
  formatStrokes,
  holePoints,
  isHoleComplete,
  scoreMark,
  standings,
} from "@/lib/scoring";

const NINE = 9;

export function CardView({
  game,
  onSelectHole,
}: {
  game: Game;
  onSelectHole: (hole: number) => void;
}) {
  const [half, setHalf] = useState(game.currentHole < NINE ? 0 : 1);
  const { absolutePoints, relativePoints, ranks } = standings(game);
  const played = completedHoles(game);
  const isFinished = played === game.holeCount;
  const holes = Array.from(
    { length: Math.min(NINE, game.holeCount) },
    (_, i) => i + half * NINE,
  );
  const columns = {
    gridTemplateColumns: `2.25rem 2.25rem repeat(${game.players.length}, minmax(0, 1fr))`,
  };
  const halfStrokes = game.players.map((_, player) =>
    holes.reduce((sum, hole) => sum + (game.strokes[hole][player] ?? 0), 0),
  );
  const halfPar = holes.reduce((sum, hole) => sum + (game.pars[hole] ?? 0), 0);

  return (
    <>
      <AppHeader
        eyebrow={
          isFinished
            ? `${game.holeCount} trous · Terminée`
            : `${played} trou${played > 1 ? "s" : ""} joué${played > 1 ? "s" : ""} sur ${game.holeCount}`
        }
        title="Carte de score"
      />

      <main
        className={clsx(
          "gutter mx-auto flex max-w-md flex-col gap-3 pt-4",
          TAB_BAR_SPACE,
        )}
      >
        {isFinished && <Winner game={game} points={absolutePoints} ranks={ranks} />}

        {game.holeCount === 18 && (
          <div
            aria-label="Moitié du parcours"
            className="bg-surface border-line rounded-card grid grid-cols-2 gap-1 border p-1"
            role="tablist"
          >
            {["Aller 1–9", "Retour 10–18"].map((label, i) => (
              <button
                key={label}
                aria-selected={half === i}
                className={clsx(
                  "h-9 rounded-[calc(var(--radius)-3px)] text-sm font-bold transition-colors",
                  half === i ? "bg-primary text-primary-ink" : "text-muted",
                )}
                role="tab"
                type="button"
                onClick={() => setHalf(i)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="bg-surface border-line rounded-card overflow-hidden border tabular-nums">
          <div
            className="border-line text-muted grid border-b px-1 pt-3 pb-2 text-[10px] font-bold tracking-[0.04em] uppercase"
            style={columns}
          >
            <span className="self-end text-center">Trou</span>
            <span className="self-end text-center">Par</span>
            {game.players.map((name, i) => (
              <span
                key={i}
                className="flex min-w-0 flex-col items-center gap-1 px-0.5"
              >
                <PlayerAvatar className="size-6 text-[11px]" index={i} name={name} />
                <span className="text-ink text-center text-[11px] leading-tight tracking-normal normal-case [overflow-wrap:anywhere]">
                  {name}
                </span>
              </span>
            ))}
          </div>

          {holes.map((hole) => {
            const par = game.pars[hole];
            const holePts = isHoleComplete(game, hole)
              ? holePoints(game.strokes[hole])
              : null;

            return (
              <button
                key={hole}
                aria-label={`Ouvrir le trou ${hole + 1}`}
                className={clsx(
                  "border-line grid h-11 w-full items-center border-b px-1 last:border-b-0",
                  hole === game.currentHole && "bg-hl",
                )}
                style={columns}
                type="button"
                onClick={() => onSelectHole(hole)}
              >
                <span className="text-muted text-xs font-bold">{hole + 1}</span>
                <span className="text-accent-strong text-sm font-bold">
                  {par ?? "–"}
                </span>
                {game.strokes[hole].map((strokes, player) => (
                  <span key={player} className="flex justify-center">
                    {strokes === null || par === null ? (
                      <span className="text-muted/50">·</span>
                    ) : (
                      <span
                        className="score-mark text-sm"
                        data-mark={scoreMark(strokes, par)}
                      >
                        {formatStrokes(strokes)}
                        {holePts && (
                          <sup className="bg-accent text-accent-ink absolute -top-1.5 -right-2.5 rounded-[5px] px-[3px] text-[9px] leading-[1.2] font-extrabold">
                            {holePts[player]}
                          </sup>
                        )}
                      </span>
                    )}
                  </span>
                ))}
              </button>
            );
          })}

          <div
            className="border-ink grid items-center border-t-2 px-1 py-2 text-sm font-bold"
            style={columns}
          >
            <span className="text-muted col-span-1 text-center text-[10px] tracking-[0.04em] uppercase">
              Coups
            </span>
            <span className="text-accent-strong text-center">
              {halfPar || "–"}
            </span>
            {halfStrokes.map((total, i) => (
              <span key={i} className="text-center">
                {total || "–"}
              </span>
            ))}
          </div>
          <div
            className="bg-hl grid items-center px-1 py-2.5"
            style={columns}
          >
            <span className="text-muted col-span-2 pl-2 text-[10px] font-bold tracking-[0.04em] uppercase">
              Points
            </span>
            {absolutePoints.map((p, i) => (
              <span
                key={i}
                className={clsx(
                  "display-num text-center text-xl",
                  ranks[i] === 1 && played > 0 && "text-accent-strong",
                )}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="text-muted flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs">
          {(
            [
              ["birdie", "3", "Birdie"],
              ["bogey", "5", "Bogey"],
              ["double", "6", "Double bogey"],
            ] as const
          ).map(([mark, n, label]) => (
            <span key={mark} className="flex items-center gap-1.5">
              <span
                className="score-mark text-ink size-5 text-[10px]"
                data-mark={mark}
              >
                {n}
              </span>
              {label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="bg-accent text-accent-ink rounded-[5px] px-1 text-[10px] font-extrabold">
              4
            </span>
            Points du trou
          </span>
        </div>

        <CardActions game={game} />
      </main>
    </>
  );
}

function Winner({
  game,
  points,
  ranks,
}: {
  game: Game;
  points: number[];
  ranks: number[];
}) {
  const winners = game.players.filter((_, i) => ranks[i] === 1);
  const best = points[ranks.indexOf(1)];

  return (
    <section className="bg-primary text-primary-ink rounded-card flex items-center gap-3 p-4">
      <TrophyIcon size={28} />
      <div>
        <p className="text-xs font-bold tracking-[0.1em] uppercase opacity-80">
          Partie terminée
        </p>
        <p className="display text-xl">
          {winners.length === 1
            ? `${winners[0]} gagne avec ${best} pts`
            : `Égalité : ${winners.join(" et ")}`}
        </p>
      </div>
    </section>
  );
}
