"use client";

import Link from "next/link";

export default function Footer() {
  const navLinks = [
    { name: "The Collection", href: "/#collection" },
    { name: "The Estate", href: "/estate" },
    { name: "Visit", href: "/visit" },
    { name: "Reserve Vintage", href: "/contact#allocations" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <footer className="relative bg-[#0A0909] text-[#F5F2EB] border-t border-white/[0.08] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[180px] bg-[radial-gradient(ellipse_at_top,_rgba(197,160,89,0.08)_0%,_rgba(94,13,27,0.05)_50%,_transparent_75%)] pointer-events-none" />

      {/* Top subtle golden hairline accent */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#C5A059]/35 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-14 sm:py-16 flex flex-col items-center text-center">
        
        {/* Brand Emblem & Heritage */}
        <Link href="/" className="group inline-flex flex-col items-center space-y-2">
          <span
            className="text-2xl sm:text-3xl font-medium tracking-[0.38em] uppercase text-[#F5F2EB] transition-colors duration-300 group-hover:text-[#DFBA73]"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            DOMAINE AURIS
          </span>
          <span className="text-xs font-mono tracking-[0.28em] text-[#C5A059] uppercase">
            Grand Cru Terroir · Tovuz, Azerbaijan
          </span>
        </Link>

        {/* Minimalist Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-8 sm:mt-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative text-xs tracking-[0.22em] uppercase text-[#A89F91] hover:text-[#F5F2EB] transition-colors duration-300 py-1 group"
            >
              <span>{link.name}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C5A059] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Delicate Golden Divider */}
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent my-8 sm:my-10" />

        {/* Legal & Responsible Savoring */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-[#6C635B]">
          <span>© {new Date().getFullYear()} Domaine Auris · A design concept; the estate and its wines are fictional.</span>
          <span className="hidden sm:inline text-white/10">·</span>
          <span className="italic text-[#8C827A] font-serif">
            Please savor responsibly. Legal drinking age required.
          </span>
        </div>

      </div>
    </footer>
  );
}
