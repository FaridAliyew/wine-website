import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CurtainLink from "@/components/CurtainLink";
import { WINES, getWineBySlug } from "@/data/wines";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return WINES.map((wine) => ({
    slug: wine.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const wine = getWineBySlug(slug);

  if (!wine) {
    return { title: "Wine Not Found | Domaine Auris" };
  }

  return {
    title: `${wine.name} (${wine.vintage}) | Domaine Auris`,
    description: wine.description,
  };
}

export default async function WineDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const wine = getWineBySlug(slug);

  if (!wine) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-[#0A0909] text-[#F5F2EB] selection:bg-[#C5A059]/30 selection:text-[#F5F2EB]">
      {/* Luxury Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="pt-28 sm:pt-36 pb-20 sm:pb-28">
        
        {/* Navigation Breadcrumb / Back Link */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 mb-8 sm:mb-12">
          <CurtainLink
            href="/#collection"
            label="Domaine Auris"
            title="The Collection"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.24em] text-[#C5A059] hover:text-[#DFBA73] uppercase transition-colors group"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Return to Collection</span>
          </CurtainLink>
        </div>

        {/* 1. TITLE SECTION (Yuxarıda Şərabın Başlığı) */}
        <div className="max-w-5xl mx-auto px-6 sm:px-10 text-center space-y-4 sm:space-y-6 mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-mono tracking-[0.32em] text-[#C5A059] uppercase">
            <span>Vintage {wine.vintage}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]/70" />
            <span>{wine.appellation}</span>
          </div>

          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-[0.08em] text-[#F5F2EB] uppercase leading-tight"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            {wine.name}
          </h1>

          <p className="text-base sm:text-lg font-light text-[#D0C8BC] italic font-serif max-w-2xl mx-auto leading-relaxed">
            {wine.tagline}
          </p>

          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#C5A059]/60 to-transparent mx-auto pt-2" />
        </div>

        {/* 2. SHOWCASE IMAGE (Mərkəzdə İri Planda bg-wine) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 mb-16 sm:mb-24">
          <div className="relative rounded-sm overflow-hidden border border-[#C5A059]/30 shadow-[0_30px_90px_rgba(0,0,0,0.95)] bg-[#110E0E]">
            {/* Ambient inner wine vignette */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#0A0909]/60 via-transparent to-transparent" />
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/10]">
              <Image
                src={wine.bgImage}
                alt={`${wine.name} ${wine.vintage} estate presentation`}
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover object-center brightness-[0.92] contrast-[1.05]"
              />
            </div>

            {/* Subtle corner golden bracket marks */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#C5A059]/60 pointer-events-none z-20" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#C5A059]/60 pointer-events-none z-20" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#C5A059]/60 pointer-events-none z-20" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#C5A059]/60 pointer-events-none z-20" />
          </div>
        </div>

        {/* 3. WINE DATA & DETAILS (Şəklin Altında Şərab Haqqında Datalar) */}
        <div className="max-w-5xl mx-auto px-6 sm:px-10 space-y-16 sm:space-y-24">
          
          {/* Winemaker's Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-mono tracking-[0.3em] text-[#C5A059] uppercase block">
                The Heritage
              </span>
              <h2
                className="text-2xl sm:text-3xl font-light tracking-wide text-[#F5F2EB] uppercase"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Philosophy & Terroir
              </h2>
            </div>
            <div className="lg:col-span-8">
              <p className="text-base sm:text-lg font-light text-[#D0C8BC] leading-relaxed">
                {wine.description}
              </p>
              <div className="mt-4 text-xs font-mono text-[#C5A059] tracking-widest uppercase">
                {wine.region}
              </div>
            </div>
          </div>

          {/* Tasting Notes (Nose, Palate, Finish) */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono tracking-[0.32em] text-[#C5A059] uppercase block">
                Sensory Profile
              </span>
              <h3
                className="text-2xl sm:text-3xl font-light tracking-wide text-[#F5F2EB] uppercase"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Tasting Notes
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Nose */}
              <div className="bg-[#110E0E]/80 border border-white/[0.08] p-6 sm:p-8 space-y-3 relative">
                <span className="text-xs font-mono tracking-[0.24em] text-[#DFBA73] uppercase block">
                  01 · The Bouquet
                </span>
                <h4 className="text-lg font-serif text-[#F5F2EB]">Nose</h4>
                <p className="text-sm font-light text-[#A89F91] leading-relaxed">
                  {wine.tastingNotes.nose}
                </p>
              </div>

              {/* Palate */}
              <div className="bg-[#110E0E]/80 border border-white/[0.08] p-6 sm:p-8 space-y-3 relative">
                <span className="text-xs font-mono tracking-[0.24em] text-[#DFBA73] uppercase block">
                  02 · The Texture
                </span>
                <h4 className="text-lg font-serif text-[#F5F2EB]">Palate</h4>
                <p className="text-sm font-light text-[#A89F91] leading-relaxed">
                  {wine.tastingNotes.palate}
                </p>
              </div>

              {/* Finish */}
              <div className="bg-[#110E0E]/80 border border-white/[0.08] p-6 sm:p-8 space-y-3 relative">
                <span className="text-xs font-mono tracking-[0.24em] text-[#DFBA73] uppercase block">
                  03 · The Memory
                </span>
                <h4 className="text-lg font-serif text-[#F5F2EB]">Finish</h4>
                <p className="text-sm font-light text-[#A89F91] leading-relaxed">
                  {wine.tastingNotes.finish}
                </p>
              </div>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono tracking-[0.32em] text-[#C5A059] uppercase block">
                Cellar Ledger
              </span>
              <h3
                className="text-2xl sm:text-3xl font-light tracking-wide text-[#F5F2EB] uppercase"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Technical Specifications
              </h3>
            </div>

            <div className="border border-white/[0.08] bg-[#110E0E]/60 divide-y divide-white/[0.06]">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
                <div className="p-5 sm:p-6 flex justify-between items-center text-sm">
                  <span className="text-[#8C827A] uppercase tracking-wider text-xs font-mono">Varietal Blend</span>
                  <span className="text-[#F5F2EB] font-serif">{wine.technicalDetails.varietal}</span>
                </div>
                <div className="p-5 sm:p-6 flex justify-between items-center text-sm">
                  <span className="text-[#8C827A] uppercase tracking-wider text-xs font-mono">Alcohol Content</span>
                  <span className="text-[#F5F2EB] font-mono text-xs">{wine.technicalDetails.alcohol}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
                <div className="p-5 sm:p-6 flex justify-between items-center text-sm">
                  <span className="text-[#8C827A] uppercase tracking-wider text-xs font-mono">Oak Maturation</span>
                  <span className="text-[#F5F2EB] font-serif">{wine.technicalDetails.aging}</span>
                </div>
                <div className="p-5 sm:p-6 flex justify-between items-center text-sm">
                  <span className="text-[#8C827A] uppercase tracking-wider text-xs font-mono">Annual Allocation</span>
                  <span className="text-[#F5F2EB] font-serif">{wine.technicalDetails.production}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
                <div className="p-5 sm:p-6 flex justify-between items-center text-sm">
                  <span className="text-[#8C827A] uppercase tracking-wider text-xs font-mono">Serving Temperature</span>
                  <span className="text-[#F5F2EB] font-mono text-xs">{wine.technicalDetails.servingTemp}</span>
                </div>
                <div className="p-5 sm:p-6 flex justify-between items-center text-sm">
                  <span className="text-[#8C827A] uppercase tracking-wider text-xs font-mono">Soil Composition</span>
                  <span className="text-[#F5F2EB] font-serif text-right">{wine.technicalDetails.soilType}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
                <div className="p-5 sm:p-6 flex justify-between items-center text-sm">
                  <span className="text-[#8C827A] uppercase tracking-wider text-xs font-mono">Vineyard Altitude</span>
                  <span className="text-[#F5F2EB] font-mono text-xs">{wine.technicalDetails.altitude}</span>
                </div>
                <div className="p-5 sm:p-6 flex justify-between items-center text-sm">
                  <span className="text-[#8C827A] uppercase tracking-wider text-xs font-mono">Harvest Method</span>
                  <span className="text-[#F5F2EB] font-serif text-right">{wine.technicalDetails.harvest}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gastronomy Pairing & Allocation CTA */}
          <div className="bg-[#110E0E]/90 border border-[#C5A059]/30 p-8 sm:p-12 text-center space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-mono tracking-[0.32em] text-[#C5A059] uppercase block">
                Gastronomy Harmony
              </span>
              <h3
                className="text-2xl sm:text-3xl font-light tracking-wide text-[#F5F2EB] uppercase"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Recommended Pairings
              </h3>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-light text-[#D0C8BC]">
              {wine.foodPairing.map((food, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="px-4 py-2 bg-white/[0.03] border border-white/[0.08]">
                    {food}
                  </span>
                  {i < wine.foodPairing.length - 1 && (
                    <span className="text-[#C5A059]/60 hidden sm:inline">·</span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#contact"
                className="w-full sm:w-auto px-9 py-4 bg-[#C5A059] hover:bg-[#DFBA73] text-[#0A0909] text-xs font-semibold tracking-[0.24em] uppercase transition-all duration-300 shadow-[0_0_25px_rgba(197,160,89,0.3)] hover:shadow-[0_0_35px_rgba(197,160,89,0.5)]"
              >
                Inquire Vintage Allocation
              </Link>
              <CurtainLink
                href="/#collection"
                label="Domaine Auris"
                title="The Collection"
                className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-white/50 text-xs tracking-[0.2em] uppercase text-[#D0C8BC] hover:text-[#F5F2EB] transition-colors"
              >
                Explore Other Vintages
              </CurtainLink>
            </div>
          </div>

        </div>

      </main>

      {/* Luxury Estate Footer */}
      <Footer />
    </div>
  );
}
