import "server-only";

import type { WaitlistEnvelope } from "@/domain/waitlist/types";

export type WaitlistDeliveryConfig = {
  endpoint: string;
  token: string;
};

export function getWaitlistDeliveryConfig(): WaitlistDeliveryConfig | null {
  const endpoint = process.env.WAITLIST_INTAKE_WEBHOOK_URL?.trim();
  const token = process.env.WAITLIST_INTAKE_WEBHOOK_TOKEN?.trim();

  if (!endpoint || !token) return null;

  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return null;
  } catch {
    return null;
  }

  return { endpoint, token };
}

export async function deliverWaitlistRequest(
  envelope: WaitlistEnvelope,
  config: WaitlistDeliveryConfig,
): Promise<void> {
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "User-Agent": "heim-civic-nevada-waitlist/1.0",
    },
    body: JSON.stringify(envelope),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`Waitlist delivery failed with status ${response.status}`);
  }
}
