"use client";

import { useState, useEffect, type ComponentProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CurtainLink from "@/components/CurtainLink";

interface NavLinkData {
  name: string;
  href: string;
  /** Close the curtain over the page change, with the link's name on it */
  curtain: boolean;
}

function NavLink({ link, ...props }: { link: NavLinkData } & Omit<ComponentProps<typeof Link>, "href" | "ref">) {
  return link.curtain ? (
    <CurtainLink {...props} href={link.href} label="Domaine Auris" title={link.name} />
  ) : (
    <Link {...props} href={link.href} />
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks: NavLinkData[] = [
    { name: "The Collection", href: "/#collection", curtain: false },
    { name: "The Estate", href: "/estate", curtain: true },
    { name: "Visit", href: "/visit", curtain: true },
    { name: "Contact", href: "/contact", curtain: true },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0A0909]/90 backdrop-blur-md border-b border-white/[0.06] py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex flex-col">
          <span className="font-serif tracking-[0.34em] text-lg sm:text-xl font-medium text-[#F5F2EB] uppercase transition-colors duration-300 group-hover:text-[#DFBA73]">
            DOMAINE AURIS
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              link={link}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`relative text-xs tracking-[0.22em] uppercase hover:text-[#F5F2EB] transition-colors duration-300 py-1 group ${
                pathname === link.href ? "text-[#F5F2EB]" : "text-[#D0C8BC]"
              }`}
            >
              <span>{link.name}</span>
              <span
                className={`absolute bottom-0 left-0 h-[1px] bg-[#C5A059] transition-all duration-300 group-hover:w-full ${
                  pathname === link.href ? "w-full" : "w-0"
                }`}
              />
            </NavLink>
          ))}
        </nav>

        {/* Desktop Right CTA */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/contact#allocations"
            className="px-5 py-2.5 border border-[#C5A059]/50 hover:border-[#C5A059] text-[#DFBA73] hover:text-[#0A0909] hover:bg-[#C5A059] text-[11px] tracking-[0.22em] uppercase font-medium transition-all duration-300 shadow-[0_0_15px_rgba(197,160,89,0.1)] hover:shadow-[0_0_25px_rgba(197,160,89,0.3)]"
          >
            Reserve Vintage
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 space-y-1.5 focus:outline-none"
          aria-label="Toggle Menu"
          aria-expanded={mobileMenuOpen}
        >
          <span
            className={`block w-6 h-[1.5px] bg-[#F5F2EB] transition-transform duration-300 ${
              mobileMenuOpen ? "rotate-45 translate-y-[4.5px]" : ""
            }`}
          />
          <span
            className={`block w-6 h-[1.5px] bg-[#F5F2EB] transition-transform duration-300 ${
              mobileMenuOpen ? "-rotate-45 -translate-y-[3px]" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={`md:hidden absolute inset-x-0 top-full bg-[#0A0909]/98 backdrop-blur-xl border-b border-white/[0.08] transition-all duration-500 overflow-hidden ${
          mobileMenuOpen
            ? "max-h-[380px] opacity-100 py-8 px-6"
            : "max-h-0 opacity-0 py-0 px-6"
        }`}
      >
        <div className="flex flex-col space-y-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              link={link}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`font-serif text-2xl tracking-[0.08em] hover:text-[#DFBA73] transition-colors ${
                pathname === link.href ? "text-[#DFBA73]" : "text-[#F5F2EB]"
              }`}
            >
              {link.name}
            </NavLink>
          ))}
          <div className="pt-4 border-t border-white/[0.08]">
            <Link
              href="/contact#allocations"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-3 bg-[#C5A059] text-[#0A0909] text-xs uppercase tracking-[0.2em] font-medium"
            >
              Reserve Vintage
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}