import type { Game } from "@/lib/game";

import { useRef } from "react";
import clsx from "clsx";

import { TAB_BAR_SPACE } from "./tab-bar";

import { AppHeader } from "@/components/app-header";
import {
  CardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
} from "@/components/icons";
import { PlayerAvatar } from "@/components/player-avatar";
import {
  MAX_STROKES,
  MIN_STROKES,
  PAR_OPTIONS,
  formatStrokes,
  holePoints,
  isHoleComplete,
  rankLabel,
  scoreTerm,
  standings,
} from "@/lib/scoring";

const SWIPE_DISTANCE = 60;

interface HoleViewProps {
  game: Game;
  update: (recipe: (game: Game) => Game) => void;
  onShowCard: () => void;
}

export function HoleView({ game, update, onShowCard }: HoleViewProps) {
  const hole = game.currentHole;
  const par = game.pars[hole];
  const strokes = game.strokes[hole];
  const { absolutePoints, relativePoints, ranks } = standings(game);
  const pointsThisHole = isHoleComplete(game, hole)
    ? holePoints(strokes)
    : null;
  const isLast = hole === game.holeCount - 1;
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const goTo = (target: number) => {
    if (target < 0 || target >= game.holeCount) return;
    update((g) => ({ ...g, currentHole: target }));
  };

  const setPar = (value: number) =>
    update((g) => ({
      ...g,
      pars: g.pars.map((p, i) => (i === hole ? value : p)),
    }));

  const setStrokes = (player: number, value: number) => {
    navigator.vibrate?.(8);
    update((g) => ({
      ...g,
      strokes: g.strokes.map((row, i) =>
        i === hole ? row.map((s, j) => (j === player ? value : s)) : row,
      ),
    }));
  };

  return (
    <div
      onTouchEnd={(e) => {
        const start = touchStart.current;
        const touch = e.changedTouches[0];

        if (!start) return;
        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;

        if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dy) < SWIPE_DISTANCE)
          goTo(hole + (dx < 0 ? 1 : -1));
      }}
      onTouchStart={(e) => {
        const touch = e.touches[0];

        touchStart.current = { x: touch.clientX, y: touch.clientY };
      }}
    >
      <AppHeader
        aside={
          <div className="bg-accent text-accent-ink rounded-card min-w-12 px-3 py-1.5 text-center leading-none">
            <span className="block text-[9px] font-bold tracking-[0.08em] uppercase opacity-85">
              Par
            </span>
            <span className="display-num text-2xl">{par ?? "?"}</span>
          </div>
        }
        className="sticky top-0 z-10"
        eyebrow={`Trou ${hole + 1} sur ${game.holeCount}`}
        title={`Trou ${hole + 1}`}
      >
        <HoleProgress game={game} onSelect={goTo} />
      </AppHeader>

      <main
        className={clsx(
          "gutter mx-auto flex max-w-md flex-col gap-3 pt-4",
          TAB_BAR_SPACE,
        )}
      >
        <section
          aria-labelledby="par-label"
          className={clsx(
            "bg-surface rounded-card flex items-center justify-between gap-3 border p-3 transition-colors",
            par === null ? "border-accent ring-accent/25 ring-4" : "border-line",
          )}
        >
          <div className="min-w-0">
            <h2
              className="text-muted text-[11px] font-bold tracking-[0.1em] uppercase"
              id="par-label"
            >
              Par du trou
            </h2>
            <p className="mt-0.5 text-sm leading-snug">
              {par === null
                ? "Choisissez le par pour saisir les coups."
                : "Modifiable à tout moment."}
            </p>
          </div>
          <div
            aria-labelledby="par-label"
            className="flex shrink-0 gap-1.5"
            role="radiogroup"
          >
            {PAR_OPTIONS.map((option) => (
              <button
                key={option}
                aria-checked={par === option}
                className={clsx(
                  "display-num rounded-card size-11 border text-xl transition-colors",
                  par === option
                    ? "bg-primary text-primary-ink border-transparent"
                    : "border-line bg-bg",
                )}
                role="radio"
                type="button"
                onClick={() => setPar(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <h2 className="text-muted mt-2 px-1 text-[11px] font-bold tracking-[0.1em] uppercase">
          Coups
        </h2>
        <ul className="flex flex-col gap-2">
          {game.players.map((name, player) => (
            <li
              key={player}
              className={clsx(
                "bg-surface border-line rounded-card grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border p-3 transition-opacity",
                par === null && "opacity-55",
              )}
            >
              <PlayerAvatar index={player} name={name} />
              <div className="min-w-0">
                <p className="line-clamp-2 text-[15px] leading-tight font-bold break-words">
                  {name}
                </p>
                <p className="text-muted mt-1 flex flex-wrap items-center gap-x-1.5 text-xs">
                  <span className="text-ink font-bold">
                    {rankLabel(ranks[player])}
                  </span>
                  <span>{absolutePoints[player]} pts</span>
                  {pointsThisHole && (
                    <span className="bg-accent text-accent-ink rounded px-1 font-bold">
                      +{pointsThisHole[player]}
                    </span>
                  )}
                </p>
              </div>
              <StrokeStepper
                name={name}
                par={par}
                value={strokes[player]}
                onChange={(value) => setStrokes(player, value)}
              />
            </li>
          ))}
        </ul>

        <div className="mt-2 grid grid-cols-[1fr_2fr] gap-2">
          <button
            aria-label="Trou précédent"
            className="border-line bg-surface rounded-card flex h-12 items-center justify-center gap-1 border font-bold disabled:opacity-40"
            disabled={hole === 0}
            type="button"
            onClick={() => goTo(hole - 1)}
          >
            <ChevronLeftIcon />
            {hole > 0 && hole}
          </button>
          {isLast ? (
            <button
              className="bg-primary text-primary-ink rounded-card flex h-12 items-center justify-center gap-2 font-bold"
              type="button"
              onClick={onShowCard}
            >
              <CardIcon />
              Voir la carte
            </button>
          ) : (
            <button
              className="bg-primary text-primary-ink rounded-card flex h-12 items-center justify-center gap-1 font-bold"
              type="button"
              onClick={() => goTo(hole + 1)}
            >
              Trou {hole + 2}
              <ChevronRightIcon />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function HoleProgress({
  game,
  onSelect,
}: {
  game: Game;
  onSelect: (hole: number) => void;
}) {
  return (
    <div
      className="gutter mx-auto grid max-w-md gap-[3px] pb-2"
      style={{ gridTemplateColumns: `repeat(${game.holeCount}, 1fr)` }}
    >
      {game.pars.map((_, hole) => (
        <button
          key={hole}
          aria-current={hole === game.currentHole ? "step" : undefined}
          aria-label={`Aller au trou ${hole + 1}`}
          className="group flex h-5 items-center"
          type="button"
          onClick={() => onSelect(hole)}
        >
          <span
            className={clsx(
              "h-1 w-full rounded-full transition-colors",
              hole === game.currentHole
                ? "bg-accent h-1.5"
                : isHoleComplete(game, hole)
                  ? "bg-head-ink/70"
                  : "bg-head-ink/20",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function StrokeStepper({
  name,
  par,
  value,
  onChange,
}: {
  name: string;
  par: number | null;
  value: number | null;
  onChange: (value: number) => void;
}) {
  const disabled = par === null;
  const stepClass =
    "grid size-10 place-items-center rounded-[calc(var(--radius)-2px)] border border-line bg-bg transition-transform active:scale-90 disabled:opacity-35 disabled:active:scale-100";

  return (
    <div className="flex items-center gap-1">
      <button
        aria-label={`Un coup de moins pour ${name}`}
        className={stepClass}
        disabled={disabled || value === MIN_STROKES}
        type="button"
        onClick={() => onChange(value === null ? par! - 1 : value - 1)}
      >
        <MinusIcon />
      </button>
      {value === null ? (
        <button
          aria-label={`Saisir le par pour ${name}`}
          className="flex w-13 flex-col items-center disabled:cursor-default"
          disabled={disabled}
          type="button"
          onClick={() => onChange(par!)}
        >
          <span className="display-num text-muted/60 text-[26px] leading-none">
            {par ?? "–"}
          </span>
          <span className="text-muted mt-1 text-[9px] font-bold tracking-[0.06em] uppercase">
            À saisir
          </span>
        </button>
      ) : (
        <output
          aria-label={`${name} : ${value} coups`}
          aria-live="polite"
          className="flex w-13 flex-col items-center"
        >
          <span className="display-num text-[26px] leading-none">
            {formatStrokes(value)}
          </span>
          <span className="text-muted mt-1 text-[9px] font-bold tracking-[0.06em] whitespace-nowrap uppercase">
            {par === null ? "" : scoreTerm(value, par)}
          </span>
        </output>
      )}
      <button
        aria-label={`Un coup de plus pour ${name}`}
        className={stepClass}
        disabled={disabled || value === MAX_STROKES}
        type="button"
        onClick={() => onChange(value === null ? par! + 1 : value + 1)}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
