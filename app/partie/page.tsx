"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CardView } from "./components/card-view";
import { Celebration } from "./components/celebration";
import { HoleView } from "./components/hole-view";
import { TabBar, type View } from "./components/tab-bar";

import { siteConfig } from "@/config/site";
import { completedHoles } from "@/lib/scoring";
import { useGame } from "@/lib/use-game";
import { useWakeLock } from "@/lib/use-wake-lock";

export default function PartiePage() {
  const router = useRouter();
  const { game, isLoaded, update } = useGame();
  const [view, setView] = useState<View>("trou");
  const [celebrating, setCelebrating] = useState(false);

  useWakeLock();

  useEffect(() => {
    if (isLoaded && !game) router.replace("/");
  }, [isLoaded, game]);

  if (!game) return <div className="bg-head h-28" />;

  const show = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0 });
  };

  const goToHole = (hole: number) => {
    update((g) => ({ ...g, currentHole: hole }));
    show("trou");
  };

  const showCard = () => {
    const isFinished = completedHoles(game) === game.holeCount;

    if (isFinished && !game.celebrated) {
      update((g) => ({ ...g, celebrated: true }));
      setCelebrating(true);
    } else if (siteConfig.devMode && siteConfig.devForceWinnerAnimation) {
      setCelebrating(true);
    }
    show("carte");
  };

  return (
    <>
      {view === "trou" ? (
        <HoleView game={game} update={update} onShowCard={showCard} />
      ) : (
        <CardView game={game} onSelectHole={goToHole} />
      )}
      <TabBar view={view} onChange={setView} />
      {celebrating && (
        <Celebration game={game} onDone={() => setCelebrating(false)} />
      )}
    </>
  );
}
