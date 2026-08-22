import { MapPinned, ScanSearch, ShieldCheck } from "lucide-react";

const foundations = [
  {
    icon: MapPinned,
    title: "Official Nevada boundaries",
    text: "All 67 congressional and state legislative districts come from checksum-pinned Nevada Legislative Counsel Bureau shapefiles.",
  },
  {
    icon: ShieldCheck,
    title: "A private lookup boundary",
    text: "Addresses are validated and geocoded server-side, excluded from persistence, and never returned as a precise point on the map.",
  },
  {
    icon: ScanSearch,
    title: "Uncertainty stays visible",
    text: "Ambiguous matches ask for clarification, while boundary gaps or source disagreements fail closed for review.",
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
          <p className="eyebrow">Phase 2 · Geographic private alpha</p>
          <h2 className="section-heading__title" id="foundation-title">
            Nevada warmth. Rigorous civic data underneath.
          </h2>
          <p className="section-heading__body">
            The second phase turns the foundation into a working Nevada district
            finder while keeping representative, bill, vote, and finance records
            outside the product until their own source gates are complete.
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

        <div className="phase-note" id="phase-two">
          <div>
            <h3 className="phase-note__title">Private alpha scope</h3>
            <p className="phase-note__text">
              District lookup is live for private testing. Officeholders, bills,
              votes, and campaign-finance records remain intentionally excluded
              until later phases satisfy their provenance and reconciliation
              requirements.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
