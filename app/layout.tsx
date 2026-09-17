import type { Metadata } from "next";
import { Geist, Cormorant_Garamond, Cinzel } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import PourTransitionProvider from "@/components/PourTransition";
import AgeGate from "@/components/AgeGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DOMAINE AURIS | Rare Wine Collection",
  description: "Reserve wines from the foothills of the Lesser Caucasus in Tovuz, Azerbaijan. A fictional estate and design concept.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${cormorant.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090808] text-[#F3EFE6] selection:bg-[#C5A059]/30 selection:text-[#F3EFE6]">
        <SmoothScrollProvider>
          <PourTransitionProvider>
            <AgeGate>{children}</AgeGate>
          </PourTransitionProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
