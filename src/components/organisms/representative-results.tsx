import { RepresentativeCard } from "@/components/molecules/representative-card";
import type { RepresentationSummary } from "@/domain/officials/types";

export function RepresentativeResults({
  representation,
}: {
  representation: RepresentationSummary[];
}) {
  const districtOfficials = representation.filter(
    ({ position }) => position.chamber !== "us-senate",
  );
  const statewideOfficials = representation.filter(
    ({ position }) => position.chamber === "us-senate",
  );

  return (
    <section
      className="representative-results"
      aria-labelledby="representatives-title"
    >
      <div className="representative-results__header">
        <p className="eyebrow">Current officeholders</p>
        <h2
          className="representative-results__title"
          id="representatives-title"
        >
          Who represents this address
        </h2>
        <p className="representative-results__introduction">
          Officeholders are matched to the confirmed districts above. Party is
          shown as a sourced fact and does not affect order or prominence.
        </p>
      </div>

      <div className="representative-results__grid">
        {districtOfficials.map((item) => (
          <RepresentativeCard key={item.position.id} representation={item} />
        ))}
      </div>

      <h3 className="representative-results__subheading">
        Nevada’s statewide U.S. senators
      </h3>
      <div className="representative-results__grid representative-results__grid--statewide">
        {statewideOfficials.map((item) => (
          <RepresentativeCard key={item.position.id} representation={item} />
        ))}
      </div>
    </section>
  );
}
