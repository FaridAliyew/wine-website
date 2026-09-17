import type { Metadata } from "next";
import { ESTATE, departmentEmail } from "@/data/estate";
import {
  FramedImage,
  PageHeader,
  PageShell,
  SectionHeading,
  cinzel,
  outlineButtonClass,
  textLinkClass,
} from "@/components/PageElements";

export const metadata: Metadata = {
  title: "Visit | Domaine Auris",
  description: "Cellar tastings, vineyard walks and dinners at Domaine Auris in Tovuz, Azerbaijan. By appointment.",
};

const EXPERIENCES = [
  {
    title: "Cellar Tasting",
    duration: "60 minutes",
    guests: "Up to 8 guests",
    description: "A guided tasting of the five current releases, poured in the barrel cellar where they were aged.",
  },
  {
    title: "Vineyard Walk",
    duration: "90 minutes",
    guests: "Up to 6 guests",
    description: "Walk the terraces above the Tovuzchay with our vineyard team, ending with a glass of Luna Verde by the river.",
  },
  {
    title: "Cellar Dinner",
    duration: "Evening",
    guests: "Up to 12 guests",
    description: "A seasonal menu from the Tovuz valley, paired with library vintages of Auris Reserve.",
  },
];

const visitsEmail = departmentEmail("visits");
const requestHref = `mailto:${visitsEmail}?subject=${encodeURIComponent("Visit request")}`;

export default function VisitPage() {
  return (
    <PageShell>
      <PageHeader label="By Appointment" title="Visit">
        The estate welcomes a small number of guests each week, for tastings, vineyard walks and dinners among the
        barrels.
      </PageHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 mb-16 sm:mb-24">
        <FramedImage
          src="/images/hero-bg-glass.jpg"
          alt="A glass of red wine on the terrace above the vineyards at sunrise"
          aspect="aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/10]"
          sizes="(max-width: 1200px) 100vw, 1200px"
          eager
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-10 space-y-16 sm:space-y-24">
        {/* Experiences */}
        <section className="space-y-8 sm:space-y-10">
          <SectionHeading label="At the Estate" title="Experiences" centered />
          {/* A 1px gap over a hairline-coloured ground draws the dividers between cells */}
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.08] border-y border-white/[0.08]">
            {EXPERIENCES.map((experience, i) => (
              <li key={experience.title} className="bg-[#0A0909] px-6 py-10 sm:py-12 text-center">
                <span className="font-mono text-xs tracking-[0.24em] text-[#C5A059]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-base tracking-[0.18em] uppercase text-[#F5F2EB]" style={cinzel}>
                  {experience.title}
                </h3>
                <p className="mt-2 font-mono text-[11px] tracking-[0.2em] uppercase text-[#8C827A]">
                  {experience.duration} · {experience.guests}
                </p>
                <p className="mt-5 font-serif text-lg text-[#A89F91] leading-relaxed">{experience.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Practical details */}
        <section className="space-y-10 sm:space-y-12">
          <SectionHeading label="Practical Details" title="Plan Your Visit" centered />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 text-center">
            <div>
              <h3 className="text-xs font-mono tracking-[0.3em] text-[#C5A059] uppercase">Visiting Hours</h3>
              <p className="mt-4 font-serif text-lg leading-relaxed text-[#D0C8BC]">
                {ESTATE.hours.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-mono tracking-[0.3em] text-[#C5A059] uppercase">Getting Here</h3>
              <p className="mt-4 font-serif text-lg leading-relaxed text-[#D0C8BC]">
                <span className="block">{ESTATE.location}</span>
                <span className="block">90 minutes from Ganja International Airport</span>
              </p>
            </div>
            <div>
              <h3 className="text-xs font-mono tracking-[0.3em] text-[#C5A059] uppercase">Reservations</h3>
              <p className="mt-4 font-serif text-lg leading-relaxed text-[#D0C8BC]">
                <span className="block">At least 48 hours in advance</span>
                <a href={requestHref} className={`inline-block mt-1 ${textLinkClass}`}>
                  {visitsEmail}
                </a>
              </p>
            </div>
          </div>

          <div className="text-center">
            <a href={requestHref} className={outlineButtonClass}>
              Request a Visit
            </a>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
