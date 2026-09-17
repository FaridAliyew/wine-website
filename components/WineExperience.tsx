"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePourTransition } from "@/components/PourTransition";

interface ChapterData {
  number: string;
  tag: string;
  title: string;
}

const chapters: ChapterData[] = [
  {
    number: "01",
    tag: "TERROIR & ELEVATION",
    title: "Ancient Foothills of the Caucasus",
  },
  {
    number: "02",
    tag: "HARVEST & MATURATION",
    title: "24 Months in French Oak Barriques",
  },
  {
    number: "03",
    tag: "SENSORY PROFILE",
    title: "Velvet Depth & Botanical Harmony",
  },
  {
    number: "04",
    tag: "LIMITED ALLOCATION",
    title: "1,200 Individually Numbered Bottles",
  },
];

// 5 Wine Products for the Table Carousel
// Balanced: 2 on Left, Auris Reserve in Center (Index 2), 2 on Right
const collectionWines = [
  {
    id: 3,
    slug: "luna-verde",
    name: "Luna Verde",
    vintage: "2021",
    appellation: "Sauvignon Blanc",
    src: "/images/wine3-clean.png",
  },
  {
    id: 2,
    slug: "magnus",
    name: "Magnus",
    vintage: "2019",
    appellation: "Syrah Reserve",
    src: "/images/wine2-clean.png",
  },
  {
    id: 1,
    slug: "auris-reserve",
    name: "Auris Reserve",
    vintage: "2018",
    appellation: "Cabernet Sauvignon",
    src: "/images/wine1-clean.png",
  },
  {
    id: 4,
    slug: "terra-nobile",
    name: "Terra Nobile",
    vintage: "2020",
    appellation: "Merlot Grand Cuvée",
    src: "/images/wine4-clean.png",
  },
  {
    id: 5,
    slug: "solis-blanc",
    name: "Solis Blanc",
    vintage: "2022",
    appellation: "Chardonnay",
    src: "/images/wine5-clean.png",
  },
];

export default function WineExperience() {
  const startPour = usePourTransition();
  const heroSlotRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const showcaseDockRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const activeSlotRef = useRef<HTMLDivElement>(null);

  const [scrollY, setScrollY] = useState(0);
  const [showcaseProgress, setShowcaseProgress] = useState(0);
  const [tableArrivalRatio, setTableArrivalRatio] = useState(0);
  const [windowHeight, setWindowHeight] = useState(800);
  const [windowWidth, setWindowWidth] = useState(1400);

  // Carousel interactive state: continuous index. Index 2 is Auris Reserve (Center Hero)
  const [currentIndex, setCurrentIndex] = useState(2);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragCurrentOffsetRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const activeWineIndex = ((currentIndex % collectionWines.length) + collectionWines.length) % collectionWines.length;

  // Coordinates of slots
  const [coords, setCoords] = useState<{
    heroX: number;
    heroY: number;
    heroH: number;
    heroW: number;
    dockX: number;
    dockY: number;
    tableX: number;
    tableY: number;
    ready: boolean;
  }>({
    heroX: 0,
    heroY: 0,
    heroH: 520,
    heroW: 190,
    dockX: 0,
    dockY: 0,
    tableX: 0,
    tableY: 0,
    ready: false,
  });

  const updateMeasurements = useCallback(() => {
    if (!heroSlotRef.current) return;
    const hRect = heroSlotRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    let dX = hRect.left;
    let dY = vh * 0.5 - hRect.height * 0.5;

    if (showcaseDockRef.current) {
      const dRect = showcaseDockRef.current.getBoundingClientRect();
      dX = dRect.left + dRect.width * 0.5 - hRect.width * 0.5;
      // In sticky showcase dock, bottle is always centered vertically in viewport:
      dY = vh * 0.5 - hRect.height * 0.5;
    }

    // Table center slot (where bottle lands on the foreground mahogany table)
    const tX = vw * 0.5 - hRect.width * 0.5;
    // Lowered onto the foreground table surface (near bottom of viewport):
    const tY = vh - 24 - hRect.height;

    setCoords({
      heroX: hRect.left,
      heroY: hRect.top + window.scrollY,
      heroH: hRect.height,
      heroW: heroSlotRef.current.clientWidth,
      dockX: dX,
      dockY: dY,
      tableX: tX,
      tableY: tY,
      ready: true,
    });
  }, []);

  const onScroll = useCallback(() => {
    const sy = window.scrollY;
    setScrollY(sy);
    const vh = window.innerHeight;

    // 1. Showcase progress
    if (showcaseRef.current) {
      const rect = showcaseRef.current.getBoundingClientRect();
      const total = rect.height - vh;
      if (total > 0) {
        const p = Math.min(1, Math.max(0, -rect.top / total));
        setShowcaseProgress(p);
      }
    }

    // 2. Table Section arrival progress
    if (collectionRef.current) {
      const rect = collectionRef.current.getBoundingClientRect();
      // When collection top enters viewport (rect.top <= vh) to when pinned at top (rect.top <= 0)
      const arrival = Math.min(1, Math.max(0, (vh - rect.top) / vh));
      setTableArrivalRatio(arrival);
    }
  }, []);

  useEffect(() => {
    // First sync on the next frame (essential for page refresh at any scroll position!),
    // then again after timeouts to catch complete font/image layout rendering
    const raf = requestAnimationFrame(() => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
      updateMeasurements();
      onScroll();
    });

    const timer1 = setTimeout(() => {
      updateMeasurements();
      onScroll();
    }, 60);

    const timer2 = setTimeout(() => {
      updateMeasurements();
      onScroll();
    }, 200);

    const onResize = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
      updateMeasurements();
      onScroll();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [updateMeasurements, onScroll]);

  // Phase 1: Travel from Hero to Showcase Dock
  const heroThreshold = Math.max(400, windowHeight * 0.85);
  const travelRatio = Math.min(1, Math.max(0, scrollY / heroThreshold));
  const isTravelingHero = travelRatio > 0.01 && travelRatio < 0.99;
  const slowSway = isTravelingHero ? Math.sin(travelRatio * Math.PI * 1.5) * 4.0 : 0;

  // Phase 2: Docked in Showcase during chapters
  // Phase 3: Transition from Showcase Dock to Table Center
  // Table transition occurs as user scrolls into Collection section (tableArrivalRatio: 0 -> 1)
  const tableLandingProgress = Math.min(1, Math.max(0, tableArrivalRatio * 1.25));

  // Rotation:
  // - In Hero: 0deg
  // - In Showcase: 4.5deg + sway
  // - On Table: smoothly returns to 0deg (upright on the wood table)
  let currentRotation = 0;
  if (tableLandingProgress > 0) {
    currentRotation = (1 - tableLandingProgress) * 4.5;
  } else if (travelRatio > 0) {
    currentRotation = travelRatio * 4.5 + slowSway;
  }

  // Viewport X & Y calculation across all 3 phases:
  const initialViewportY = coords.ready ? coords.heroY - scrollY : 180;
  const showcaseViewportY = windowHeight * 0.5 - (coords.heroH * 0.5);
  const tableViewportY = coords.ready ? coords.tableY : windowHeight * 0.22;

  let currentViewportY = showcaseViewportY;
  let currentViewportX = coords.dockX;

  if (tableLandingProgress > 0) {
    // Interpolate from Showcase Dock -> Table Center
    currentViewportY = showcaseViewportY * (1 - tableLandingProgress) + tableViewportY * tableLandingProgress;
    currentViewportX = coords.dockX * (1 - tableLandingProgress) + coords.tableX * tableLandingProgress;
  } else if (travelRatio < 1) {
    // Interpolate from Hero -> Showcase Dock
    currentViewportY = initialViewportY * (1 - travelRatio) + showcaseViewportY * travelRatio;
    currentViewportX = coords.heroX * (1 - travelRatio) + coords.dockX * travelRatio;
  }

  // Chapter opacities in Showcase
  const getChapterOpacity = (start: number, peakStart: number, peakEnd: number, end: number) => {
    if (showcaseProgress < start || showcaseProgress > end) return 0;
    if (showcaseProgress < peakStart) return (showcaseProgress - start) / (peakStart - start);
    if (showcaseProgress > peakEnd) return 1 - (showcaseProgress - peakEnd) / (end - peakEnd);
    return 1;
  };

  const ch1Opacity = getChapterOpacity(0.12, 0.18, 0.28, 0.34);
  const ch2Opacity = getChapterOpacity(0.36, 0.42, 0.52, 0.58);
  const ch3Opacity = getChapterOpacity(0.60, 0.66, 0.76, 0.82);
  const ch4Opacity = getChapterOpacity(0.84, 0.90, 0.96, 1.02);
  const chapterOpacities = [ch1Opacity, ch2Opacity, ch3Opacity, ch4Opacity];

  // Once bottle reaches table (tableLandingProgress >= 0.95), other bottles fan out and carousel activates
  const bottleOnTable = tableLandingProgress >= 0.92;
  const otherBottlesOpacity = Math.min(1, Math.max(0, (tableLandingProgress - 0.7) / 0.3));

  // --- CAROUSEL DRAG HANDLERS ---
  const handleDragStart = (clientX: number) => {
    if (!bottleOnTable) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartXRef.current = clientX;
    dragCurrentOffsetRef.current = 0;
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const delta = clientX - dragStartXRef.current;
    if (Math.abs(delta) > 6) {
      hasDraggedRef.current = true;
    }
    dragCurrentOffsetRef.current = delta;
    setDragOffset(delta);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const delta = dragCurrentOffsetRef.current;
    const threshold = 60; // 60px swipe moves to next/prev

    if (delta < -threshold) {
      // Swiped left -> Next wine (infinite looping)
      setCurrentIndex((prev) => prev + 1);
    } else if (delta > threshold) {
      // Swiped right -> Previous wine (infinite looping)
      setCurrentIndex((prev) => prev - 1);
    }

    setDragOffset(0);
    dragCurrentOffsetRef.current = 0;
    // Allow a 120ms debounce so mouseUp click doesn't trigger navigation
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 120);
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      handleDragMove(e.clientX);
    }
  };
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  // Carousel bottle spacing based on viewport width: wider breathing room on mahogany table
  const bottleSpacing = windowWidth < 640 ? 200 : windowWidth < 1024 ? 270 : windowWidth < 1440 ? 330 : 380;

  return (
    <div className="relative bg-[#0A0909] text-[#F5F2EB]">
      
      {/* SECTION 1: HERO SECTION */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col justify-between overflow-hidden pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-10"
      >
        {/* Real Scenic Landscape Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Image
            src="/images/hero-landscape.jpg"
            alt="Misty Caucasus vineyard terrace at sunrise"
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-[75%_center] lg:object-center brightness-[0.88] contrast-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0909] via-[#0A0909]/85 sm:via-[#0A0909]/70 to-transparent/15" />
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#0A0909]/90 via-[#0A0909]/30 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#0A0909] via-[#0A0909]/80 to-transparent" />
        </div>

        {/* Hero Content Grid */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero Left: Narrative Prose */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:space-y-8 lg:pr-8">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-[1.1] text-[#F5F2EB]">
              Where ancient earth meets the quiet{" "}
              <span className="italic font-normal text-[#DFBA73] font-serif">
                patience of time
              </span>
              .
            </h1>

            <p className="max-w-xl text-base sm:text-lg font-light text-[#D5CEBF] leading-relaxed">
              Wine is the living memory of the land—nurtured by morning mist, awakened by
              golden dawn, and shaped by centuries of devotion. In every glass lies an unspoken
              dialogue between nature&apos;s grace and human passion.
            </p>
          </div>

          {/* Hero Right: Shared Proportional Staging for Bottle and Glass */}
          <div className="lg:col-span-5 relative flex items-end justify-center lg:justify-end gap-5 sm:gap-8 h-[420px] sm:h-[480px] lg:h-[530px]">
            <div className="absolute w-80 h-96 rounded-full bg-[radial-gradient(circle_at_center,_rgba(94,13,27,0.45)_0%,_rgba(197,160,89,0.12)_45%,_transparent_72%)] blur-2xl pointer-events-none" />

            {/* Bottle Slot (Measured for initial positioning - exact 1:1 master size) */}
            <div
              ref={heroSlotRef}
              className="relative w-[160px] sm:w-[190px] lg:w-[210px] h-[350px] sm:h-[410px] lg:h-[460px] flex items-end justify-center pointer-events-none"
            />

            {/* Standalone Crystal Wine Glass */}
            <div className="relative w-[110px] sm:w-[135px] lg:w-[155px] h-[220px] sm:h-[260px] lg:h-[295px] flex items-end justify-center z-10 pointer-events-none mb-1">
              <Image
                src="/images/wine-glass-nobg.png"
                alt="Crystal wine glass filled with Auris Reserve red wine"
                width={200}
                height={340}
                loading="eager"
                fetchPriority="high"
                className="w-auto h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] filter contrast-[1.05]"
              />
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/80 blur-md rounded-full scale-x-125"
                aria-hidden="true"
              />
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: SHOWCASE SECTION */}
      <section
        id="showcase"
        ref={showcaseRef}
        className="relative min-h-[300vh] border-t border-white/[0.08]"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center py-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 top-1/4 w-[600px] h-[600px] rounded-full bg-[#430B14]/20 blur-[160px]" />
            <div className="absolute right-0 bottom-1/4 w-[700px] h-[700px] rounded-full bg-[#30080E]/30 blur-[180px]" />
          </div>

          <div className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Classical Roman Typography & Chapter Narrative */}
            <div className="lg:col-span-7 relative h-[420px] sm:h-[460px] flex flex-col justify-center">
              {chapters.map((chapter, idx) => {
                const opacity = chapterOpacities[idx];
                return (
                  <div
                    key={chapter.number}
                    className="absolute inset-0 flex flex-col justify-center transition-all duration-300"
                    style={{
                      opacity,
                      transform: `translateY(${(1 - opacity) * 20}px)`,
                      pointerEvents: opacity > 0.4 ? "auto" : "none",
                    }}
                  >
                    {/* Tag */}
                    <div className="text-xs font-mono tracking-[0.32em] text-[#C5A059] uppercase mb-4">
                      {chapter.tag}
                    </div>

                    {/* Headline in Classical Roman Cinzel Serif with uniform lining numerals */}
                    <h2
                      className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[52px] font-medium text-[#F5F2EB] leading-[1.18] tracking-[0.08em] uppercase max-w-xl"
                      style={{
                        fontFamily: "var(--font-cinzel), serif",
                        fontVariantNumeric: "lining-nums",
                      }}
                    >
                      {chapter.title}
                    </h2>

                    {/* Minimalist Gold Accent Hairline */}
                    <div className="w-12 h-[1px] bg-gradient-to-r from-[#C5A059]/80 via-[#DFBA73]/50 to-transparent mt-6" />
                  </div>
                );
              })}
            </div>

            {/* Right Column: Destination Dock where bottle stays fixed */}
            <div
              ref={showcaseDockRef}
              className="lg:col-span-5 relative flex items-center justify-center h-[460px] sm:h-[520px] pointer-events-none"
            >
              <div className="w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE COLLECTION - TABLE SECTION WITH DRAGGABLE CAROUSEL */}
      <section
        id="collection"
        ref={collectionRef}
        className="relative min-h-[160vh]"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-5 sm:py-7 select-none">
          {/* Background: bg-wine.jpg (Mahogany table & library study) */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src="/images/bg-wine.jpg"
              alt="Domaine Auris Cellar Table"
              fill
              loading="eager"
              sizes="100vw"
              className="object-cover object-[center_78%] brightness-[0.78] contrast-[1.06]"
            />
            {/* Top vignette blending from Section 2 */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#0A0909] via-[#0A0909]/80 to-transparent" />
            {/* Bottom vignette */}
            <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0A0909]/90 to-transparent" />
          </div>

          {/* Section Header (Above the Wine - Positioned cleanly below the fixed Navbar) */}
          <div
            className="relative z-20 max-w-7xl w-full mx-auto px-6 pt-24 sm:pt-20 flex flex-col items-center text-center transition-all duration-700 pointer-events-none"
            style={{
              opacity: tableLandingProgress,
              transform: `translateY(${(1 - tableLandingProgress) * 20}px)`,
            }}
          >
            <Link
              href={`/wines/${collectionWines[activeWineIndex].slug}`}
              onNavigate={(e) => {
                const slot = activeSlotRef.current;
                if (bottleOnTable && slot) {
                  e.preventDefault();
                  startPour({ slug: collectionWines[activeWineIndex].slug, slot });
                }
              }}
              className="group pointer-events-auto flex flex-col items-center cursor-pointer"
            >
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#F5F2EB] tracking-wide group-hover:text-[#DFBA73] transition-colors">
                {collectionWines[activeWineIndex].name}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm tracking-[0.28em] uppercase text-[#C5A059] font-mono">
                <span>{collectionWines[activeWineIndex].vintage}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]/80" />
                <span>{collectionWines[activeWineIndex].appellation}</span>
              </div>
              <span className="mt-3 text-[11px] font-mono tracking-[0.24em] uppercase text-[#C5A059]/80 group-hover:text-[#DFBA73] flex items-center gap-1.5 transition-colors">
                <span>Explore Vintage</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </div>

          {/* Drag Carousel Stage on the Foreground Table */}
          <div
            ref={carouselTrackRef}
            className={`relative z-20 w-full flex-1 flex items-end justify-center overflow-visible touch-none pb-2 sm:pb-4 ${
              bottleOnTable ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
            }`}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Interactive Bottles on the Foreground Mahogany Table */}
            <div className="relative w-full h-full flex items-end justify-center">
              {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((slotOffset) => {
                const k = currentIndex + slotOffset;
                const wineIndex = ((k % collectionWines.length) + collectionWines.length) % collectionWines.length;
                const wine = collectionWines[wineIndex];
                const isHeroInitialSlot = wine.id === 1 && k === 2;
                const slotDistance = Math.abs(slotOffset);
                const isVisibleSlot = slotDistance <= 2;
                const offset = slotOffset * bottleSpacing + dragOffset;
                const isActive = slotOffset === 0;

                // EQUAL SCALE & FULL VIVID CLARITY FOR ALL BOTTLES
                const scale = 1.0;
                const baseOpacity = isHeroInitialSlot
                  ? (bottleOnTable ? 1 : 0) // Hero bottle is rendered by traveling bottle until landed!
                  : (isVisibleSlot ? otherBottlesOpacity : 0);

                const opacity = baseOpacity; // 100% full, vivid clarity!
                const zIndex = isActive ? 30 : 25 - slotDistance;

                return (
                  <div
                    key={k}
                    ref={isActive ? activeSlotRef : undefined}
                    onClick={(e) => {
                      if (bottleOnTable && !isDragging && !hasDraggedRef.current && isVisibleSlot) {
                        startPour({ slug: wine.slug, slot: e.currentTarget });
                      }
                    }}
                    className={`absolute bottom-0 flex flex-col items-center group ${
                      isVisibleSlot && bottleOnTable ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
                    }`}
                    style={{
                      transform: `translateX(${offset}px) scale(${scale})`,
                      transformOrigin: "bottom center",
                      opacity,
                      zIndex,
                      transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.4s ease",
                      willChange: "transform, opacity",
                    }}
                  >
                    {/* Bottle Staging - Identical 1:1 dimensions & baseline for ALL 5 bottles */}
                    <div className="relative w-[160px] sm:w-[190px] lg:w-[210px] h-[350px] sm:h-[410px] lg:h-[460px] flex items-end justify-center">
                      {/* Active Bottle Ambient Glow on the wood table */}
                      {isActive && (
                        <div className="absolute -inset-8 bg-[radial-gradient(circle_at_center,_rgba(94,13,27,0.55)_0%,_rgba(197,160,89,0.18)_45%,_transparent_72%)] blur-2xl pointer-events-none" />
                      )}

                      {/* The Bottle Image - All bottles rendered with 1:1 identical max-height */}
                      <Image
                        src={wine.src}
                        alt={wine.name}
                        width={340}
                        height={1080}
                        loading={isVisibleSlot ? "eager" : "lazy"}
                        draggable={false}
                        className="w-auto h-full max-h-[350px] sm:max-h-[410px] lg:max-h-[460px] object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.95)] filter contrast-[1.03]"
                      />

                      {/* Contact Shadow on the Foreground Mahogany Table */}
                      <div
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-4 bg-black/95 blur-md rounded-full scale-x-125 pointer-events-none"
                        aria-hidden="true"
                      />

                      {/* Inverted Reflection on Polished Mahogany Table Surface */}
                      <div
                        className="absolute top-full left-0 right-0 h-20 overflow-hidden pointer-events-none opacity-20 filter blur-[1px] scale-y-[-1] [mask-image:linear-gradient(to_bottom,black,transparent)]"
                        aria-hidden="true"
                      >
                        <Image
                          src={wine.src}
                          alt=""
                          width={340}
                          height={1080}
                          draggable={false}
                          className="w-auto h-full max-h-[350px] sm:max-h-[410px] lg:max-h-[460px] object-contain mx-auto"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* THE LIVING TRAVELING BOTTLE */}
      {/* Glides from Hero (beside glass) -> Showcase Dock -> Table Center on bg-wine.jpg */}
      <div
        className="fixed z-40 pointer-events-none will-change-transform"
        style={{
          top: currentViewportY,
          left: currentViewportX !== undefined ? currentViewportX : undefined,
          right: currentViewportX === undefined ? "max(24px, calc((100vw - 1280px) / 2 + 190px))" : undefined,
          height: coords.heroH,
          width: coords.heroW,
          transform: `rotate(${currentRotation.toFixed(2)}deg)`,
          transformOrigin: "bottom center",
          opacity: bottleOnTable ? 0 : 1, // Smooth handoff to the carousel bottle once landed
          transition: travelRatio === 0 ? "none" : (isTravelingHero ? "transform 0.12s ease-out" : "transform 0.25s ease-out, opacity 0.3s ease"),
        }}
      >
        <div className="relative w-full h-full flex items-end justify-center">
          {/* Ambient Glow */}
          <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,_rgba(94,13,27,0.55)_0%,_rgba(197,160,89,0.15)_45%,_transparent_72%)] blur-2xl" />

          {/* Isolated Bottle - Matches exact carousel bottle sizing */}
          <Image
            src="/images/wine1-clean.png"
            alt="Auris Cabernet Sauvignon Reserve 2018"
            width={340}
            height={1080}
            loading="eager"
            fetchPriority="high"
            className="w-auto h-full max-h-[350px] sm:max-h-[410px] lg:max-h-[460px] object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.95)] filter contrast-[1.03]"
          />

          {/* Realistic Floor Shadow */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-4 bg-black/85 blur-xl rounded-full scale-x-125"
            aria-hidden="true"
          />
        </div>
      </div>

    </div>
  );
}

