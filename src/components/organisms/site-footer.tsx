import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="layout-shell site-footer__inner">
        <p className="site-footer__statement">
          Heim Civic Nevada is an independent public-interest project of Heim
          Civic Foundation. It is not an official government service.
        </p>
        <nav className="site-footer__links" aria-label="Footer navigation">
          <Link className="site-footer__link" href="/search">
            Search
          </Link>
          <Link className="site-footer__link" href="/districts">
            Districts
          </Link>
          <Link className="site-footer__link" href="/docs">
            Methodology
          </Link>
          <Link className="site-footer__link" href="/privacy">
            Privacy
          </Link>
          <Link className="site-footer__link" href="/security">
            Security
          </Link>
          <Link className="site-footer__link" href="/editorial">
            Editorial
          </Link>
          <Link className="site-footer__link" href="/funding">
            Funding
          </Link>
          <Link className="site-footer__link" href="/status">
            Source freshness
          </Link>
          <Link className="site-footer__link" href="/pricing">
            Future pricing
          </Link>
          <Link className="site-footer__link" href="/corrections">
            Corrections
          </Link>
          <Link className="site-footer__link" href="/join">
            Waitlist
          </Link>
        </nav>
      </div>
    </footer>
  );
}
