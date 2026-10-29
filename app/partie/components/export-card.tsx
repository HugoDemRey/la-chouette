import type { Game } from "@/lib/game";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { cardFileName, renderCardImage } from "@/lib/card-image";
import { completedHoles } from "@/lib/scoring";

type Preview =
  | { status: "rendering" }
  | { status: "ready"; file: File; url: string }
  | { status: "error" };

const buttonClass =
  "rounded-card flex h-12 items-center justify-center font-bold transition-opacity disabled:opacity-50";

/** "Nouvelle partie" and "Exporter la carte", with a check for unfinished games. */
export function CardActions({ game }: { game: Game }) {
  const [confirming, setConfirming] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const confirmBox = useRef<HTMLDivElement>(null);
  const played = completedHoles(game);

  useEffect(() => {
    if (confirming)
      confirmBox.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [confirming]);

  const open = async () => {
    setConfirming(false);
    setPreview({ status: "rendering" });
    try {
      const blob = await renderCardImage(game);
      const file = new File([blob], cardFileName(game), { type: "image/png" });

      setPreview({ status: "ready", file, url: URL.createObjectURL(blob) });
    } catch {
      setPreview({ status: "error" });
    }
  };

  const close = () => {
    if (preview?.status === "ready") URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  if (confirming)
    return (
      <div
        ref={confirmBox}
        className="bg-surface border-line rounded-card mt-4 flex flex-col gap-3 border p-4"
      >
        <p className="text-sm">
          La partie n’est pas terminée ({played} trou{played > 1 ? "s" : ""}{" "}
          sur {game.holeCount}). La carte sera exportée en l’état.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`${buttonClass} border-line bg-bg border`}
            type="button"
            onClick={() => setConfirming(false)}
          >
            Annuler
          </button>
          <button
            className={`${buttonClass} bg-primary text-primary-ink`}
            type="button"
            onClick={open}
          >
            Exporter
          </button>
        </div>
      </div>
    );

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link className={`${buttonClass} border-line bg-surface border`} href="/">
          Nouvelle partie
        </Link>
        <button
          className={`${buttonClass} bg-primary text-primary-ink`}
          type="button"
          onClick={() => (played === game.holeCount ? open() : setConfirming(true))}
        >
          Exporter la carte
        </button>
      </div>
      {preview && <PreviewDialog preview={preview} onClose={close} />}
    </>
  );
}

function PreviewDialog({
  preview,
  onClose,
}: {
  preview: Preview;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [shareFailed, setShareFailed] = useState(false);
  const file = preview.status === "ready" ? preview.file : null;
  const canShare = !!file && !!navigator.canShare?.({ files: [file] });

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const download = () => {
    if (preview.status !== "ready") return;
    const link = document.createElement("a");

    link.href = preview.url;
    link.download = preview.file.name;
    link.click();
  };

  const share = async () => {
    if (!file) return;
    if (!canShare) return download();
    try {
      await navigator.share({ files: [file], title: "Carte de La Chouette" });
    } catch (e) {
      if ((e as Error).name !== "AbortError") setShareFailed(true);
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-label="Carte à exporter"
      className="bg-bg text-ink m-0 h-dvh max-h-none w-full max-w-none p-0 backdrop:bg-black/60"
      onCancel={onClose}
    >
      <div className="gutter mx-auto flex h-full max-w-md flex-col gap-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <h2 className="display text-2xl">Carte à exporter</h2>
          <button
            className="text-muted px-2 py-1 font-bold"
            type="button"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>

        <div className="border-line rounded-card bg-surface flex min-h-0 flex-1 items-center justify-center overflow-hidden border p-2">
          {preview.status === "rendering" && (
            <p className="text-muted text-sm">Préparation de la carte…</p>
          )}
          {preview.status === "error" && (
            <p className="text-danger px-4 text-center text-sm">
              La carte n’a pas pu être créée. Fermez cet écran et réessayez.
            </p>
          )}
          {preview.status === "ready" && (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img
              alt="Carte de score de la partie"
              className="max-h-full max-w-full rounded-[calc(var(--radius)-4px)] object-contain"
              src={preview.url}
            />
          )}
        </div>

        {shareFailed && (
          <p className="text-muted text-sm">
            Le partage n’a pas fonctionné.{" "}
            <button className="text-ink font-bold underline" type="button" onClick={download}>
              Télécharger l’image
            </button>
          </p>
        )}
        <button
          className={`${buttonClass} bg-primary text-primary-ink`}
          disabled={preview.status !== "ready"}
          type="button"
          onClick={share}
        >
          {canShare || preview.status !== "ready" ? "Partager ou enregistrer" : "Enregistrer l’image"}
        </button>
      </div>
    </dialog>
  );
}
