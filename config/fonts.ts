import { Figtree, Young_Serif } from "next/font/google";

export const fontSans = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

/** Display face of both themes. */
export const fontSerif = Young_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-young-serif",
});
