import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "Chain Track",
  description: "Chain production and inventory tracking",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
