import type { Metadata } from "next";
import { DEPARTMENTS, ESTATE } from "@/data/estate";
import { PageHeader, PageShell, cinzel, textLinkClass } from "@/components/PageElements";

export const metadata: Metadata = {
  title: "Contact | Domaine Auris",
  description: "General enquiries, private allocations, estate visits and trade contacts for Domaine Auris.",
};

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader label={ESTATE.location} title="Contact">
        We would be delighted to hear from you. Every letter is answered personally.
      </PageHeader>

      <section aria-label="Enquiries" className="max-w-5xl mx-auto px-6 sm:px-10">
        {/* A 1px gap over a hairline-coloured ground draws the dividers between cells */}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.08] border-y border-white/[0.08]">
          {DEPARTMENTS.map((department) => (
            <li key={department.id} id={department.id} className="scroll-mt-28 bg-[#0A0909] px-6 py-10 sm:py-12 text-center">
              <h2 className="text-sm sm:text-base tracking-[0.18em] uppercase text-[#F5F2EB]" style={cinzel}>
                {department.title}
              </h2>
              <p className="mt-3 font-serif text-lg text-[#A89F91]">{department.note}</p>
              <a href={`mailto:${department.email}`} className={`mt-5 inline-block text-sm tracking-wide ${textLinkClass}`}>
                {department.email}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-label="Visiting the estate"
        className="max-w-5xl mx-auto px-6 sm:px-10 mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 text-center"
      >
        <div>
          <h2 className="text-xs font-mono tracking-[0.3em] text-[#C5A059] uppercase">The Estate</h2>
          <address className="mt-4 not-italic font-serif text-lg leading-relaxed text-[#D0C8BC]">
            {ESTATE.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>
        <div>
          <h2 className="text-xs font-mono tracking-[0.3em] text-[#C5A059] uppercase">Telephone</h2>
          <p className="mt-4 font-serif text-lg">
            <a href={`tel:${ESTATE.phone.replace(/\s/g, "")}`} className={textLinkClass}>
              {ESTATE.phone}
            </a>
          </p>
        </div>
        <div>
          <h2 className="text-xs font-mono tracking-[0.3em] text-[#C5A059] uppercase">Visiting Hours</h2>
          <p className="mt-4 font-serif text-lg leading-relaxed text-[#D0C8BC]">
            {ESTATE.hours.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
      </section>
    </PageShell>
  );
}
