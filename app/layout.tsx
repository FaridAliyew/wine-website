import type { Metadata } from "next";
import { Geist, Cormorant_Garamond, Cinzel } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import PourTransitionProvider from "@/components/PourTransition";
import AgeGate from "@/components/AgeGate";
import { Analytics } from "@vercel/analytics/next";

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
  metadataBase: new URL("https://wine-website-omega.vercel.app/"),

  title: "DOMAINE AURIS | Rare Wine Collection",

  description:
    "Reserve wines from the foothills of the Lesser Caucasus in Tovuz, Azerbaijan. A refined luxury wine estate and digital experience.",

  openGraph: {
    title: "DOMAINE AURIS | Rare Wine Collection",
    description:
      "Discover a refined collection of reserve wines inspired by the foothills of the Lesser Caucasus in Tovuz, Azerbaijan.",
    url: "https://wine-website-omega.vercel.app/",
    siteName: "Domaine Auris",
    type: "website",

    images: [
      {
        url: "/wine-og.png",
        width: 1200,
        height: 630,
        alt: "Domaine Auris luxury wine collection website",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "DOMAINE AURIS | Rare Wine Collection",
    description:
      "Discover a refined collection of reserve wines inspired by the foothills of the Lesser Caucasus.",
    images: ["/wine-og.png"],
  },
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
        <Analytics />
      </body>
    </html>
  );
}
