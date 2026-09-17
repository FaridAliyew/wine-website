import Image from "next/image";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Shared building blocks for the editorial pages (Estate, Visit, Contact)

export const cinzel = { fontFamily: "var(--font-cinzel), serif" };

const focusRing =
  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#C5A059]";

export const textLinkClass = `text-[#DFBA73] border-b border-[#C5A059]/30 pb-0.5 transition-colors duration-300 hover:border-[#C5A059] hover:text-[#F5F2EB] ${focusRing}`;

export const outlineButtonClass = `inline-block px-8 py-3.5 border border-[#C5A059]/50 text-[11px] font-medium uppercase tracking-[0.22em] text-[#DFBA73] transition-colors duration-300 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A0909] ${focusRing}`;

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0A0909] text-[#F5F2EB] selection:bg-[#C5A059]/30 selection:text-[#F5F2EB]">
      <Navbar />
      <main className="pt-28 sm:pt-36 pb-20 sm:pb-28">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <header className="max-w-3xl mx-auto px-6 sm:px-10 text-center space-y-4 sm:space-y-6 mb-14 sm:mb-20">
      <p className="text-xs sm:text-sm font-mono tracking-[0.32em] text-[#C5A059] uppercase">{label}</p>
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-[0.08em] uppercase leading-tight" style={cinzel}>
        {title}
      </h1>
      <p className="text-base sm:text-lg font-light text-[#D0C8BC] italic font-serif max-w-xl mx-auto leading-relaxed text-balance">
        {children}
      </p>
      <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#C5A059]/60 to-transparent mx-auto" />
    </header>
  );
}

export function SectionHeading({ label, title, centered = false }: { label: string; title: string; centered?: boolean }) {
  return (
    <div className={`space-y-2 ${centered ? "text-center" : ""}`}>
      <span className="text-xs font-mono tracking-[0.3em] text-[#C5A059] uppercase block">{label}</span>
      <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-[#F5F2EB] uppercase" style={cinzel}>
        {title}
      </h2>
    </div>
  );
}

interface FramedImageProps {
  src: string;
  alt: string;
  /** Tailwind aspect-ratio classes for the frame */
  aspect: string;
  sizes: string;
  /** For the image at the top of a page: load it straight away */
  eager?: boolean;
}

export function FramedImage({ src, alt, aspect, sizes, eager = false }: FramedImageProps) {
  return (
    <div className="relative rounded-sm overflow-hidden border border-[#C5A059]/30 shadow-[0_30px_90px_rgba(0,0,0,0.95)] bg-[#110E0E]">
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#0A0909]/50 via-transparent to-transparent" />
      <div className={`relative w-full ${aspect}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          className="object-cover object-center brightness-[0.92] contrast-[1.05]"
        />
      </div>
      <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#C5A059]/60 pointer-events-none z-20" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#C5A059]/60 pointer-events-none z-20" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#C5A059]/60 pointer-events-none z-20" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#C5A059]/60 pointer-events-none z-20" />
    </div>
  );
}
