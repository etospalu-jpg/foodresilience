import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NADI Pangan",
    short_name: "NADI",
    description: "Food Resilience Monitoring, Evaluation & Learning",
    start_url: "/overview",
    display: "standalone",
    background_color: "#F5F6F3",
    theme_color: "#123C32",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
  };
}
