# ADR 0005: Federal campaign-finance pilot

- **Status:** Accepted
- **Date:** 2026-08-22

## Context

Phase 5 must prove a campaign-finance overview without implying that one number describes a campaign or that direct receipts include outside spending. Federal and Nevada reporting systems use different categories and access paths. The FEC provides a documented API, while Nevada AURORA currently requires a human security challenge and explicitly prohibits automated traffic.

## Decision

Publish a checked-in federal-only snapshot for Mark Amodei and Steven Horsford using official FEC candidate-totals and principal-committee endpoints for the 2025–2026 cycle.

The normalized record retains candidate and committee IDs, coverage dates, report type, receipts, official contribution categories, spending categories, cash, debts, retrieval times, parser version, and SHA-256 source hashes. Independent expenditures, electioneering communications, party spending, contributor lists, and Nevada state filings are outside this pilot. The UI states those exclusions directly.

The application will not automate, bypass, or simulate the human challenge protecting AURORA. Nevada state records remain blocked until the Secretary of State provides a supported machine-readable or bulk path that can be tested and maintained.

## Consequences

- Two current profiles can demonstrate sourced finance navigation and category presentation.
- Federal and Nevada values cannot be combined accidentally because no state record exists in the finance domain.
- “Unitemized” remains an official filing label and is not translated into a claim about donor type or grassroots support.
- Broader coverage requires outside-spending models, additional federal office and committee fixtures, amendment behavior, and a supported Nevada source.
