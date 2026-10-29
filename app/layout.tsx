import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "MarketMind AI · F&O Terminal", description: "A DEMO Indian derivatives research terminal." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
