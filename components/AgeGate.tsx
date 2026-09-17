"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

const EXIT_URL = "https://www.google.com";
const FADE_MS = 500;

/**
 * Asks for the visitor's age on every full page load; nothing is remembered.
 * It is server-rendered open, so the site is never visible before the question.
 */
export default function AgeGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"open" | "closing" | "closed">("open");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (status === "open") dialogRef.current?.focus();
  }, [status]);

  // Coming back through the back/forward cache is a new visit too
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setStatus("open");
    };
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const confirm = () => {
    setStatus("closing");
    closeTimerRef.current = window.setTimeout(() => setStatus("closed"), FADE_MS);
  };

  // replace() keeps the gate out of history, so Back from Google doesn't return here
  const leave = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.location.replace(EXIT_URL);
  };

  return (
    <>
      <div className="contents" inert={status !== "closed"}>
        {children}
      </div>

      {status !== "closed" && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-title"
          tabIndex={-1}
          // Scroll is locked in CSS; this tells Lenis to leave the wheel alone as well
          data-lenis-prevent
          data-age-gate
          className={`fixed inset-0 z-[300] flex items-center justify-center bg-[#0A0909] px-6 outline-none transition-opacity ease-out ${
            status === "closing" ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          <div className="w-full max-w-md text-center motion-safe:animate-[age-gate-in_1s_cubic-bezier(0.16,1,0.3,1)_both]">
            <p className="font-serif text-lg font-medium uppercase tracking-[0.34em] text-[#F5F2EB] sm:text-xl">
              Domaine Auris
            </p>
            <div className="mx-auto mt-6 h-px w-12 bg-[#C5A059]/60" />

            <h2
              id="age-gate-title"
              className="mt-8 font-serif text-3xl font-light leading-snug text-[#F5F2EB] text-balance sm:text-4xl lg:text-[2.75rem]"
            >
              Are you 18 years of age or older?
            </h2>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={confirm}
                className="cursor-pointer border border-[#C5A059]/50 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#DFBA73] transition-colors duration-300 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A0909] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#C5A059]"
              >
                Yes
              </button>
              <a
                href={EXIT_URL}
                onClick={leave}
                className="border border-white/15 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#A89F91] transition-colors duration-300 hover:border-white/40 hover:text-[#F5F2EB] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/40"
              >
                No
              </a>
            </div>

            <p className="mt-10 font-serif text-sm italic text-[#8C827A]">Please enjoy responsibly.</p>
          </div>
        </div>
      )}
    </>
  );
}
