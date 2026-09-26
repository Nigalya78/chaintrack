import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChainTrack — Jewellery Inventory & Production Management",
  description: "Jewellery chain production and inventory tracking system",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
