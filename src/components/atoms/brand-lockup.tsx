import Link from "next/link";

type BrandLockupProps = {
  inverse?: boolean;
};

export function BrandLockup({ inverse = false }: BrandLockupProps) {
  return (
    <Link
      className="brand-lockup"
      href="/"
      aria-label="Heim Civic Nevada home"
      data-inverse={inverse || undefined}
    >
      <svg
        className="brand-lockup__mark"
        viewBox="0 0 64 64"
        role="img"
        aria-label="Heim Civic Nevada mark"
      >
        <rect width="64" height="64" rx="14" fill="#0f513f" />
        <path d="M14 13h12v38H14zm24 0h12v38H38z" fill="#f7eddc" />
        <path d="m18 37 10-9 7 6 11-13v18L35 34l-8 8z" fill="#c9673f" />
        <circle cx="32" cy="20" r="4" fill="#e5a46d" />
      </svg>
      <span>
        <span className="brand-lockup__name">Heim Civic</span>
        <span className="brand-lockup__place">NEVADA</span>
      </span>
    </Link>
  );
}
