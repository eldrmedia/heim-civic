import type { PartyCode } from "@/domain/officials/types";

export function PartyLabel({
  code,
  label,
}: {
  code: PartyCode;
  label: string;
}) {
  return (
    <span className="party-label">
      <span aria-hidden="true">{code}</span>
      <span>{label}</span>
    </span>
  );
}
