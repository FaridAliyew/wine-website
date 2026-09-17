"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { getImageProps } from "next/image";
import { getWineBySlug } from "@/data/wines";
import { useLenis } from "@/components/SmoothScrollProvider";

/* -------------------------------------------------------------------------- */
/*  Timeline — every value is ms from the click, so the whole sequence can be  */
/*  retimed from this one place.                                               */
/* -------------------------------------------------------------------------- */

const T = {
  curtainIn: 900,
  flight: 950,
  glassAt: 320,
  glassIn: 1100,
  titleAt: 650,
  navigateAt: 900, // the curtain is fully closed by now, so the route swap is never seen
  tiltAt: 1050,
  tilt: 900,
  streamAt: 1750,
  streamIn: 300,
  fillAt: 1930,
  fill: 1350,
  streamOutAt: 3230,
  streamOut: 340,
  returnAt: 3300,
  return: 800,
  exitContent: 650,
  curtainOutDelay: 180,
  curtainOut: 1000,
  readyTimeout: 8000, // never hold the curtain longer than this after navigating
  // Curtain-only transitions, e.g. back to the collection
  curtainTitleAt: 280,
  curtainHold: 1400, // the curtain stays closed at least this long
  curtainSettle: 500, // lets the revealed page's own fade-ins finish underneath
};

// Gold light for curtains that aren't tied to a wine
const CURTAIN_TINT = "#C5A059";

const EASE = {
  // Quick to answer the click, long and soft to settle
  bloom: "cubic-bezier(0.45, 0, 0.15, 1)",
  glide: "cubic-bezier(0.65, 0, 0.15, 1)",
  inOutQuart: "cubic-bezier(0.76, 0, 0.24, 1)",
  outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  inExpo: "cubic-bezier(0.7, 0, 0.84, 0)",
  gravity: "cubic-bezier(0.5, 0, 0.9, 0.6)",
};

/* -------------------------------------------------------------------------- */
/*  Artwork constants                                                          */
/* -------------------------------------------------------------------------- */

// Every bottle PNG is 340x1080 with the mouth centred on its first opaque row
const BOTTLE_RATIO = 340 / 1080;
const MOUTH_Y = 0.0185;

// Height of the bottle that grows out of a click when none is on screen
const EMERGE_HEIGHT = 72;

const POUR_ANGLE_START = -102;
const POUR_ANGLE_END = -114;
const GLASS_TO_BOTTLE = 0.62;

// The glass is drawn in a 200x400 viewBox
const GLASS_VIEW_W = 200;
const GLASS_VIEW_H = 400;
const RIM_Y = 18;
const BOWL_FLOOR_Y = 248;
const FOOT_BOTTOM_Y = 391.5;
const FILL_Y = 150; // surface height once the pour is done
const EMPTY_SHIFT = 112; // pushes the liquid below the bowl floor

const BOWL_OUTER =
  "M 36 18 C 26 70 16 150 32 200 C 46 240 74 256 100 257 C 126 256 154 240 168 200 C 184 150 174 70 164 18 Z";
const BOWL_INNER =
  "M 38.5 18 C 29 70 19.5 150 35 199 C 48.5 237 75 252.5 100 253.5 C 125 252.5 151.5 237 165 199 C 180.5 150 171 70 161.5 18 Z";
const STEM =
  "M 90 255 C 95 262 97 272 97.6 290 L 98 356 C 98 366 93 374 76 381 L 124 381 C 107 374 102 366 102 356 L 102.4 290 C 103 272 105 262 110 255 Z";

const SLOSH: Keyframe[] = [0, -2.6, 2.1, -2.3, 1.9, -2.1, 1.6, -1.1, 0.6, -0.25, 0].map((deg, i, all) => ({
  transform: `rotate(${deg}deg)`,
  offset: i / (all.length - 1),
  easing: "ease-in-out",
}));

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* -------------------------------------------------------------------------- */
/*  Colour                                                                     */
/* -------------------------------------------------------------------------- */

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(from: Rgb, to: Rgb, t: number, alpha = 1) {
  const [r, g, b] = from.map((c, i) => Math.round(c + (to[i] - c) * t));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function palette(hex: string) {
  const rgb = hexToRgb(hex);
  const isWhiteWine = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255 > 0.45;
  const ruby: Rgb = [214, 38, 58];
  const white: Rgb = [255, 255, 255];
  return {
    deep: mix(rgb, [0, 0, 0], isWhiteWine ? 0.18 : 0.35),
    body: mix(rgb, rgb, 0),
    edge: mix(rgb, white, isWhiteWine ? 0.25 : 0.22),
    surface: mix(rgb, white, isWhiteWine ? 0.45 : 0.32),
    opacity: isWhiteWine ? 0.86 : 0.96,
    // Dark reds vanish on black, so their light leans toward a brighter ruby
    glow: isWhiteWine ? mix(rgb, white, 0.1, 0.2) : mix(rgb, ruby, 0.5, 0.26),
    haze: isWhiteWine ? mix(rgb, white, 0.1, 0.08) : mix(rgb, ruby, 0.55, 0.08),
    band: isWhiteWine ? mix(rgb, white, 0.2, 0.16) : mix(rgb, ruby, 0.4, 0.2),
  };
}

type Palette = ReturnType<typeof palette>;

/* -------------------------------------------------------------------------- */
/*  Stage geometry (viewport px)                                               */
/* -------------------------------------------------------------------------- */

interface Point {
  x: number;
  y: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function rotate(x: number, y: number, deg: number): Point {
  const a = (deg * Math.PI) / 180;
  return { x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) };
}

const pose = (x: number, y: number, deg: number, scale = 1) =>
  `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${deg}deg) scale(${scale.toFixed(4)})`;

// A circle centred on a point, just large enough to cover the viewport
function bloomFrom(x: number, y: number, vw: number, vh: number) {
  return { x, y, r: Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y)) + 40 };
}

// Proportions for a given bottle height, with x measured from the glass axis
function compose(vh: number, hb: number, raise = 0) {
  const wb = hb * BOTTLE_RATIO;
  const hg = hb * GLASS_TO_BOTTLE;
  const wg = hg * (GLASS_VIEW_W / GLASS_VIEW_H);
  const k = hg / GLASS_VIEW_H;
  const baseline = vh * 0.78 - raise;
  const glassTop = baseline - hg;
  const origin = { x: wb / 2, y: hb * MOUTH_Y };
  // The mouth hovers just above the rim, right of the axis, and the pour pivots on it
  const mouth = { x: wg * 0.2, y: glassTop + RIM_Y * k - hb * 0.08 };
  const tilted = [
    [0, 0],
    [wb, 0],
    [0, hb],
    [wb, hb],
  ].map(([px, py]) => rotate(px - origin.x, py - origin.y, POUR_ANGLE_END));
  const bowlHalf = wg * 0.42;
  const pairX = bowlHalf + hb * 0.2 + wb / 2;
  const left = Math.min(-bowlHalf, mouth.x + Math.min(...tilted.map((p) => p.x)));
  const right = mouth.x + Math.max(...tilted.map((p) => p.x));
  // The glass never moves, so split the difference between centring the pour and the resting pair
  const pourCenter = (left + right) / 2;
  const restCenter = (-bowlHalf + pairX + wb * 0.43) / 2;
  const balance = (pourCenter + restCenter) / 2;
  return {
    wb,
    hg,
    wg,
    k,
    baseline,
    glassTop,
    origin,
    mouth,
    pairX,
    pourTop: mouth.y + Math.min(...tilted.map((p) => p.y)),
    left,
    right,
    balance,
  };
}

// A tapered ribbon along a cubic Bézier, plus its centreline for masking
function streamPaths(p0: Point, p1: Point, p2: Point, p3: Point, width: number) {
  const left: string[] = [];
  const right: string[] = [];
  const sheen: string[] = [];
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
    const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
    const dx = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
    const dy = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
    const len = Math.hypot(dx, dy) || 1;
    // A falling stream thins as it accelerates
    const half = (width * (1 - 0.45 * Math.pow(t, 0.7))) / 2;
    const nx = (-dy / len) * half;
    const ny = (dx / len) * half;
    left.push(`${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)}`);
    right.push(`${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)}`);
    // Specular line hugging the lit side of the stream
    sheen.push(`${(x - nx * 0.4).toFixed(1)} ${(y - ny * 0.4).toFixed(1)}`);
  }
  const f = (p: Point) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  return {
    centerline: `M ${f(p0)} C ${f(p1)} ${f(p2)} ${f(p3)}`,
    body: `M ${left.join(" L ")} L ${right.reverse().join(" L ")} Z`,
    sheen: `M ${sheen.join(" L ")}`,
  };
}

function layoutStage(vw: number, vh: number, from: Rect) {
  const fits = (c: ReturnType<typeof compose>) => {
    const axis = vw / 2 - c.balance;
    return axis + c.left >= vw * 0.05 && axis + c.right <= vw * 0.95 && c.pourTop >= vh * 0.07;
  };
  let hb = Math.min(vh * 0.56, 640);
  let g = compose(vh, hb);
  for (let i = 0; i < 30 && !fits(g); i++) {
    hb *= 0.95;
    g = compose(vh, hb);
  }
  // On tall, narrow screens the width caps the bottle, so lift the scene and its title to mid-screen
  const titleGap = Math.max(20, vh * 0.035);
  const groupHeight = g.baseline - g.pourTop + titleGap + 120;
  const centredTop = Math.max(vh * 0.07, (vh - groupHeight) / 2);
  g = compose(vh, hb, Math.max(0, g.pourTop - centredTop));

  const axis = vw / 2 - g.balance;
  const mouth = { x: axis + g.mouth.x, y: g.mouth.y };

  // The bottle's layout box is its pour pose; every other pose is a transform about the mouth
  const bottle = { left: mouth.x - g.origin.x, top: mouth.y - g.origin.y, width: g.wb, height: hb };
  const pair = { x: axis + g.pairX - g.wb / 2 - bottle.left, y: g.baseline - hb - bottle.top };
  const s0 = from.h / hb;
  const fromX = from.x - bottle.left - g.origin.x + s0 * g.origin.x;
  const fromY = from.y - bottle.top - g.origin.y + s0 * g.origin.y;

  const end = { x: axis - g.wg * 0.04, y: g.glassTop + BOWL_FLOOR_Y * g.k };
  const a = (POUR_ANGLE_START * Math.PI) / 180;
  const p1 = { x: mouth.x + Math.sin(a) * hb * 0.035, y: mouth.y - Math.cos(a) * hb * 0.035 };
  const p2 = { x: end.x + 2, y: mouth.y + (end.y - mouth.y) * 0.45 };
  const streamWidth = hb * 0.03;

  const cx = from.x + from.w / 2;
  const cy = from.y + from.h / 2;

  return {
    vw,
    vh,
    hb,
    bottle: { ...bottle, origin: `${g.origin.x}px ${g.origin.y}px` },
    poses: {
      from: pose(fromX, fromY, 0, s0),
      pair: pose(pair.x, pair.y, 0),
      lift: pose(pair.x - hb * 0.03, pair.y - hb * 0.1, -8),
      pourStart: pose(0, 0, POUR_ANGLE_START),
      pourEnd: pose(0, 0, POUR_ANGLE_END),
    },
    glass: { left: axis - g.wg / 2, top: g.glassTop, width: g.wg, height: g.hg },
    tableY: g.glassTop + FOOT_BOTTOM_Y * g.k,
    stream: {
      ...streamPaths(mouth, p1, p2, end, streamWidth),
      width: streamWidth,
      dash: [hb * 0.012, hb * 0.09] as const,
    },
    curtain: bloomFrom(cx, cy, vw, vh),
    light: { x: axis + g.pairX * 0.45, y: g.baseline - hb * 0.45, size: hb * 1.5 },
    titleTop: g.baseline + titleGap,
  };
}

type Stage = ReturnType<typeof layoutStage>;

/* -------------------------------------------------------------------------- */
/*  Destination readiness                                                      */
/* -------------------------------------------------------------------------- */

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

// Resolves once the fonts and every eagerly loaded image in view have decoded
async function settleVisibleImages(exclude: Element | null) {
  await nextFrame();
  await nextFrame();
  const images = Array.from(document.images).filter((img) => {
    if (exclude?.contains(img) || img.loading === "lazy") return false;
    const r = img.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
  });
  await Promise.all([
    document.fonts.ready,
    ...images.map((img) =>
      (img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          })
      ).then(() => img.decode().catch(() => undefined))
    ),
  ]);
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                   */
/* -------------------------------------------------------------------------- */

type PourRequest =
  | {
      slug: string;
      /** Element holding the clicked bottle as its first <img>; it fades while the clone flies */
      slot: HTMLElement;
    }
  | {
      slug: string;
      /** No bottle on screen: one grows out of this viewport point, e.g. the clicked wine name */
      from: Point;
    };

// Same size as the carousel's <Image>, so both resolve to the same optimised files
function bottleImage(src: string) {
  const { props } = getImageProps({ src, alt: "", width: 340, height: 1080 });
  return { src: props.src, srcSet: props.srcSet };
}

/** Warms the cache, so a pour that starts without an on-screen bottle never waits on the image */
export function preloadBottle(slug: string) {
  const wine = getWineBySlug(slug);
  if (!wine) return;
  const { src, srcSet } = bottleImage(wine.bottleImage);
  const img = new Image();
  if (srcSet) img.srcset = srcSet;
  img.src = src;
}

interface CurtainRequest {
  href: string;
  /** Viewport point the curtain blooms from, usually the centre of the clicked link */
  from: Point;
  label: string;
  title: string;
}

interface Session {
  key: number;
  href: string;
  /** Hex colour the curtain's light is tinted with */
  tint: string;
  label: string;
  title: string;
  vh: number;
  /** Where the curtain blooms from; null when the visitor prefers reduced motion */
  bloom: ReturnType<typeof bloomFrom> | null;
  /** Bottle, glass and pour; only set for an animated pour */
  pour: { src: string; srcSet?: string; stage: Stage; emerge: boolean } | null;
}

interface TransitionApi {
  startPour: (request: PourRequest) => void;
  startCurtain: (request: CurtainRequest) => void;
}

const TransitionContext = createContext<TransitionApi | null>(null);

function useTransitionApi() {
  const api = useContext(TransitionContext);
  if (!api) throw new Error("Page transitions must be used inside <PourTransitionProvider>");
  return api;
}

/** Pours a glass of the clicked wine while its page loads */
export function usePourTransition() {
  return useTransitionApi().startPour;
}

/** Closes the curtain, loads `href` behind it, then lifts the curtain */
export function useCurtainTransition() {
  return useTransitionApi().startCurtain;
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function PourTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenisRef = useLenis();
  const [session, setSession] = useState<Session | null>(null);
  const busyRef = useRef(false);
  const restoreSlotRef = useRef<(() => void) | null>(null);
  const routeWaiterRef = useRef<{ pathname: string; resolve: () => void } | null>(null);

  // The pathname only changes once the destination route has committed
  useEffect(() => {
    const waiter = routeWaiterRef.current;
    if (waiter && waiter.pathname === pathname) {
      routeWaiterRef.current = null;
      waiter.resolve();
    }
  }, [pathname]);

  const begin = useCallback(
    (href: string) => {
      if (busyRef.current) return false;
      busyRef.current = true;
      router.prefetch(href);
      lenisRef?.current?.stop();
      return true;
    },
    [router, lenisRef]
  );

  const startPour = useCallback(
    (request: PourRequest) => {
      const { slug } = request;
      const wine = getWineBySlug(slug);
      const href = `/wines/${slug}`;
      const slot = "slot" in request ? request.slot : null;
      const bottle = slot?.querySelector("img") ?? null;
      if (!wine || (slot && !bottle)) {
        router.push(href);
        return;
      }
      if (!begin(href)) return;

      let from: Rect;
      if (bottle) {
        const r = bottle.getBoundingClientRect();
        from = { x: r.left, y: r.top, w: r.width, h: r.height };
      } else {
        const { x, y } = (request as { from: Point }).from;
        const w = EMERGE_HEIGHT * BOTTLE_RATIO;
        from = { x: x - w / 2, y: y - EMERGE_HEIGHT / 2, w, h: EMERGE_HEIGHT };
      }
      const stage = prefersReducedMotion() ? null : layoutStage(window.innerWidth, window.innerHeight, from);

      if (stage && slot && bottle) {
        // The clone starts on the exact same pixels, so the original can vanish at once
        bottle.style.visibility = "hidden";
        const fade = slot.animate([{ opacity: 0 }], { duration: 320, easing: "ease-out", fill: "forwards" });
        restoreSlotRef.current = () => {
          bottle.style.visibility = "";
          fade.cancel();
        };
      }

      setSession({
        key: Date.now(),
        href,
        tint: wine.wineColor,
        label: `Vintage ${wine.vintage} · ${wine.appellation}`,
        title: wine.name,
        vh: window.innerHeight,
        bloom: stage?.curtain ?? null,
        pour: stage
          ? {
              ...(bottle ? { src: bottle.currentSrc || bottle.src } : bottleImage(wine.bottleImage)),
              stage,
              emerge: !bottle,
            }
          : null,
      });
    },
    [router, begin]
  );

  const startCurtain = useCallback(
    ({ href, from, label, title }: CurtainRequest) => {
      if (!begin(href)) return;
      setSession({
        key: Date.now(),
        href,
        tint: CURTAIN_TINT,
        label,
        title,
        vh: window.innerHeight,
        bloom: prefersReducedMotion() ? null : bloomFrom(from.x, from.y, window.innerWidth, window.innerHeight),
        pour: null,
      });
    },
    [begin]
  );

  const navigate = useCallback(
    (href: string, overlay: Element | null) => {
      const target = new URL(href, window.location.href);
      const committed = new Promise<void>((resolve) => {
        if (target.pathname === window.location.pathname) resolve();
        else routeWaiterRef.current = { pathname: target.pathname, resolve };
      });
      router.push(href);
      return committed.then(() => {
        // Settle on the anchor now, so the images we wait for are the ones the curtain will reveal
        if (target.hash) document.getElementById(decodeURIComponent(target.hash.slice(1)))?.scrollIntoView();
        return settleVisibleImages(overlay);
      });
    },
    [router]
  );

  const finish = useCallback(() => {
    restoreSlotRef.current?.();
    restoreSlotRef.current = null;
    routeWaiterRef.current = null;
    lenisRef?.current?.start();
    busyRef.current = false;
    setSession(null);
  }, [lenisRef]);

  const api = useMemo(() => ({ startPour, startCurtain }), [startPour, startCurtain]);

  return (
    <TransitionContext.Provider value={api}>
      {children}
      {session && <TransitionOverlay key={session.key} session={session} navigate={navigate} onDone={finish} />}
    </TransitionContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Overlay                                                                    */
/* -------------------------------------------------------------------------- */

interface OverlayProps {
  session: Session;
  navigate: (href: string, overlay: Element | null) => Promise<void>;
  onDone: () => void;
}

function TransitionOverlay({ session, navigate, onDone }: OverlayProps) {
  const { href, label, title, vh, bloom, pour } = session;
  const stage = pour?.stage ?? null;
  const pal = palette(session.tint);
  const uid = useId().replace(/[^\w-]/g, "");

  const rootRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const stageClipRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const tableLineRef = useRef<HTMLDivElement>(null);
  const glassBackRef = useRef<HTMLDivElement>(null);
  const glassFrontRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<SVGGElement>(null);
  const sloshRef = useRef<SVGGElement>(null);
  const rippleARef = useRef<SVGEllipseElement>(null);
  const rippleBRef = useRef<SVGEllipseElement>(null);
  const streamMaskRef = useRef<SVGPathElement>(null);
  const shimmerRef = useRef<SVGPathElement>(null);
  const bumpRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const animations: Animation[] = [];
    const timers: number[] = [];
    let cancelled = false;

    const play = (el: Element | null, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      if (!el) return null;
      const animation = el.animate(keyframes, options);
      animations.push(animation);
      return animation;
    };
    const after = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });
    const loadDestination = () => Promise.race([navigate(href, rootRef.current), after(T.readyTimeout)]);

    // The page dims on the instant of the click, then the curtain blooms out of the clicked point
    const closeCurtain = (c: NonNullable<Session["bloom"]>) => {
      play(dimRef.current, [{ opacity: 0 }, { opacity: 0.55, offset: 0.25 }, { opacity: 0.55, offset: 0.9 }, { opacity: 0 }], {
        duration: T.curtainIn + 80,
        easing: "ease-out",
        fill: "both",
      });
      play(
        curtainRef.current,
        [{ clipPath: `circle(0px at ${c.x}px ${c.y}px)` }, { clipPath: `circle(${c.r}px at ${c.x}px ${c.y}px)` }],
        { duration: T.curtainIn, easing: EASE.bloom, fill: "both" }
      );
    };

    const revealTitle = (at: number) => {
      titleRef.current?.querySelectorAll("[data-char]").forEach((el, i) =>
        play(el, [{ transform: "translateY(115%)" }, { transform: "translateY(0%)" }], {
          duration: 900,
          delay: at + i * 30,
          easing: EASE.outExpo,
          fill: "both",
        })
      );
      titleRef.current?.querySelectorAll("[data-fade]").forEach((el, i) =>
        play(el, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0px)" }], {
          duration: 800,
          delay: at + 150 + i * 120,
          easing: "ease-out",
          fill: "both",
        })
      );
    };

    // Hand over: the scene drifts away and the curtain lifts off the new page
    const liftCurtain = () => {
      play(progressRef.current, [{ transform: "scaleX(0.72)" }, { transform: "scaleX(1)" }], {
        duration: 420,
        easing: EASE.outExpo,
        fill: "forwards",
      });
      play(
        stageRef.current,
        [
          { opacity: 1, transform: "translateY(0px) scale(1)" },
          { opacity: 0, transform: `translateY(${-vh * 0.05}px) scale(0.97)` },
        ],
        { duration: T.exitContent, delay: 160, easing: EASE.inExpo, fill: "forwards" }
      );
      const lift: KeyframeAnimationOptions = {
        duration: T.curtainOut,
        delay: 160 + T.curtainOutDelay,
        easing: EASE.inOutQuart,
        fill: "forwards",
      };
      const bandHeight = vh * 0.28;
      const wipe: Keyframe[] = [{ clipPath: "inset(0px 0px 0px 0px)" }, { clipPath: `inset(0px 0px ${vh}px 0px)` }];
      const curtainUp = play(curtainRef.current, wipe, lift);
      // The scene is wiped by the same edge, so nothing lingers over the revealed page
      play(stageClipRef.current, wipe, lift);
      play(
        edgeRef.current,
        [
          { transform: `translateY(${vh}px)`, opacity: 0 },
          { opacity: 1, offset: 0.12 },
          { opacity: 1, offset: 0.8 },
          { transform: "translateY(0px)", opacity: 0 },
        ],
        lift
      );
      play(
        bandRef.current,
        [
          { transform: `translateY(${vh - bandHeight}px)`, opacity: 0 },
          { opacity: 1, offset: 0.15 },
          { transform: `translateY(${-bandHeight}px)`, opacity: 1 },
        ],
        lift
      );
      return curtainUp;
    };

    const run = async () => {
      const curtain = curtainRef.current;

      if (!bloom) {
        await play(curtain, [{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: "ease-out", fill: "both" })
          ?.finished;
        if (cancelled) return;
        await loadDestination();
        if (cancelled) return;
        await play(curtain, [{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: "ease-in", fill: "forwards" })
          ?.finished;
        if (!cancelled) onDone();
        return;
      }

      closeCurtain(bloom);

      if (!stage) {
        // Curtain only: hold the title while the destination loads behind it
        revealTitle(T.curtainTitleAt);
        play(progressRef.current, [{ transform: "scaleX(0)" }, { transform: "scaleX(0.72)" }], {
          duration: T.curtainHold,
          delay: T.curtainTitleAt,
          easing: "cubic-bezier(0.3, 0.2, 0.35, 1)",
          fill: "both",
        });
        const destinationReady = after(T.navigateAt).then(() => (cancelled ? undefined : loadDestination()));
        await Promise.all([destinationReady.then(() => after(T.curtainSettle)), after(T.curtainHold)]);
      } else {
        const { poses } = stage;

        if (pour?.emerge) {
          // Growing out of the click needs a decoded image, or the bottle would pop in half-drawn
          await Promise.race([bottleRef.current?.decode().catch(() => undefined), after(1500)]);
          if (cancelled) return;
          play(bottleRef.current, [{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 1 }], {
            duration: T.flight,
            easing: "ease-out",
            fill: "both",
          });
        }

        // 1. The bottle lifts off the table (or grows out of the click) and glides to centre stage
        play(bottleRef.current, [{ transform: poses.from }, { transform: poses.pair }], {
          duration: T.flight,
          easing: EASE.glide,
          fill: "both",
        });
        play(
          bumpRef.current,
          [
            { transform: "translateY(0px)", easing: "cubic-bezier(0.3, 0, 0.2, 1)" },
            { transform: `translateY(${-stage.hb * 0.07}px)`, easing: "cubic-bezier(0.6, 0, 0.4, 1)" },
            { transform: "translateY(0px)" },
          ],
          { duration: T.flight, fill: "both" }
        );
        play(lightRef.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 1400, delay: 250, easing: "ease-out", fill: "both" });

        // 2. The empty glass rises out of the dark
        const glassIn: Keyframe[] = [
          { opacity: 0, transform: `translateY(${stage.glass.height * 0.22}px) scale(0.94)`, filter: "blur(10px)" },
          { opacity: 1, transform: "translateY(0px) scale(1)", filter: "blur(0px)" },
        ];
        const glassTiming: KeyframeAnimationOptions = {
          duration: T.glassIn,
          delay: T.glassAt,
          easing: EASE.outExpo,
          fill: "both",
        };
        play(glassBackRef.current, glassIn, glassTiming);
        play(glassFrontRef.current, glassIn, glassTiming);
        play(tableLineRef.current, [{ transform: "scaleX(0)", opacity: 0 }, { transform: "scaleX(1)", opacity: 1 }], {
          duration: 1300,
          delay: T.glassAt + 250,
          easing: EASE.outExpo,
          fill: "both",
        });

        revealTitle(T.titleAt);

        // 3. The detail page starts loading behind the closed curtain
        const destinationReady = after(T.navigateAt).then(() => (cancelled ? undefined : loadDestination()));

        // 4. Lift, tilt and pour, pivoting on the bottle's mouth
        play(
          bottleRef.current,
          [
            { transform: poses.pair, easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
            { transform: poses.lift, offset: 0.3, easing: "cubic-bezier(0.5, 0, 0.3, 1)" },
            { transform: poses.pourStart },
          ],
          { duration: T.tilt, delay: T.tiltAt, fill: "forwards" }
        );
        play(bottleRef.current, [{ transform: poses.pourStart }, { transform: poses.pourEnd }], {
          duration: T.streamOutAt - (T.tiltAt + T.tilt),
          delay: T.tiltAt + T.tilt,
          easing: "cubic-bezier(0.4, 0, 0.6, 1)",
          fill: "forwards",
        });

        const mask = streamMaskRef.current;
        const length = mask?.getTotalLength() ?? 0;
        const dash = `${length} ${length + 2}`;
        play(mask, [{ strokeDasharray: dash, strokeDashoffset: length }, { strokeDasharray: dash, strokeDashoffset: 0 }], {
          duration: T.streamIn,
          delay: T.streamAt,
          easing: EASE.gravity,
          fill: "both",
        });
        play(mask, [{ strokeDasharray: dash, strokeDashoffset: 0 }, { strokeDasharray: dash, strokeDashoffset: -length }], {
          duration: T.streamOut,
          delay: T.streamOutAt,
          easing: EASE.gravity,
          fill: "forwards",
        });
        play(
          shimmerRef.current,
          [{ strokeDashoffset: 0 }, { strokeDashoffset: -(stage.stream.dash[0] + stage.stream.dash[1]) }],
          { duration: 240, iterations: Infinity }
        );

        play(levelRef.current, [{ transform: `translateY(${EMPTY_SHIFT}px)` }, { transform: "translateY(0px)" }], {
          duration: T.fill,
          delay: T.fillAt,
          easing: "cubic-bezier(0.3, 0.2, 0.35, 1)", // the bowl widens, so the level slows as it rises
          fill: "both",
        });
        play(sloshRef.current, SLOSH, { duration: T.fill + 1000, delay: T.fillAt, fill: "both" });
        [rippleARef.current, rippleBRef.current].forEach((ripple, i) =>
          play(
            ripple,
            [
              { opacity: 0, transform: "scale(0.3)" },
              { opacity: 0.75, offset: 0.2 },
              { opacity: 0, transform: "scale(1.6)" },
            ],
            {
              duration: 760,
              delay: T.fillAt + 150 + i * 380,
              iterations: Math.floor((T.fill - 400) / 760),
              easing: "ease-out",
              fill: "both",
            }
          )
        );
        play(glowRef.current, [{ opacity: 0 }, { opacity: 1 }], {
          duration: T.fill,
          delay: T.fillAt,
          easing: "ease-in-out",
          fill: "both",
        });
        play(progressRef.current, [{ transform: "scaleX(0)" }, { transform: "scaleX(0.72)" }], {
          duration: T.fill + 400,
          delay: T.fillAt - 200,
          easing: "cubic-bezier(0.3, 0.2, 0.35, 1)",
          fill: "both",
        });

        // 5. Set the bottle back down beside the full glass
        const setDown = play(
          bottleRef.current,
          [
            { transform: poses.pourEnd, easing: "cubic-bezier(0.4, 0, 0.6, 1)" },
            { transform: poses.lift, offset: 0.65, easing: "cubic-bezier(0.3, 0, 0.2, 1)" },
            { transform: poses.pair },
          ],
          { duration: T.return, delay: T.returnAt, fill: "forwards" }
        );
        // A slow breath on the glow in case the page is still loading
        play(glowRef.current, [{ opacity: 1 }, { opacity: 0.6 }], {
          duration: 1400,
          delay: T.returnAt + T.return,
          direction: "alternate",
          iterations: Infinity,
          easing: "ease-in-out",
        });

        await Promise.all([setDown?.finished, destinationReady]);
      }
      if (cancelled) return;

      await liftCurtain()?.finished;
      if (!cancelled) onDone();
    };

    // Cancelled animations reject their `finished` promise, which simply ends the run
    run().catch(() => undefined);

    return () => {
      cancelled = true;
      animations.forEach((animation) => animation.cancel());
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [href, vh, bloom, pour, stage, navigate, onDone]);

  return (
    <div ref={rootRef} aria-hidden="true" className="fixed inset-0 z-[200] cursor-default select-none overflow-hidden">
      {bloom && <div ref={dimRef} className="absolute inset-0 bg-black" style={{ opacity: 0 }} />}

      {/* Curtain */}
      <div
        ref={curtainRef}
        className="absolute inset-0 overflow-hidden bg-[#0B0909]"
        style={bloom ? { clipPath: `circle(0px at ${bloom.x}px ${bloom.y}px)` } : { opacity: 0 }}
      >
        {stage && (
          <div
            ref={lightRef}
            className="absolute rounded-full"
            style={{
              left: stage.light.x - stage.light.size / 2,
              top: stage.light.y - stage.light.size / 2,
              width: stage.light.size,
              height: stage.light.size,
              opacity: 0,
              background: `radial-gradient(closest-side, rgba(223, 186, 115, 0.13), ${pal.haze} 45%, transparent 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-soft-light" style={{ backgroundImage: GRAIN }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]" />
        <div
          ref={bandRef}
          className="absolute inset-x-0 top-0 h-[28vh]"
          style={{ opacity: 0, background: `linear-gradient(to bottom, transparent, ${pal.band})` }}
        />
      </div>

      {/* Gold hairline riding the curtain's edge as it lifts */}
      <div
        ref={edgeRef}
        className="absolute inset-x-0 top-0 h-px"
        style={{
          opacity: 0,
          background:
            "linear-gradient(90deg, transparent, rgba(223,186,115,0.85) 25%, rgba(247,233,196,1) 50%, rgba(223,186,115,0.85) 75%, transparent)",
          boxShadow: "0 0 22px 3px rgba(223,186,115,0.35)",
        }}
      />

      {bloom && (
        <div ref={stageClipRef} className="absolute inset-0">
          <div ref={stageRef} className="absolute inset-0">
            {stage && pour && (
              <>
                {/* Light passing through the wine, pooling softly on the table */}
                <div
                  ref={glowRef}
                  className="absolute"
                  style={{
                    left: stage.glass.left - stage.glass.width * 0.9,
                    top: stage.tableY - stage.glass.height * 0.2,
                    width: stage.glass.width * 2.8,
                    height: stage.glass.height * 0.36,
                    opacity: 0,
                    background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${pal.glow}, transparent 72%)`,
                  }}
                />
                <div
                  ref={tableLineRef}
                  className="absolute h-px"
                  style={{
                    top: stage.tableY,
                    left: stage.vw / 2 - Math.min(stage.vw * 0.38, 480),
                    width: Math.min(stage.vw * 0.76, 960),
                    opacity: 0,
                    background: "linear-gradient(90deg, transparent, rgba(197,160,89,0.4) 50%, transparent)",
                  }}
                />

                <div ref={glassBackRef} className="absolute will-change-transform" style={{ ...box(stage.glass), opacity: 0 }}>
                  <GlassBack uid={uid} />
                </div>

                {/* The stream falls between the glass's back and front layers */}
                <svg
                  className="absolute inset-0 overflow-visible"
                  width={stage.vw}
                  height={stage.vh}
                  viewBox={`0 0 ${stage.vw} ${stage.vh}`}
                >
                  <defs>
                    <mask id={`${uid}-stream`} maskUnits="userSpaceOnUse" x="0" y="0" width={stage.vw} height={stage.vh}>
                      <path
                        ref={streamMaskRef}
                        d={stage.stream.centerline}
                        fill="none"
                        stroke="white"
                        strokeWidth={stage.stream.width * 4}
                        style={{ strokeDasharray: "0 100000" }}
                      />
                    </mask>
                  </defs>
                  <g mask={`url(#${uid}-stream)`}>
                    <path d={stage.stream.body} fill={pal.body} fillOpacity={pal.opacity} />
                    <path
                      d={stage.stream.centerline}
                      fill="none"
                      stroke={pal.edge}
                      strokeOpacity={0.45}
                      strokeWidth={stage.stream.width * 0.3}
                    />
                    <path
                      d={stage.stream.sheen}
                      fill="none"
                      stroke="white"
                      strokeOpacity={0.28}
                      strokeWidth={stage.stream.width * 0.1}
                      strokeLinecap="round"
                    />
                    {/* Faint travelling glints sell the flow without reading as a dashed line */}
                    <path
                      ref={shimmerRef}
                      d={stage.stream.sheen}
                      fill="none"
                      stroke="white"
                      strokeOpacity={0.22}
                      strokeWidth={stage.stream.width * 0.14}
                      strokeLinecap="round"
                      strokeDasharray={`${stage.stream.dash[0]} ${stage.stream.dash[1]}`}
                    />
                  </g>
                </svg>

                <div ref={glassFrontRef} className="absolute will-change-transform" style={{ ...box(stage.glass), opacity: 0 }}>
                  <GlassFront
                    uid={uid}
                    pal={pal}
                    levelRef={levelRef}
                    sloshRef={sloshRef}
                    rippleARef={rippleARef}
                    rippleBRef={rippleBRef}
                  />
                </div>

                <div ref={bumpRef} className="absolute" style={box(stage.bottle)}>
                  {/* A plain <img> on purpose: it reuses the carousel's already-decoded currentSrc, so the clone never flashes */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={bottleRef}
                    src={pour.src}
                    srcSet={pour.srcSet}
                    alt=""
                    draggable={false}
                    className="block h-full w-full will-change-transform"
                    style={{
                      transformOrigin: stage.bottle.origin,
                      transform: stage.poses.from,
                      opacity: pour.emerge ? 0 : undefined,
                    }}
                  />
                </div>
              </>
            )}

            <div
              ref={titleRef}
              className="absolute inset-x-0 flex flex-col items-center px-6 text-center"
              // Under the table when pouring; centred on its own for a plain curtain
              style={stage ? { top: stage.titleTop } : { top: "50%", transform: "translateY(-50%)" }}
            >
              <span
                data-fade
                className="font-mono text-[10px] uppercase tracking-[0.32em] text-balance text-[#C5A059] sm:text-[11px]"
                style={{ opacity: 0 }}
              >
                {label}
              </span>
              <h2
                className="mt-3 text-[clamp(22px,3.4vw,46px)] font-light uppercase leading-[1.15] tracking-[0.1em] text-[#F5F2EB]"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                {Array.from(title).map((char, i) => (
                  <span key={i} className="inline-block overflow-hidden align-bottom">
                    <span data-char className="inline-block" style={{ transform: "translateY(115%)" }}>
                      {char === " " ? " " : char}
                    </span>
                  </span>
                ))}
              </h2>
              <span data-fade className="mt-5 block h-px w-28 overflow-hidden bg-[#C5A059]/15" style={{ opacity: 0 }}>
                <span
                  ref={progressRef}
                  className="block h-full w-full origin-left bg-gradient-to-r from-[#C5A059] to-[#DFBA73]"
                  style={{ transform: "scaleX(0)" }}
                />
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function box(r: { left: number; top: number; width: number; height: number }) {
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

/* -------------------------------------------------------------------------- */
/*  Glass artwork, split in two so the stream can fall between its walls       */
/* -------------------------------------------------------------------------- */

function GlassBack({ uid }: { uid: string }) {
  return (
    <svg viewBox={`0 0 ${GLASS_VIEW_W} ${GLASS_VIEW_H}`} className="absolute inset-0 h-full w-full overflow-visible">
      <defs>
        <linearGradient id={`${uid}-tint`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0.13" />
          <stop offset="0.3" stopColor="white" stopOpacity="0.03" />
          <stop offset="0.7" stopColor="white" stopOpacity="0.02" />
          <stop offset="1" stopColor="white" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path d={BOWL_OUTER} fill={`url(#${uid}-tint)`} />
      {/* Far halves of the rim and the foot */}
      <path d="M 36 18 A 64 5.5 0 0 1 164 18" fill="none" stroke="white" strokeOpacity="0.28" strokeWidth="1" />
      <path d="M 34 383 A 66 8.5 0 0 1 166 383" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
    </svg>
  );
}

interface GlassFrontProps {
  uid: string;
  pal: Palette;
  levelRef: RefObject<SVGGElement | null>;
  sloshRef: RefObject<SVGGElement | null>;
  rippleARef: RefObject<SVGEllipseElement | null>;
  rippleBRef: RefObject<SVGEllipseElement | null>;
}

function GlassFront({ uid, pal, levelRef, sloshRef, rippleARef, rippleBRef }: GlassFrontProps) {
  const rippleStyle = { opacity: 0, transformBox: "fill-box", transformOrigin: "center" } as const;
  return (
    <svg viewBox={`0 0 ${GLASS_VIEW_W} ${GLASS_VIEW_H}`} className="absolute inset-0 h-full w-full overflow-visible">
      <defs>
        <clipPath id={`${uid}-bowl`}>
          <path d={BOWL_INNER} />
        </clipPath>
        {/* Backlit wine: dense in the middle, glowing where the bowl is thin */}
        <radialGradient id={`${uid}-wine`} gradientUnits="userSpaceOnUse" cx="100" cy="215" r="95">
          <stop offset="0" stopColor={pal.deep} />
          <stop offset="0.62" stopColor={pal.body} />
          <stop offset="1" stopColor={pal.edge} />
        </radialGradient>
        <linearGradient id={`${uid}-highlight`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.35" stopColor="white" stopOpacity="0.75" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-stem`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0.1" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.38" />
          <stop offset="1" stopColor="white" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${uid}-bowl)`}>
        <g ref={levelRef} style={{ transform: `translateY(${EMPTY_SHIFT}px)` }}>
          <g ref={sloshRef} style={{ transformBox: "view-box", transformOrigin: `100px ${FILL_Y}px` }}>
            <rect x="-40" y={FILL_Y} width="280" height="160" fill={`url(#${uid}-wine)`} fillOpacity={pal.opacity} />
            <ellipse cx="100" cy={FILL_Y} rx="96" ry="6" fill={pal.surface} fillOpacity="0.85" />
            <ellipse cx="92" cy={FILL_Y + 1.5} rx="52" ry="2" fill="white" fillOpacity="0.14" />
            <ellipse
              ref={rippleARef}
              cx="96"
              cy={FILL_Y}
              rx="26"
              ry="3.5"
              fill="none"
              stroke={pal.surface}
              strokeWidth="1"
              style={rippleStyle}
            />
            <ellipse
              ref={rippleBRef}
              cx="96"
              cy={FILL_Y}
              rx="26"
              ry="3.5"
              fill="none"
              stroke={pal.surface}
              strokeWidth="1"
              style={rippleStyle}
            />
          </g>
        </g>
      </g>

      {/* Bowl walls and light */}
      <path d={BOWL_OUTER} fill="none" stroke="white" strokeOpacity="0.42" strokeWidth="1.2" />
      <path
        d="M 46 36 C 36 88 31 148 45 194"
        fill="none"
        stroke={`url(#${uid}-highlight)`}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path d="M 56 44 C 49 80 47 120 51 150" fill="none" stroke="white" strokeOpacity="0.24" strokeWidth="1.4" strokeLinecap="round" />
      {/* Rim light down the far side */}
      <path
        d="M 160 40 C 169 96 172 150 160 196"
        fill="none"
        stroke={`url(#${uid}-highlight)`}
        strokeOpacity="0.6"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M 70 243 C 86 254 114 254 130 243" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.6" strokeLinecap="round" />
      {/* Near half of the rim */}
      <path d="M 36 18 A 64 5.5 0 0 0 164 18" fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="1.2" />
      <path d="M 52 21.5 A 64 5.5 0 0 0 92 23.3" fill="none" stroke="white" strokeOpacity="0.9" strokeWidth="1.4" strokeLinecap="round" />

      {/* Stem and foot */}
      <path d={STEM} fill={`url(#${uid}-stem)`} stroke="white" strokeOpacity="0.28" strokeWidth="0.7" />
      <path d="M 99.2 270 L 99.6 354" stroke="white" strokeOpacity="0.65" strokeWidth="0.9" />
      <ellipse cx="100" cy="383" rx="66" ry="8.5" fill="white" fillOpacity="0.07" />
      <path d="M 34 383 A 66 8.5 0 0 0 166 383" fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="1.1" />
      <path d="M 48 388.2 A 66 8.5 0 0 0 96 391.4" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
