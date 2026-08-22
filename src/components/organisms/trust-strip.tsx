import { BookOpenCheck, Eye, ShieldCheck } from "lucide-react";

const trustItems = [
  {
    icon: BookOpenCheck,
    title: "Source-driven",
    text: "Material records link back to authoritative public sources.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-minimized",
    text: "Lookup addresses are transient and excluded from analytics.",
  },
  {
    icon: Eye,
    title: "Accessible by default",
    text: "Maps and charts include complete textual equivalents.",
  },
] as const;

export function TrustStrip() {
  return (
    <aside className="trust-strip" aria-label="Product commitments">
      <div className="layout-shell trust-strip__items">
        {trustItems.map(({ icon: Icon, text, title }) => (
          <div className="trust-strip__item" key={title}>
            <Icon className="trust-strip__icon" aria-hidden="true" />
            <span>
              <strong className="trust-strip__title">{title}</strong>
              <span className="trust-strip__text">{text}</span>
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
