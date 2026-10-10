import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "@/app/globals.css";
import "lenis/dist/lenis.css";

import { AppMotionProvider } from "@/components/motion/app-motion-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Microtec License Manager",
  description: "License and subscription management for Microtec",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.variable}>
        <AppMotionProvider>{children}</AppMotionProvider>
      </body>
    </html>
  );
}
