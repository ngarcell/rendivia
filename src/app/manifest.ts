import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rendivia",
    short_name: "Rendivia",
    description: "Programmatic video generation for SaaS products.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icon.svg?v=3",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.ico?v=3",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

