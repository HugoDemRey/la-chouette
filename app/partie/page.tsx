"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import Scoreboard from "./components/Scoreboard";

function PartieContent() {
  const searchParams = useSearchParams();
  const { players, is18Holes } = {
    players: JSON.parse(searchParams.get("players") || "[]") as string[],
    is18Holes: searchParams.get("is18Holes") === "true" ? true : false,
  };

  useEffect(() => {
    document.body.style.zoom = "reset";
  }, []);

  return <Scoreboard is18Holes={is18Holes} players={players} />;
}

export default function PartiePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartieContent />
    </Suspense>
  );
}
