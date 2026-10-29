"use client";

import { useEffect } from "react";

import { AppHeader } from "@/components/app-header";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    /* eslint-disable no-console */
    console.error(error);
  }, [error]);

  return (
    <>
      <AppHeader title="Oups" />
      <main className="gutter mx-auto flex max-w-md flex-col gap-4 py-8">
        <p className="text-muted">
          Une erreur inattendue est survenue. Votre partie est enregistrée sur
          ce téléphone : réessayez pour la retrouver.
        </p>
        <button
          className="bg-primary text-primary-ink rounded-card h-12 font-bold"
          type="button"
          onClick={() => reset()}
        >
          Réessayer
        </button>
      </main>
    </>
  );
}
