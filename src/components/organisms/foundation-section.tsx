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
    title: "Every 2025 Nevada bill",
    text: "The complete official index covers 1,152 source-listed Assembly and Senate bill records while enhanced coverage remains clearly labeled.",
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
          <p className="eyebrow">Phase 9.1 · Complete bill discovery</p>
          <h2 className="section-heading__title" id="foundation-title">
            Nevada warmth. Rigorous civic data underneath.
          </h2>
          <p className="section-heading__body">
            Comprehensive discovery and deeper editorial review now have
            separate, visible coverage levels.
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

        <div className="phase-note" id="phase-nine-one">
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
