import { Blocks, DatabaseZap, ScanSearch } from "lucide-react";

const foundations = [
  {
    icon: Blocks,
    title: "A durable product system",
    text: "Accessible primitives, reusable Atomic Design components, strict TypeScript, and a restrained Nevada Commons visual language.",
  },
  {
    icon: DatabaseZap,
    title: "Provenance before volume",
    text: "Every future import carries its source, retrieval time, original value, normalized value, parser version, and review state.",
  },
  {
    icon: ScanSearch,
    title: "Discovery before ingestion",
    text: "Official Nevada and federal sources are inventoried and tested with representative fixtures before adapters are generalized.",
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
          <p className="eyebrow">Phase 1 foundation</p>
          <h2 className="section-heading__title" id="foundation-title">
            Nevada warmth. Rigorous civic data underneath.
          </h2>
          <p className="section-heading__body">
            The first phase establishes the product, engineering, privacy, and
            source standards needed before any address lookup or political
            record is published.
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

        <div className="phase-note" id="phase-one">
          <div>
            <h3 className="phase-note__title">This is a foundation preview.</h3>
            <p className="phase-note__text">
              It intentionally contains no live address processing, district
              boundaries, officeholders, bills, votes, or campaign-finance data.
              Those become public only after source validation and
              requirement-specific tests.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
