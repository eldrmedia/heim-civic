import "server-only";

import type { CorrectionIntakeEnvelope } from "@/domain/corrections/types";

export type CorrectionDeliveryConfig = {
  endpoint: string;
  token: string;
};

export function getCorrectionDeliveryConfig(): CorrectionDeliveryConfig | null {
  const endpoint = process.env.CORRECTIONS_INTAKE_WEBHOOK_URL?.trim();
  const token = process.env.CORRECTIONS_INTAKE_WEBHOOK_TOKEN?.trim();

  if (!endpoint || !token) return null;

  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return null;
  } catch {
    return null;
  }

  return { endpoint, token };
}

export async function deliverCorrection(
  envelope: CorrectionIntakeEnvelope,
  config: CorrectionDeliveryConfig,
): Promise<void> {
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "User-Agent": "heim-civic-nevada-correction-intake/1.0",
    },
    body: JSON.stringify(envelope),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(
      `Correction delivery failed with status ${response.status}`,
    );
  }
}
