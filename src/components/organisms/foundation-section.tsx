import { BadgeCheck, Landmark, ScanSearch } from "lucide-react";

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
    icon: ScanSearch,
    title: "Vacancies stay explicit",
    text: "The data model and interface distinguish occupied, vacant, and transitional seats instead of guessing an officeholder.",
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
          <p className="eyebrow">Phase 3 · Representative private alpha</p>
          <h2 className="section-heading__title" id="foundation-title">
            Nevada warmth. Rigorous civic data underneath.
          </h2>
          <p className="section-heading__body">
            The third phase connects a confirmed Nevada district result to
            source-verified current officeholders and basic public profiles.
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

        <div className="phase-note" id="phase-three">
          <div>
            <h3 className="phase-note__title">Private alpha scope</h3>
            <p className="phase-note__text">
              District lookup, current officeholder cards, and basic official
              profiles are live for private testing. Bills, recorded votes, and
              campaign-finance records remain intentionally excluded until later
              phases satisfy their provenance and reconciliation requirements.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
