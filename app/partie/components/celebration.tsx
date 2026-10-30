import type { Game } from "@/lib/game";

import { useEffect, useRef, useState } from "react";

import { TrophyIcon } from "@/components/icons";
import { OwlMark } from "@/components/owl-mark";
import { standings } from "@/lib/scoring";

const SUSPENSE_MS = 2600;
const GRAVITY = 0.12;
const COLOR_TOKENS = ["--accent", "--p1", "--p2", "--p3", "--p4", "--owl-eye"];

/** Full-screen winner reveal, played once when the last hole is done. */
export function Celebration({
  game,
  onDone,
}: {
  game: Game;
  onDone: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const { absolutePoints, ranks } = standings(game);
  const winners = game.players.filter((_, i) => ranks[i] === 1);
  const best = absolutePoints[ranks.indexOf(1)];

  useEffect(() => {
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveal = setTimeout(
      () => {
        setRevealed(true);
        navigator.vibrate?.([30, 60, 30, 60, 120]);
      },
      calm ? 0 : SUSPENSE_MS,
    );

    return () => clearTimeout(reveal);
  }, []);

  return (
    <div
      aria-live="assertive"
      className="bg-head/95 text-head-ink fixed inset-0 z-50 grid place-items-center overflow-hidden animate-[fade-in_300ms_ease-out_both]"
      role="dialog"
    >
      {revealed && <Fireworks />}

      <div className="gutter relative flex max-w-md flex-col items-center text-center">
        {revealed ? (
          <>
            <span className="bg-accent text-accent-ink grid size-16 place-items-center rounded-full animate-[pop-in_600ms_cubic-bezier(.2,1.6,.4,1)_both]">
              <TrophyIcon size={34} />
            </span>
            <p className="mt-5 text-xs font-bold tracking-[0.14em] uppercase opacity-80 animate-[rise-in_500ms_150ms_ease-out_both]">
              {winners.length === 1 ? "Vainqueur" : "Égalité"}
            </p>
            <p className="display mt-1 text-4xl leading-tight [overflow-wrap:anywhere] animate-[pop-in_700ms_250ms_cubic-bezier(.2,1.6,.4,1)_both]">
              {winners.join(" et ")}
            </p>
            <p className="display-num text-accent mt-2 text-2xl animate-[rise-in_500ms_500ms_ease-out_both]">
              {best} pts
            </p>
            <p className="mt-10 text-xs opacity-60 animate-[fade-in_600ms_2s_ease-out_both]">
              Touchez pour voir la carte
            </p>
          </>
        ) : (
          <>
            <OwlMark className="size-24 animate-[suspense_1.3s_ease-in-out_infinite]" />
            <p className="display mt-6 text-2xl">
              Et le vainqueur est
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="animate-[fade-in_200ms_ease-out_both]"
                  style={{ animationDelay: `${600 + i * 550}ms` }}
                >
                  .
                </span>
              ))}
            </p>
          </>
        )}
      </div>

      {revealed && (
        <button
          aria-label="Voir la carte"
          className="absolute inset-0"
          type="button"
          onClick={onDone}
        />
      )}
    </div>
  );
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  /** Rockets climb and burst; the other sparks just fall and fade. */
  rocket?: boolean;
}

/** Canvas fireworks in the theme colors, launched until the reveal closes. */
function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const style = getComputedStyle(document.documentElement);
    const colors = COLOR_TOKENS.map((token) =>
      style.getPropertyValue(token).trim(),
    ).filter(Boolean);
    const pick = () => colors[Math.floor(Math.random() * colors.length)];
    const sparks: Spark[] = [];
    let lastLaunch = -Infinity;
    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;

      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const launch = () =>
      sparks.push({
        x: width * (0.15 + Math.random() * 0.7),
        y: height,
        vx: (Math.random() - 0.5) * 1.5,
        // Enough speed to climb 50–75% of the screen before bursting.
        vy: -Math.sqrt(2 * GRAVITY * height * (0.5 + Math.random() * 0.25)),
        color: pick(),
        life: 1,
        rocket: true,
      });

    const burst = (x: number, y: number) => {
      const count = 60 + Math.floor(Math.random() * 30);
      const color = pick();

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 1.5 + Math.random() * 3.5;

        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() < 0.8 ? color : pick(),
          life: 1,
        });
      }
    };

    const tick = (now: number) => {
      if (now - lastLaunch > 380) {
        launch();
        if (Math.random() < 0.35) launch();
        lastLaunch = now;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];

        s.x += s.vx;
        s.y += s.vy;
        if (s.rocket) {
          s.vy += GRAVITY;
          if (s.vy > -1.5) {
            burst(s.x, s.y);
            sparks.splice(i, 1);
            continue;
          }
        } else {
          s.vx *= 0.97;
          s.vy = s.vy * 0.97 + 0.05;
          s.life -= 0.012;
          if (s.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }
        }
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.rocket ? 2.5 : 2, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}
