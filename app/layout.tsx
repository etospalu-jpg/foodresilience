import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "NADI Pangan", template: "%s · NADI Pangan" },
  description: "Food Resilience Monitoring, Evaluation & Learning platform for intervention traceability and decision intelligence.",
  applicationName: "NADI Pangan",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#123C32" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
