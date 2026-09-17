"use client";

import Link from "next/link";
import { useEffect, useRef, type ComponentProps } from "react";
import { preloadBottle, usePourTransition } from "@/components/PourTransition";

type PourLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onNavigate" | "ref"> & {
  slug: string;
};

/** A link to a wine that pours a glass of it, growing the bottle out of the link, while the wine's page loads */
export default function PourLink({ slug, ...linkProps }: PourLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const startPour = usePourTransition();

  useEffect(() => {
    preloadBottle(slug);
  }, [slug]);

  return (
    <Link
      {...linkProps}
      ref={linkRef}
      href={`/wines/${slug}`}
      // Only fires for in-app navigation, so modifier-clicks still open a new tab
      onNavigate={(event) => {
        const rect = linkRef.current?.getBoundingClientRect();
        if (!rect) return;
        event.preventDefault();
        startPour({ slug, from: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } });
      }}
    />
  );
}
