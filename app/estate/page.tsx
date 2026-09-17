import type { Metadata } from "next";
import Link from "next/link";
import PourLink from "@/components/PourLink";
import { ESTATE } from "@/data/estate";
import { WINES } from "@/data/wines";
import {
  FramedImage,
  PageHeader,
  PageShell,
  SectionHeading,
  outlineButtonClass,
  textLinkClass,
} from "@/components/PageElements";

export const metadata: Metadata = {
  title: "The Estate | Domaine Auris",
  description: "The story, vineyards and cellar of Domaine Auris in Tovuz, Azerbaijan.",
};

const altitude = (text: string) => Number.parseInt(text, 10);

// One parcel per wine, walked from the highest terrace down to the river
const PARCELS = WINES.map((wine) => ({
  slug: wine.slug,
  wine: wine.name,
  parcel: wine.region.split(", ").slice(1).join(", "),
  soil: wine.technicalDetails.soilType,
  altitude: altitude(wine.technicalDetails.altitude),
})).sort((a, b) => b.altitude - a.altitude);

export default function EstatePage() {
  return (
    <PageShell>
      <PageHeader label={ESTATE.location} title="The Estate">
        Five parcels on the foothills of the Lesser Caucasus, farmed by hand since the first vines were planted.
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 mb-16 sm:mb-24">
        <FramedImage
          src="/images/hero-landscape.jpg"
          alt="Vineyard terraces below the estate at sunrise"
          aspect="aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/10]"
          sizes="(max-width: 1200px) 100vw, 1200px"
          eager
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-10 space-y-16 sm:space-y-24">
        {/* Story */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          <div className="lg:col-span-4">
            <SectionHeading label="The Heritage" title="Our Story" />
          </div>
          <div className="lg:col-span-8 space-y-5 text-base sm:text-lg font-light text-[#D0C8BC] leading-relaxed">
            <p>
              Domaine Auris began with a single terrace of old vines above the Tovuzchay river, where morning mist
              rolls down from the Lesser Caucasus and the afternoons stay warm and dry. The first vintage was pressed by
              hand in a stone barn that still stands at the heart of the estate.
            </p>
            <p>
              Today the estate farms five parcels between 510 and 700 metres. Each is picked, fermented and aged on its
              own, and bottled only when the vintage deserves the name. In some years, that means not at all.
            </p>
          </div>
        </section>

        {/* Vineyards */}
        <section className="space-y-8 sm:space-y-10">
          <SectionHeading label="Terroir" title="The Vineyards" centered />
          <p className="max-w-2xl mx-auto text-center font-serif text-lg text-[#A89F91] leading-relaxed text-balance">
            Every wine comes from a single parcel. Its soil, altitude and exposure are the reasons it tastes the way it
            does.
          </p>

          <ol className="border-y border-white/[0.08] divide-y divide-white/[0.06]">
            {PARCELS.map((parcel, i) => (
              <li
                key={parcel.slug}
                className="grid grid-cols-[2.5rem_1fr] md:grid-cols-12 gap-x-4 gap-y-2 py-6 sm:py-7 md:items-baseline"
              >
                <span className="font-mono text-xs tracking-[0.24em] text-[#C5A059] md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="md:col-span-4">
                  <p className="font-serif text-xl text-[#F5F2EB]">{parcel.parcel}</p>
                  <PourLink slug={parcel.slug} className={`mt-1 inline-block text-xs tracking-[0.2em] uppercase ${textLinkClass}`}>
                    {parcel.wine}
                  </PourLink>
                </div>
                <p className="col-start-2 md:col-span-5 text-sm font-light text-[#A89F91] leading-relaxed">{parcel.soil}</p>
                <p className="col-start-2 md:col-span-2 md:text-right font-mono text-xs tracking-[0.2em] text-[#D0C8BC] uppercase">
                  {parcel.altitude} m
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Cellar */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <FramedImage
              src="/images/bg-wine2.jpg"
              alt="French oak barriques resting in the stone cellar"
              aspect="aspect-[4/3]"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <SectionHeading label="Craft" title="In the Cellar" />
            <div className="space-y-5 text-base sm:text-lg font-light text-[#D0C8BC] leading-relaxed">
              <p>
                Grapes reach the cellar within the hour and are sorted by hand on a single table. Reds ferment with
                indigenous yeasts in raw concrete vats, then rest in French oak for up to twenty-four months. Whites stay
                cool in stainless steel, on their fine lees.
              </p>
              <p>Nothing is fined or filtered, and every bottle of Auris Reserve is numbered by hand.</p>
            </div>
            <blockquote className="border-l border-[#C5A059]/50 pl-5">
              <p className="font-serif italic text-xl text-[#F5F2EB] leading-relaxed">
                “We do very little to the wine. The work is in the vineyard, and in knowing when to wait.”
              </p>
              <footer className="mt-3 font-mono text-xs tracking-[0.24em] text-[#C5A059] uppercase">The Cellar Master</footer>
            </blockquote>
          </div>
        </section>

        {/* Visit */}
        <section className="text-center space-y-6 border-t border-white/[0.08] pt-16 sm:pt-20">
          <SectionHeading label="By Appointment" title="Visit the Estate" centered />
          <p className="max-w-xl mx-auto font-serif text-lg text-[#A89F91] leading-relaxed text-balance">
            Taste the current releases in the barrel cellar, or walk the terraces with our vineyard team.
          </p>
          <Link href="/visit" className={outlineButtonClass}>
            Plan a Visit
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
