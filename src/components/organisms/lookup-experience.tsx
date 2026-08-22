"use client";

import { AlertCircle, Search, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/atoms/button";
import { AccessibleDistrictMap } from "@/components/molecules/accessible-district-map";
import type { LookupResponse } from "@/domain/geography/types";

export function LookupExperience() {
  const [address, setAddress] = useState("");
  const [response, setResponse] = useState<LookupResponse | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setResponse(null);

    try {
      const request = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
        cache: "no-store",
      });
      const result = (await request.json()) as LookupResponse;

      setResponse(result);
      if (result.status === "confirmed") setAddress("");
    } catch {
      setResponse({
        status: "review",
        message:
          "The lookup service is temporarily unavailable. Try again shortly.",
      });
    } finally {
      setIsPending(false);
    }
  }

  const feedback =
    response && response.status !== "confirmed" ? response : null;

  return (
    <div className="lookup-experience">
      <div className="lookup-experience__content">
        <form className="address-lookup" onSubmit={handleSubmit}>
          <label className="address-lookup__label" htmlFor="nevada-address">
            Find who represents you
          </label>
          <div className="address-lookup__control">
            <input
              className="address-lookup__field"
              id="nevada-address"
              name="address"
              type="text"
              autoComplete="street-address"
              placeholder="Enter your Nevada street address"
              aria-describedby="lookup-hint lookup-feedback"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              maxLength={200}
              required
            />
            <Button type="submit" size="large" disabled={isPending}>
              <Search aria-hidden="true" size={18} />
              {isPending ? "Finding districts…" : "Find my districts"}
            </Button>
          </div>
          <p className="address-lookup__hint" id="lookup-hint">
            Include street, city, state, and ZIP code. P.O. boxes cannot
            identify a district.
          </p>
        </form>

        <p className="hero__privacy">
          <ShieldCheck className="hero__privacy-icon" aria-hidden="true" />
          Your address is sent securely for this lookup, is not written to our
          database, and is cleared from the field after a confirmed match.
        </p>

        <div
          className="lookup-feedback"
          id="lookup-feedback"
          aria-live="polite"
          aria-atomic="true"
        >
          {feedback ? (
            <div className="lookup-feedback__message" role="status">
              <AlertCircle aria-hidden="true" size={18} />
              <div>
                <p>
                  {feedback.status === "ambiguous"
                    ? "Choose the intended address and search again."
                    : feedback.message}
                </p>
                {feedback.status === "ambiguous" ? (
                  <ul className="lookup-feedback__suggestions">
                    {feedback.suggestions.map((suggestion) => (
                      <li key={suggestion}>
                        <button
                          className="lookup-feedback__suggestion"
                          type="button"
                          onClick={() => setAddress(suggestion)}
                        >
                          {suggestion}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {response?.status === "confirmed" ? (
        <div className="lookup-experience__result">
          <p className="lookup-experience__matched">
            <strong>Address matched.</strong> Your precise location is not shown
            on the map.
          </p>
          <AccessibleDistrictMap districts={response.districts} />
        </div>
      ) : (
        <div
          className="lookup-placeholder"
          aria-label="District lookup preview"
        >
          <div className="lookup-placeholder__mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="eyebrow">Private alpha</p>
          <h2 className="lookup-placeholder__title">
            Three boundaries, one answer
          </h2>
          <p className="lookup-placeholder__text">
            Search a Nevada street address to see your U.S. congressional, state
            Senate, and state Assembly districts together.
          </p>
        </div>
      )}
    </div>
  );
}
