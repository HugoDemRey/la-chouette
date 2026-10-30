"use client";

import type { Game, HoleCount } from "@/lib/game";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { OwlMark } from "@/components/owl-mark";
import { PlayerAvatar } from "@/components/player-avatar";
import { createGame } from "@/lib/game";
import { completedHoles, standings } from "@/lib/scoring";
import { setStoredGame, useGame } from "@/lib/use-game";

const MAX_PLAYERS = 4;
const MIN_PLAYERS = 3;
const MAX_NAME_LENGTH = 20;

export default function Home() {
  const router = useRouter();
  const { game } = useGame();
  const [holeCount, setHoleCount] = useState<HoleCount>(18);
  const [names, setNames] = useState<string[]>(Array(MAX_PLAYERS).fill(""));
  const [confirmReplace, setConfirmReplace] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const players = names.map((n) => n.trim()).filter(Boolean);
  const hasDuplicate =
    new Set(players.map((n) => n.toLowerCase())).size !== players.length;
  const missing = MIN_PLAYERS - players.length;
  const canStart = missing <= 0 && !hasDuplicate;

  const start = () => {
    setStoredGame(createGame(players, holeCount));
    router.push("/partie");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canStart) return;
    if (game && !confirmReplace) {
      setConfirmReplace(true);

      return;
    }
    start();
  };

  const setName = (index: number, value: string) => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
    setConfirmReplace(false);
  };

  return (
    <>
      <header className="bg-head text-head-ink dimples pt-[env(safe-area-inset-top)]">
        <div className="gutter mx-auto flex max-w-md items-center gap-4 pt-8 pb-9">
          <OwlMark className="size-[72px] shrink-0" />
          <div>
            <h1 className="display text-[40px] leading-none">
              {siteConfig.name}
            </h1>
            <p className="mt-2 text-sm opacity-80">{siteConfig.description}</p>
          </div>
        </div>
      </header>

      <main className="gutter mx-auto flex max-w-md flex-col gap-8 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {game && <ResumeCard game={game} />}

        <form noValidate className="flex flex-col gap-6" onSubmit={onSubmit}>
          <h2 className="display text-2xl">Nouvelle partie</h2>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-muted mb-2 text-xs font-bold tracking-[0.1em] uppercase">
              Parcours
            </legend>
            <div className="bg-surface border-line rounded-card grid grid-cols-2 gap-1 border p-1">
              {([9, 18] as const).map((count) => (
                <label
                  key={count}
                  className={clsx(
                    "flex h-11 items-center justify-center rounded-[calc(var(--radius)-3px)] font-bold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--accent)]",
                    holeCount === count
                      ? "bg-primary text-primary-ink"
                      : "text-muted",
                  )}
                >
                  <input
                    checked={holeCount === count}
                    className="sr-only"
                    name="holes"
                    type="radio"
                    onChange={() => setHoleCount(count)}
                  />
                  {count} trous
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-muted mb-2 text-xs font-bold tracking-[0.1em] uppercase">
              Joueurs
            </legend>
            {names.map((name, i) => (
              <label
                key={i}
                className="bg-surface border-line rounded-card focus-within:border-accent flex items-center gap-3 border py-1.5 pr-3 pl-1.5 transition-colors"
              >
                <PlayerAvatar
                  className="size-9 text-sm"
                  index={i}
                  name={name}
                />
                <span className="sr-only">Joueur {i + 1}</span>
                <input
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  autoCapitalize="words"
                  autoComplete="off"
                  className="placeholder:text-muted/70 h-9 min-w-0 flex-1 bg-transparent text-base outline-none"
                  enterKeyHint={i < MAX_PLAYERS - 1 ? "next" : "go"}
                  maxLength={MAX_NAME_LENGTH}
                  placeholder={
                    i < MIN_PLAYERS
                      ? `Joueur ${i + 1}`
                      : `Joueur ${i + 1} (facultatif)`
                  }
                  value={name}
                  onChange={(e) => setName(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && i < MAX_PLAYERS - 1) {
                      e.preventDefault();
                      inputs.current[i + 1]?.focus();
                    }
                  }}
                />
              </label>
            ))}
          </fieldset>

          <div className="flex flex-col gap-3">
            <p
              aria-live="polite"
              className={clsx(
                "min-h-5 text-sm",
                hasDuplicate ? "text-danger" : "text-muted",
              )}
            >
              {hasDuplicate
                ? "Deux joueurs ont le même nom : ajoutez une initiale pour les distinguer."
                : missing > 0
                  ? `Ajoutez encore ${missing} joueur${missing > 1 ? "s" : ""} pour commencer.`
                  : confirmReplace
                    ? "La partie en cours sera remplacée."
                    : `${players.length} joueurs · ${holeCount} trous`}
            </p>
            {confirmReplace ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="border-line bg-surface rounded-card h-13 border font-bold"
                  type="button"
                  onClick={() => setConfirmReplace(false)}
                >
                  Annuler
                </button>
                <button
                  className="bg-danger rounded-card h-13 font-bold text-[var(--surface)]"
                  type="submit"
                >
                  Remplacer
                </button>
              </div>
            ) : (
              <button
                className="bg-primary text-primary-ink rounded-card h-13 text-base font-bold transition-opacity disabled:opacity-40"
                disabled={!canStart}
                type="submit"
              >
                Commencer la partie
              </button>
            )}
          </div>
        </form>

        <footer className="text-muted border-line flex items-center justify-between border-t pt-4 text-sm">
          <Link className="text-ink font-semibold underline-offset-4 hover:underline" href="/regles-du-jeu">
            Règles du jeu
          </Link>
          <span>Version {siteConfig.version}</span>
        </footer>
      </main>
    </>
  );
}

function ResumeCard({ game }: { game: Game }) {
  const { absolutePoints, relativePoints, ranks } = standings(game);
  const played = completedHoles(game);
  const leaders = game.players.filter((_, i) => ranks[i] === 1);

  return (
    <section className="bg-surface border-line rounded-card flex flex-col gap-4 border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-accent-strong text-xs font-bold tracking-[0.1em] uppercase">
            Partie en cours
          </p>
          <h2 className="display mt-1 text-xl">
            Trou {game.currentHole + 1}{" "}
            <span className="text-muted font-sans text-base font-medium">
              sur {game.holeCount}
            </span>
          </h2>
        </div>
        <div className="flex -space-x-1">
          {game.players.map((name, i) => (
            <PlayerAvatar
              key={i}
              className="ring-surface size-8 text-xs ring-2"
              index={i}
              name={name}
            />
          ))}
        </div>
      </div>
      <p className="text-muted text-sm">
        {played === 0
          ? game.players.join(", ")
          : leaders.length === 1
            ? `${leaders[0]} mène avec ${absolutePoints[game.players.indexOf(leaders[0])]} pts.`
            : `${leaders.join(" et ")} sont à égalité en tête.`}
      </p>
      <Link
        className="bg-primary text-primary-ink rounded-card flex h-12 items-center justify-center font-bold"
        href="/partie"
      >
        Reprendre la partie
      </Link>
    </section>
  );
}
