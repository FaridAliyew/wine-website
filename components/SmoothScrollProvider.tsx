"use client";

import { createContext, useContext, useEffect, useRef, type RefObject } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

/** The shared Lenis instance, e.g. to stop() page scrolling under a full-screen overlay */
export function useLenis() {
  return useContext(LenisContext);
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  // Seeded with the first pathname so the effect below only fires on real navigation
  const lastPathname = useRef(pathname);

  useEffect(() => {
    // Let the browser put the visitor back where they were on reload / back-forward.
    // Set explicitly: scrollRestoration sticks to history entries created earlier.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "auto";
    }

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    let rafId = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    });

    // Adopt the document's real scroll offset so Lenis doesn't drag the page back to 0
    const syncToDocument = () => {
      lenis.resize();
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    };

    syncToDocument();
    // Browsers apply their restored offset around the load event, after Lenis is built
    window.addEventListener("load", syncToDocument);

    // A reload or back-forward carries its own scroll offset, which outranks the hash
    const navEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isRestoringScroll =
      navEntry?.type === "reload" || navEntry?.type === "back_forward";

    const hash = window.location.hash;
    let hashTimer: ReturnType<typeof setTimeout> | undefined;
    if (hash && !isRestoringScroll) {
      hashTimer = setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          lenis.scrollTo(target as HTMLElement, { immediate: true });
        }
      }, 100);
    }

    return () => {
      window.removeEventListener("load", syncToDocument);
      clearTimeout(hashTimer);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Route change: scroll to the hash, or to the top. Skipped on the initial render
  // (and on its StrictMode replay) so a refresh keeps the restored position.
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;

    const timer = setTimeout(() => {
      const lenis = lenisRef.current;
      // Lenis still holds the previous page's height, which would clamp the scroll target
      lenis?.resize();

      const hash = window.location.hash;
      if (hash && lenis) {
        const target = document.querySelector(hash);
        if (target) {
          lenis.scrollTo(target as HTMLElement, { offset: 0, duration: 0.8 });
          return;
        }
      }

      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true });
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
