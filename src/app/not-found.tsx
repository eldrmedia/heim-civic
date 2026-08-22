import Link from "next/link";

import { Button } from "@/components/atoms/button";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">404</p>
      <h1>That public record is not here.</h1>
      <p>
        The link may be outdated, or the requested record may not be in pilot
        coverage yet.
      </p>
      <Button asChild>
        <Link href="/">Return home</Link>
      </Button>
    </main>
  );
}
