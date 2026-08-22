import { BadgeCheck, Landmark, ReceiptText } from "lucide-react";

const foundations = [
  {
    icon: Landmark,
    title: "All five current offices",
    text: "Each confirmed lookup connects the three matching districts with Nevada’s two statewide U.S. Senate seats.",
  },
  {
    icon: BadgeCheck,
    title: "Official records, retained",
    text: "Every officeholder carries authoritative source links, stable identifiers, retrieval times, and source-document hashes.",
  },
  {
    icon: ReceiptText,
    title: "Discovery and correction",
    text: "Phase 6 adds source-bounded civic search and a free correction intake with validation, case references, and an auditable received state.",
  },
] as const;

export function FoundationSection() {
  return (
    <section
      className="foundation"
      id="foundation"
      aria-labelledby="foundation-title"
    >
      <div className="layout-shell">
        <div className="section-heading">
          <p className="eyebrow">Phase 6 · Search and corrections</p>
          <h2 className="section-heading__title" id="foundation-title">
            Nevada warmth. Rigorous civic data underneath.
          </h2>
          <p className="section-heading__body">
            The sixth phase makes the reviewed pilot records discoverable and
            opens an evidence-based path for the public to challenge a fact.
          </p>
        </div>

        <div className="foundation__grid">
          {foundations.map(({ icon: Icon, text, title }) => (
            <article className="foundation-card" key={title}>
              <span className="foundation-card__icon">
                <Icon aria-hidden="true" />
              </span>
              <h3 className="foundation-card__title">{title}</h3>
              <p className="foundation-card__text">{text}</p>
            </article>
          ))}
        </div>

        <div className="phase-note" id="phase-six">
          <div>
            <h3 className="phase-note__title">Private alpha scope</h3>
            <p className="phase-note__text">
              Search covers published officials, districts, pilot bills, and
              subjects only. Finance coverage remains limited to two federal
              House profiles; Nevada state finance and outside-spending totals
              stay excluded until their separate provenance gates are met.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
