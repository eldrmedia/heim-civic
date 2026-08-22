import { BadgeCheck, Landmark, Vote } from "lucide-react";

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
    icon: Vote,
    title: "Bills connected to people",
    text: "The Phase 4 pilot links official summaries, sponsors, actions, and recorded votes back to current profiles when identities reconcile.",
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
          <p className="eyebrow">Phase 4 · Bills and votes vertical slice</p>
          <h2 className="section-heading__title" id="foundation-title">
            Nevada warmth. Rigorous civic data underneath.
          </h2>
          <p className="section-heading__body">
            The fourth phase adds one Nevada and one federal bill end to end,
            proving the source, vote, and profile connections before scaling.
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

        <div className="phase-note" id="phase-four">
          <div>
            <h3 className="phase-note__title">Private alpha scope</h3>
            <p className="phase-note__text">
              District lookup and current profiles remain live for private
              testing. Legislative coverage is limited to two clearly labeled
              pilot bills; complete bill history and campaign finance remain
              excluded until their later provenance gates are satisfied.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
