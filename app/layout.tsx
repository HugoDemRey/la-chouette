import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";

import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { fontGrotesque, fontSans, fontSerif } from "@/config/fonts";
import { ServiceWorker } from "@/components/service-worker";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: siteConfig.themeColors.light,
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: siteConfig.themeColors.dark,
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={clsx(
        fontSans.variable,
        fontSerif.variable,
        fontGrotesque.variable,
      )}
      lang="fr"
    >
      <body className="bg-bg text-ink min-h-dvh font-sans antialiased">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
