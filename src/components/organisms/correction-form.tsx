"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/atoms/button";
import type { CorrectionResponse } from "@/domain/corrections/types";

type FormState = {
  response: CorrectionResponse | null;
  pending: boolean;
};

export function CorrectionForm({
  initialRecord = "",
}: {
  initialRecord?: string;
}) {
  const [state, setState] = useState<FormState>({
    response: null,
    pending: false,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ response: null, pending: true });

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      recordType: data.get("recordType"),
      recordReference: data.get("recordReference"),
      issueDescription: data.get("issueDescription"),
      evidenceUrl: data.get("evidenceUrl"),
      email: data.get("email"),
      consent: data.get("consent") === "on",
      website: data.get("website"),
    };

    try {
      const response = await fetch("/api/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as CorrectionResponse;
      setState({ response: result, pending: false });

      if (result.status === "received") form.reset();
    } catch {
      setState({
        pending: false,
        response: {
          status: "unavailable",
          message:
            "Correction intake could not be reached. No information was retained.",
        },
      });
    }
  }

  const fieldErrors =
    state.response?.status === "invalid" ? state.response.fields : undefined;

  return (
    <form className="correction-form" onSubmit={handleSubmit} noValidate>
      <div className="correction-form__grid">
        <div className="correction-form__field">
          <label htmlFor="record-type">Record type</label>
          <select id="record-type" name="recordType" required>
            <option value="official">Official profile</option>
            <option value="district">District</option>
            <option value="bill">Bill or vote</option>
            <option value="finance">Campaign finance</option>
            <option value="other">Other published fact</option>
          </select>
        </div>
        <div className="correction-form__field">
          <label htmlFor="record-reference">Page or record</label>
          <input
            aria-describedby="record-reference-hint recordReference-error"
            defaultValue={initialRecord}
            id="record-reference"
            maxLength={240}
            name="recordReference"
            placeholder="Page URL, official name, district, or bill identifier"
            required
          />
          <span id="record-reference-hint">
            Do not include a home address or other sensitive personal
            information.
          </span>
          <FieldError
            errors={fieldErrors?.recordReference}
            id="recordReference-error"
          />
        </div>
      </div>

      <div className="correction-form__field">
        <label htmlFor="issue-description">What appears to be incorrect?</label>
        <textarea
          aria-describedby="issue-description-hint issueDescription-error"
          id="issue-description"
          maxLength={4_000}
          minLength={20}
          name="issueDescription"
          required
          rows={7}
        />
        <span id="issue-description-hint">
          Describe the fact and the correction you believe the source supports.
        </span>
        <FieldError
          errors={fieldErrors?.issueDescription}
          id="issueDescription-error"
        />
      </div>

      <div className="correction-form__grid">
        <div className="correction-form__field">
          <label htmlFor="evidence-url">Evidence URL (optional)</label>
          <input
            aria-describedby="evidenceUrl-error"
            id="evidence-url"
            maxLength={500}
            name="evidenceUrl"
            placeholder="https://agency.gov/source"
            type="url"
          />
          <FieldError
            errors={fieldErrors?.evidenceUrl}
            id="evidenceUrl-error"
          />
        </div>
        <div className="correction-form__field">
          <label htmlFor="reporter-email">Your email</label>
          <input
            aria-describedby="reporter-email-hint email-error"
            autoComplete="email"
            id="reporter-email"
            maxLength={254}
            name="email"
            required
            type="email"
          />
          <span id="reporter-email-hint">
            Used only to acknowledge and follow up on this request.
          </span>
          <FieldError errors={fieldErrors?.email} id="email-error" />
        </div>
      </div>

      <div className="correction-form__trap" aria-hidden="true">
        <label htmlFor="correction-website">Website</label>
        <input id="correction-website" name="website" tabIndex={-1} />
      </div>

      <label className="correction-form__consent">
        <input name="consent" required type="checkbox" />
        <span>
          Heim Civic Nevada may contact me about this correction. I understand
          that submitting a request does not guarantee a public change.
        </span>
      </label>
      <FieldError errors={fieldErrors?.consent} id="consent-error" />

      <div className="correction-form__actions">
        <Button disabled={state.pending} type="submit">
          {state.pending ? "Sending securely…" : "Submit factual correction"}
        </Button>
        <p>No payment or account is required.</p>
      </div>

      <div
        aria-live="polite"
        className={`correction-form__status${
          state.response?.status === "received"
            ? "correction-form__status--success"
            : state.response
              ? "correction-form__status--error"
              : ""
        }`}
        role={
          state.response && state.response.status !== "received"
            ? "alert"
            : "status"
        }
      >
        {state.response ? (
          <>
            <strong>{state.response.message}</strong>
            {state.response.status === "received" ? (
              <span> Reference: {state.response.caseId}</span>
            ) : null}
          </>
        ) : null}
      </div>
    </form>
  );
}

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  return errors?.length ? (
    <span className="correction-form__error" id={id}>
      {errors[0]}
    </span>
  ) : null;
}
