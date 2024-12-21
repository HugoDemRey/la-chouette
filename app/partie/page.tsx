"use client";
import { useSearchParams } from "next/navigation";

import { title } from "@/components/primitives";

export default function PartiePage() {
  const searchParams = useSearchParams();
  const { players, is18Holes } = {
    players: JSON.parse(searchParams.get("players") || "[]") as string[],
    is18Holes: searchParams.get("is18Holes"),
  };

  return (
    <div>
      <h1 className={title()}>{is18Holes ? "18 Trous" : "9 Trous"}</h1>
      <ul>
        {players.map((item, index) => (
          <li key={index}>
            {index + 1}. {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
