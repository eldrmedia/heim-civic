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
    title: "Finance with honest boundaries",
    text: "The Phase 5 pilot preserves official FEC categories and separates candidate-authorized activity from spending by outside groups.",
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
          <p className="eyebrow">Phase 5 · Campaign-finance vertical slice</p>
          <h2 className="section-heading__title" id="foundation-title">
            Nevada warmth. Rigorous civic data underneath.
          </h2>
          <p className="section-heading__body">
            The fifth phase adds two current-cycle federal finance records,
            proving reporting-period, classification, and profile connections
            before broader coverage.
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

        <div className="phase-note" id="phase-five">
          <div>
            <h3 className="phase-note__title">Private alpha scope</h3>
            <p className="phase-note__text">
              District lookup, current profiles, and the two-bill legislation
              slice remain live. Finance coverage is limited to two federal
              House profiles; Nevada state finance and outside-spending totals
              remain excluded until their separate provenance gates are met.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
