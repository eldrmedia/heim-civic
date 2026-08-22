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
    title: "Public trust operations",
    text: "Phase 8 adds enforced correction states, immutable audit-event contracts, confirmed-opt-in waitlist intake, and public editorial, funding, pricing, and freshness disclosures.",
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
          <p className="eyebrow">Phase 8 · Trust and civic operations</p>
          <h2 className="section-heading__title" id="foundation-title">
            Nevada warmth. Rigorous civic data underneath.
          </h2>
          <p className="section-heading__body">
            The eighth phase makes participation and editorial accountability
            explicit before the private alpha asks the public for trust.
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

        <div className="phase-note" id="phase-eight">
          <div>
            <h3 className="phase-note__title">Private alpha scope</h3>
            <p className="phase-note__text">
              Application contracts are complete, but hosted correction and
              waitlist receivers, a verified material-funder roster, and live
              monitoring remain required before public launch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
