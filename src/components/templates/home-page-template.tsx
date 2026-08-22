import { FoundationSection } from "@/components/organisms/foundation-section";
import { Hero } from "@/components/organisms/hero";
import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";
import { TrustStrip } from "@/components/organisms/trust-strip";

export function HomePageTemplate() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <TrustStrip />
        <FoundationSection />
      </main>
      <SiteFooter />
    </>
  );
}
