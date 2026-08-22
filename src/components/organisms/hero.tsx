import { LookupExperience } from "@/components/organisms/lookup-experience";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="layout-shell hero__inner">
        <div className="hero__intro">
          <p className="eyebrow">Independent · Nonpartisan · Nevada</p>
          <h1 className="hero__title" id="hero-title">
            Understand who represents you.
          </h1>
          <p className="hero__lede">
            Heim Civic Nevada is building one clear, source-driven place to find
            your districts, representatives, bills, votes, and public records.
          </p>
        </div>
        <LookupExperience />
      </div>
    </section>
  );
}
