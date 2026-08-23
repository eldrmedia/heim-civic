import Link from "next/link";

import { BrandLockup } from "@/components/atoms/brand-lockup";
import { Button } from "@/components/atoms/button";

const navigation = [
  { href: "/search", label: "Search records" },
  { href: "/districts", label: "Districts" },
  { href: "/#foundation", label: "What we’re building" },
  { href: "/bills", label: "2025 bills" },
  { href: "/finance", label: "Finance pilot" },
  { href: "/docs", label: "Methodology" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="layout-shell site-header__inner">
        <BrandLockup />
        <nav className="site-header__nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              className="site-header__link"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-header__actions">
          <Button asChild intent="secondary" size="small">
            <Link href="/join">Join the waitlist</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
