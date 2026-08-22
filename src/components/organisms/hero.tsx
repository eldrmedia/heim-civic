import { ShieldCheck } from "lucide-react";

import { AddressLookup } from "@/components/molecules/address-lookup";
import { DistrictMapPreview } from "@/components/molecules/district-map-preview";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="layout-shell hero__inner">
        <div>
          <p className="eyebrow">Independent · Nonpartisan · Nevada</p>
          <h1 className="hero__title" id="hero-title">
            Understand who represents you.
          </h1>
          <p className="hero__lede">
            Heim Civic Nevada is building one clear, source-driven place to find
            your districts, representatives, bills, votes, and public records.
          </p>
          <AddressLookup />
          <p className="hero__privacy">
            <ShieldCheck className="hero__privacy-icon" aria-hidden="true" />
            Exact residential addresses will be used transiently to determine
            districts and will never be retained.
          </p>
        </div>
        <DistrictMapPreview />
      </div>
    </section>
  );
}
