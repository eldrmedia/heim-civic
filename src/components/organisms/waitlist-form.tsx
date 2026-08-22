"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/atoms/button";
import type { WaitlistResponse } from "@/domain/waitlist/types";

type WaitlistFormState = {
  response: WaitlistResponse | null;
  pending: boolean;
};

const features = [
  {
    value: "districts-and-representatives",
    label: "Districts and representatives",
  },
  { value: "bills-and-votes", label: "Bills and recorded votes" },
  { value: "campaign-finance", label: "Campaign finance" },
  { value: "corrections-and-sources", label: "Corrections and source quality" },
  { value: "professional-research", label: "Professional research tools" },
] as const;

export function WaitlistForm() {
  const [state, setState] = useState<WaitlistFormState>({
    response: null,
    pending: false,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ response: null, pending: true });

    const form = event.currentTarget;
    const data = new FormData(form);
    const role = String(data.get("role") ?? "");
    const membershipInterest = String(data.get("membershipInterest") ?? "");
    const payload = {
      email: data.get("email"),
      consent: data.get("consent") === "on",
      location: data.get("location"),
      role: role || null,
      desiredFeatures: data.getAll("desiredFeatures"),
      membershipInterest: membershipInterest || null,
      website: data.get("website"),
    };

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as WaitlistResponse;
      setState({ response: result, pending: false });

      if (result.status === "confirmation-pending") form.reset();
    } catch {
      setState({
        pending: false,
        response: {
          status: "unavailable",
          message:
            "The waitlist could not be reached. Your information was not retained.",
        },
      });
    }
  }

  const fieldErrors =
    state.response?.status === "invalid" ? state.response.fields : undefined;

  return (
    <form className="waitlist-form" noValidate onSubmit={handleSubmit}>
      <div className="waitlist-form__field">
        <label htmlFor="waitlist-email">Email address</label>
        <input
          aria-describedby="waitlist-email-hint waitlist-email-error"
          autoComplete="email"
          id="waitlist-email"
          maxLength={254}
          name="email"
          required
          type="email"
        />
        <span id="waitlist-email-hint">
          We will send one confirmation email. You are not subscribed until you
          confirm.
        </span>
        <FieldError errors={fieldErrors?.email} id="waitlist-email-error" />
      </div>

      <div className="waitlist-form__grid">
        <div className="waitlist-form__field">
          <label htmlFor="waitlist-location">
            Nevada ZIP or county (optional)
          </label>
          <input
            aria-describedby="waitlist-location-hint waitlist-location-error"
            id="waitlist-location"
            maxLength={80}
            name="location"
            placeholder="89501 or Washoe County"
          />
          <span id="waitlist-location-hint">
            Do not enter a street address.
          </span>
          <FieldError
            errors={fieldErrors?.location}
            id="waitlist-location-error"
          />
        </div>
        <div className="waitlist-form__field">
          <label htmlFor="waitlist-role">
            How would you use the site? (optional)
          </label>
          <select id="waitlist-role" name="role" defaultValue="">
            <option value="">Choose a role</option>
            <option value="resident">Nevada resident</option>
            <option value="journalist">Journalist</option>
            <option value="nonprofit">Nonprofit or civic organization</option>
            <option value="educator">Educator or student</option>
            <option value="government">Government staff</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <fieldset className="waitlist-form__fieldset">
        <legend>What would be most useful? (optional)</legend>
        <div className="waitlist-form__choices">
          {features.map((feature) => (
            <label key={feature.value}>
              <input
                name="desiredFeatures"
                type="checkbox"
                value={feature.value}
              />
              <span>{feature.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="waitlist-form__field">
        <label htmlFor="membership-interest">
          Future membership interest (optional)
        </label>
        <select
          defaultValue=""
          id="membership-interest"
          name="membershipInterest"
        >
          <option value="">Choose an option</option>
          <option value="not-sure">Not sure yet</option>
          <option value="five-dollars">Interested at $5 monthly</option>
          <option value="ten-dollars">Interested at $10 monthly</option>
          <option value="no-paid-membership">
            Not interested in membership
          </option>
        </select>
      </div>

      <div className="waitlist-form__trap" aria-hidden="true">
        <label htmlFor="waitlist-website">Website</label>
        <input id="waitlist-website" name="website" tabIndex={-1} />
      </div>

      <label className="waitlist-form__consent">
        <input name="consent" required type="checkbox" />
        <span>
          Send me a confirmation email for the Heim Civic Nevada launch and
          membership waitlist. I understand this is not a recurring newsletter.
        </span>
      </label>
      <FieldError errors={fieldErrors?.consent} id="waitlist-consent-error" />

      <div className="waitlist-form__actions">
        <Button disabled={state.pending} type="submit">
          {state.pending ? "Sending confirmation…" : "Join the waitlist"}
        </Button>
        <p>No account or payment is required.</p>
      </div>

      <div
        aria-live="polite"
        className={`waitlist-form__status${
          state.response?.status === "confirmation-pending"
            ? "waitlist-form__status--success"
            : state.response
              ? "waitlist-form__status--error"
              : ""
        }`}
        role={
          state.response && state.response.status !== "confirmation-pending"
            ? "alert"
            : "status"
        }
      >
        {state.response?.message ?? null}
      </div>
    </form>
  );
}

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  return errors?.length ? (
    <span className="waitlist-form__error" id={id}>
      {errors[0]}
    </span>
  ) : null;
}
