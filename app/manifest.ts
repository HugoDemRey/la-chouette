import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Chouette",
    short_name: "La Chouette",
    description: "Jeu de Golf à plusieurs",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      // {
      //   src: "owl.png",
      //   sizes: "192x192",
      //   type: "image/png",
      // },
      {
        src: "/icon_512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
