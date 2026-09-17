"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type ComponentProps } from "react";
import { useCurtainTransition } from "@/components/PourTransition";

type CurtainLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onNavigate" | "ref"> & {
  href: string;
  /** Small caps line shown on the curtain */
  label: string;
  /** Title spelled out on the curtain while the page loads */
  title: string;
};

/** A link that closes the curtain, loads its page behind it, then lifts the curtain */
export default function CurtainLink({ href, label, title, ...linkProps }: CurtainLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  const startCurtain = useCurtainTransition();

  return (
    <Link
      {...linkProps}
      ref={linkRef}
      href={href}
      // Only fires for in-app navigation, so modifier-clicks still open a new tab
      onNavigate={(event) => {
        const rect = linkRef.current?.getBoundingClientRect();
        // Already on that page: nothing to load, so behave like a normal link
        if (!rect || new URL(href, window.location.href).pathname === pathname) return;
        event.preventDefault();
        startCurtain({ href, label, title, from: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } });
      }}
    />
  );
}
