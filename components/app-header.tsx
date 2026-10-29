import type { ReactNode } from "react";

import clsx from "clsx";

import { OwlMark } from "@/components/owl-mark";

interface AppHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Shown before the owl, e.g. a back button. */
  leading?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Top band of every screen; it runs under the status bar in the installed app. */
export function AppHeader({
  eyebrow,
  title,
  leading,
  aside,
  children,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={clsx(
        "bg-head text-head-ink pt-[env(safe-area-inset-top)]",
        className,
      )}
    >
      <div className="gutter mx-auto flex max-w-md items-center gap-3 pt-3 pb-4">
        {leading}
        <OwlMark className="size-10 shrink-0" />
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase opacity-75">
              {eyebrow}
            </p>
          )}
          <h1 className="display truncate text-[26px] leading-tight">
            {title}
          </h1>
        </div>
        {aside}
      </div>
      {children}
    </header>
  );
}
