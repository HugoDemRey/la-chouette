"use client";

import type { ReactNode } from "react";

import { useRouter } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { ChevronLeftIcon } from "@/components/icons";
import { holePoints } from "@/lib/scoring";

const CASES_3: [string, number[]][] = [
  ["Tous différents", [4, 5, 6]],
  ["Deux meilleurs à égalité", [4, 4, 5]],
  ["Deux derniers à égalité", [4, 5, 5]],
  ["Tous à égalité", [4, 4, 4]],
];

const CASES_4: [string, number[]][] = [
  ["Tous différents", [3, 4, 5, 6]],
  ["Deux meilleurs à égalité", [4, 4, 5, 6]],
  ["Deux du milieu à égalité", [4, 5, 5, 6]],
  ["Deux derniers à égalité", [4, 5, 6, 6]],
  ["Deux paires", [4, 4, 5, 5]],
  ["Trois meilleurs à égalité", [4, 4, 4, 5]],
  ["Trois derniers à égalité", [4, 5, 5, 5]],
  ["Tous à égalité", [4, 4, 4, 4]],
];

const PLAYER_LETTERS = ["A", "B", "C", "D"];

export default function RulesPage() {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <>
      <AppHeader
        eyebrow="La Chouette"
        leading={
          <button
            aria-label="Retour"
            className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full"
            type="button"
            onClick={goBack}
          >
            <ChevronLeftIcon size={24} />
          </button>
        }
        title="Règles du jeu"
      />

      <main className="gutter mx-auto flex max-w-md flex-col gap-8 pt-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] leading-relaxed">
        <Section title="Le principe">
          <p>
            À chaque trou, les joueurs se partagent des points selon leur
            nombre de coups : <strong>6 points à 3 joueurs</strong>,{" "}
            <strong>12 points à 4 joueurs</strong>. Le moins de coups gagne le
            plus de points.
          </p>
          <p>
            Les joueurs à égalité se partagent les points des places qu’ils
            occupent. À 4 joueurs, deux premiers ex æquo prennent
            (6 + 4) ÷ 2 = 5 points chacun.
          </p>
        </Section>

        <Section title="À 3 joueurs">
          <p className="text-muted text-sm">
            1<sup>er</sup> 4 points, 2<sup>e</sup> 2 points, 3<sup>e</sup> 0
            point.
          </p>
          <CaseTable cases={CASES_3} />
        </Section>

        <Section title="À 4 joueurs">
          <p className="text-muted text-sm">
            1<sup>er</sup> 6 points, 2<sup>e</sup> 4 points, 3<sup>e</sup> 2
            points, 4<sup>e</sup> 0 point.
          </p>
          <CaseTable cases={CASES_4} />
        </Section>

        <Section title="Pendant la partie">
          <p>
            Le par n’est pas connu à l’avance : choisissez-le en arrivant sur
            chaque trou, puis saisissez les coups. Le premier appui propose le
            par, les boutons − et + ajustent. « X » signale une balle relevée.
          </p>
          <p>
            Sur la carte, un birdie est entouré d’un cercle, un bogey d’un
            carré, comme sur une carte papier. Glissez à gauche ou à droite
            pour changer de trou.
          </p>
        </Section>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="display text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function CaseTable({ cases }: { cases: [string, number[]][] }) {
  const players = cases[0][1].length;

  return (
    <div className="bg-surface border-line rounded-card overflow-hidden border text-sm tabular-nums">
      <div
        className="border-line text-muted grid border-b px-3 py-2 text-[10px] font-bold tracking-[0.08em] uppercase"
        style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${players}, 3rem)` }}
      >
        <span>Coups / points</span>
        {PLAYER_LETTERS.slice(0, players).map((letter) => (
          <span key={letter} className="text-center">
            {letter}
          </span>
        ))}
      </div>
      {cases.map(([label, strokes]) => (
        <div
          key={label}
          className="border-line grid items-center border-b px-3 py-2 last:border-b-0"
          style={{
            gridTemplateColumns: `minmax(0,1fr) repeat(${players}, 3rem)`,
          }}
        >
          <span className="pr-2 leading-tight">{label}</span>
          {holePoints(strokes)!.map((points, i) => (
            <span key={i} className="flex flex-col items-center leading-tight">
              <span className="text-muted text-xs">{strokes[i]}</span>
              <span className="display-num text-accent-strong text-lg">
                {points}
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
