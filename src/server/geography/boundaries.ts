import "server-only";

import boundaryData from "@/data/generated/nevada-boundaries-2021.json";
import type { BoundaryBundle } from "@/domain/geography/types";

export function getBoundaryBundle(): BoundaryBundle {
  return boundaryData as unknown as BoundaryBundle;
}
