# Product Requirements Document: Heim Civic Nevada

**Organization:** Heim Civic Foundation  
**Product:** Heim Civic Nevada  
**Planned domain:** `heimcivic.org/nevada` (pending domain and trademark clearance)  
**Document version:** 1.1  
**Status:** Draft for implementation  
**Date:** August 22, 2026  
**Owner:** Founder / Product Lead  
**Initial market:** Nevada, United States  
**Primary surface:** Responsive web application

---

## 1. TL;DR

Heim Civic Foundation will build Heim Civic Nevada, a nonpartisan public-interest website that lets a Nevada resident enter an address, identify their federal and state legislative districts, see who represents them, and understand those officials through sourced profiles, bills, roll-call votes, and campaign-finance summaries.

All core civic information remains free. Revenue comes later from optional $5 and $10 supporter memberships, professional research tools, organization subscriptions, licensed embeds, APIs, and carefully separated office/campaign workflow tools. Payment can never change factual records, search placement, correction priority, or editorial treatment.

The nonprofit and product are legally and operationally separate from the founder's for-profit design and AI consultancy, Heim Creative LLC. The product launches in phases so the first public pilot can operate for nearly the cost of a domain while proving data accuracy and public demand before paid infrastructure or enterprise features are added.

---

## 2. Background

Nevada political information is publicly available but fragmented across federal, state, election, legislative, geographic, and campaign-finance systems. A resident may need several government websites to determine:

- Which districts contain their home.
- Who represents each district.
- Which committees those officials serve on.
- Which bills they sponsored.
- How they voted on recorded votes.
- What those bills actually do.
- How their campaigns are financed.
- Where each fact came from and when it was last updated.

Newsrooms, nonprofits, universities, and policy organizations repeatedly collect and normalize similar information. The opportunity is to build both a clear public interface and a trustworthy Nevada-specific civic-data layer beneath it.

---

## 3. Problem and target users

### 3.1 Core problem

Nevada residents cannot easily connect their home address to all applicable federal and state representatives and then evaluate those officials using understandable, current, verifiable public records.

### 3.2 Target users

#### Nevada resident

- Needs a fast, accurate answer to “Who represents me?”
- Wants understandable information without learning government database terminology.
- Needs links to authoritative records to verify important claims.

#### Engaged supporter

- Wants to follow districts, officials, bills, or issues.
- Wants useful alerts and a weekly digest.
- Wants to support a free civic resource financially.

#### Journalist or researcher

- Needs normalized search, filters, history, exports, and source provenance.
- Wants alerts that reduce repetitive monitoring work.
- May need an embeddable result or API.

#### Newsroom, nonprofit, university, or association

- Needs shared research and team access.
- Wants reliable data without maintaining its own ingestion pipeline.
- May pay for embeds, feeds, API access, or support.

#### Public office or campaign

- Wants to verify account ownership and submit clearly labeled statements.
- Needs a fair correction process.
- May pay for workflow tools, staff seats, alerts, analytics, and integrations, but not control of the public record.

---

## 4. Product vision and principles

### Vision

Every Nevada resident should be able to understand who represents them and evaluate those representatives using accessible, verifiable public records.

### Product promise

Enter where you live, see who represents you, understand what they have done, and verify every material claim at its source.

### Principles

1. **Public facts remain free.** Representative, district, bill, vote, and finance records are not paywalled.
2. **Sources precede summaries.** Every material record carries provenance and a path to the authoritative source.
3. **Accuracy precedes breadth.** Verified partial coverage is preferable to unreliable comprehensive coverage.
4. **Payment never changes truth.** Customer status cannot affect ranking, factual correction, or editorial presentation.
5. **Public record and political response remain separate.** Office-supplied statements are clearly labeled and versioned.
6. **Privacy is minimized.** Exact residential addresses are used transiently and are not retained.
7. **Accessibility is a launch requirement.** Maps and charts have complete textual equivalents.
8. **Automation remains accountable.** Imports, classifications, and summaries are monitored and reviewable.
9. **No hidden scoring.** The platform does not generate endorsements, ideology rankings, or an overall politician score.
10. **The system must be portable.** Data structures and source adapters should support future state expansion.

---

## 5. Goals and success metrics

### 5.1 Phase-one goals

- Correctly resolve a Nevada address to its current U.S. congressional, Nevada Senate, and Nevada Assembly districts.
- Display the correct current officeholder for each district.
- Publish consistent official profiles with authoritative links.
- Publish a complete official index of 2025 Nevada Assembly and Senate bills plus neutral Enhanced Pilot Coverage for approximately 30–50 measures with human-reviewed summaries, recorded votes, and a public selection log.
- Establish provenance, freshness, correction, and data-monitoring workflows.
- Determine whether people return, subscribe to updates, and share or cite the product.

### 5.2 Twelve-to-twenty-four-month goals

- Reach meaningful statewide adoption, including Clark, Washoe, Carson City, and rural Nevada.
- Convert engaged users into $5 or $10 monthly supporters.
- Acquire paying professional and organization customers.
- Release advanced alerts, exports, embeds, and a limited API.
- Maintain a sustainable operating reserve without paywalling civic facts.

### 5.3 North-star metric

**Monthly informed constituent sessions:** unique sessions where a person successfully identifies their representation and meaningfully engages with at least one representative, bill, vote, finance, or official-source record.

### 5.4 MVP success indicators

| Measure                                          |                                          Pilot target |
| ------------------------------------------------ | ----------------------------------------------------: |
| Agreement with authoritative district results    | At least 99% across reviewed matchable test addresses |
| Public records with source and update metadata   |                                                  100% |
| Successful scheduled imports                     |          At least 99% or an operator alert on failure |
| Monthly unique visitors                          |             2,500+ or equivalent partner distribution |
| Email subscribers or paid-interest submissions   |       500 subscribers or 50 paid-interest submissions |
| Active media/civic/education partners            |                                                    5+ |
| Exact residential addresses retained             |                                                     0 |
| Unreviewed machine-generated summaries published |                                                     0 |

These are product learning gates, not promises of profitability.

---

## 6. Organization, packaging, and monetization

### 6.1 Brand and entity structure

- **Heim Civic Foundation** is the nonprofit legal organization and umbrella civic brand.
- **Heim Civic Nevada** is its first public product.
- The target public URL is `heimcivic.org/nevada`; the root domain may later support additional civic products or states.
- **Heim Creative LLC** is the founder's separate for-profit AI consulting, human-centered design, and product-design business.
- There is no corporate parent above Heim Creative LLC and Heim Civic Foundation. “Heim” is a shared brand family, not a parent legal entity.
- Heim Civic Foundation is intended to form as a Nevada nonprofit corporation for public benefit and seek recognition as a 501(c)(3) public charity.
- Heim Civic Foundation will maintain separate governance, banking, accounting, contracts, repositories, production accounts, data, and intellectual-property records.
- Any donated or paid work between Heim Creative LLC and Heim Civic Foundation requires written terms, conflict disclosure, fair-value review, approval by disinterested nonprofit directors, and the founder's recusal where appropriate.
- Heim Civic Foundation must own its core civic database, editorial content, production application, and brand assets, or hold a permanent, irrevocable, royalty-free license sufficient to operate independently.
- The source repository is private. Public transparency will be provided through methodology, source inventories, funding disclosures, correction policies, freshness reporting, and later API documentation.

Resident support and professional products are separate so users are not confused about whether civic facts require payment.

### 6.2 Resident plans

| Plan                 |         Proposed price | Benefits                                                                                           |
| -------------------- | ---------------------: | -------------------------------------------------------------------------------------------------- |
| Public               |                   Free | Representative finder, profiles, districts, bills, votes, finance summaries, official source links |
| Supporter            |   $5/month or $60/year | Saved districts, watchlists, personalized weekly digest, notification preferences                  |
| Sustaining Supporter | $10/month or $120/year | Supporter benefits, expanded alert choices, early feature access, optional recognition             |

Annual billing should be recommended because fixed card fees disproportionately affect $5 monthly transactions.

### 6.3 Professional plans

| Plan         |                       Initial target | Benefits                                                                 |
| ------------ | -----------------------------------: | ------------------------------------------------------------------------ |
| Professional |                        $49–$99/month | Advanced filters, larger watchlists, alerts, CSV exports, saved research |
| Organization |                      $249–$499/month | Team seats, shared research, administrative controls, embeds             |
| Enterprise   | Starting near $1,000/month or custom | API, higher limits, white labeling, support, optional service agreement  |

Enterprise can initially be a contact form. Do not build enterprise billing, SSO, or contractual service levels until a qualified customer validates the need.

### 6.4 Office and campaign workspaces

- Claiming and verifying an official profile is free.
- Requesting an evidence-based factual correction is always free.
- Paid features may include staff seats, record-change alerts, analytics, bulk document submission, structured questionnaire responses, press routing, exports, and integrations.
- Office-supplied content is labeled and kept separate from independent records.
- Paid status cannot affect search position, visual prominence, correction speed, or removal of unfavorable verified information.
- Similar candidates and officials receive materially equal terms and display rules.

### 6.5 Prohibited monetization

- Selling individual donor contact lists or using FEC contributor records for solicitation.
- Selling or retaining residential address histories.
- Paid suppression, alteration, or preferential ranking of public records.
- Undisclosed sponsored political content.
- Political targeting based on saved district or issue-interest data.

### 6.6 Community newsroom access

- Qualifying rural and small Nevada newsrooms receive free professional access during the public pilot.
- After paid launch, qualifying organizations receive a standard 75–80% discount, with a target price of approximately $10–$20 per month or $199 per year for up to three seats.
- Sponsor-funded fee waivers remain available when even the discounted price is a barrier.
- Free public embeds may be offered with Heim Civic attribution, source links, freshness information, and accessibility intact.
- Custom engineering, white labeling, high-volume API use, priority support, and contractual service levels remain separately priced.
- Eligibility uses neutral criteria such as Nevada service area, original public-interest reporting, small editorial staff, and agreement to prohibited-use terms. Editorial viewpoint and political orientation are not eligibility factors.

---

## 7. Scope and phased release plan

### Phase 0 — Private alpha

**Objective:** Prove the core geographic workflow at almost no monthly cost.

**In scope:**

- Nevada address input and match handling.
- Address-to-coordinate conversion.
- Congressional, Nevada Senate, and Nevada Assembly district resolution.
- Current representative cards and basic profiles.
- Minimal district map and complete text alternative.
- Source, methodology, and correction foundations.
- Golden address fixtures covering Nevada population centers and boundary cases.

**Exit criteria:**

- At least 200 geographically distributed, non-sensitive test addresses are evaluated.
- Matchable results show at least 99% agreement with authoritative tools.
- Exact addresses are absent from application tables, analytics, logs, screenshots, and fixtures.
- Every displayed officeholder has an authoritative source and last-verified time.

### Phase 1 — Free public pilot

**Objective:** Prove usefulness, public trust, repeat usage, and sustainable data operations.

**In scope:**

- All current Nevada federal and state legislators.
- Representative lookup, profiles, and district pages.
- Committee assignments.
- A complete official index of 2025 Nevada Assembly and Senate bills.
- Neutral Enhanced Pilot Coverage for approximately 30–50 measures selected through the published rubric in FR-007.
- Recorded yes/no/other votes and official roll-call links.
- Human-reviewed plain-language bill summaries.
- Initial aggregate campaign-finance information.
- Search across officials, districts, bills, and subjects.
- Correction form, methodology, funding disclosure, and update timestamps.
- Confirmed-opt-in membership waitlist; no recurring digest commitment during the pilot.
- Translation-friendly English pages and browser/device translation compatibility; no claim of a fully bilingual pilot.
- Future pricing page without paid entitlements.

**Not included:** recurring general digest, comprehensive dark-money attribution, every historical session, local offices, public API, paid office workspaces, or an unreviewed machine-translated Spanish edition.

### Phase 2 — Paid beta

**Objective:** Establish recurring revenue without weakening the free experience.

**In scope:**

- Supporter and Sustaining Supporter subscriptions.
- Passwordless accounts.
- Saved district IDs; never saved street addresses.
- Official, bill, committee, and subject watchlists.
- Personalized digests and notification preferences.
- Professional search, filters, exports, and research folders.
- Organization-account foundation.
- Checkout, renewal, failed payment, cancellation, refund, and entitlement workflows.
- Paid production hosting and managed database backups.

### Phase 3 — Institutional platform

**Objective:** Sell reliable research infrastructure and distribution tools.

**In scope:**

- Organization roles and team administration.
- Newsroom and nonprofit embeds.
- Documented, versioned, rate-limited API.
- API keys, metering, licensing, and support operations.
- Verified office/campaign workspaces.
- Data-quality dashboard and incident communication.
- Human-reviewed Spanish support for priority public journeys, beginning with address lookup, representative results, navigation, errors, privacy explanation, methodology overview, and corrections.

### Phase 4 — Regional expansion

Expansion beyond Nevada requires a state-agnostic data model, a supported source adapter, validation fixtures, maintenance ownership, and sufficient funding or contracted demand for each state.

---

## 8. Core user journeys

### 8.1 Find my representatives

1. User enters a Nevada address.
2. Product explains that the address is used only to determine districts and is not stored.
3. System returns a confirmed match, asks the user to select among ambiguous matches, or provides a useful failure state.
4. System displays U.S. congressional, Nevada Senate, and Nevada Assembly districts.
5. System displays the current representative for each district.
6. User opens a profile, district, bill, vote, finance summary, or official source.

### 8.2 Understand a representative

1. User opens a standardized profile.
2. User sees office, district, party, term, official contacts, committees, legislation, selected votes, and finance overview.
3. User sees coverage and last-updated information.
4. User can open the authoritative source for every material section.
5. User may submit a correction without creating a paid account.

### 8.3 Understand a bill and vote

1. User opens a bill from search, a representative profile, or an alert.
2. User sees the official title, plain-language summary, status, sponsor, committees, and key actions.
3. User sees each supported roll call and what type of vote it was.
4. User sees how members voted, including absent, excused, present, or not voting.
5. User can open official text, amendments, fiscal notes, history, and vote records.

### 8.4 Become a supporter

1. User selects Supporter or Sustaining Supporter.
2. User checks out through a hosted payment flow.
3. Account entitlement is activated only after a verified payment event.
4. User saves district IDs and notification preferences.
5. User can update billing, cancel, export account data, or delete the account.

### 8.5 Professional research

1. Professional user searches and filters officials, bills, votes, committees, or finance aggregates.
2. User saves a query or watchlist.
3. User exports permitted data with provenance and coverage fields intact.
4. User receives selected alerts.

### 8.6 Submit or resolve a correction

1. Anyone identifies a record and explains the suspected error.
2. Supporting evidence is optional at submission but requested when needed.
3. An editor reviews the authoritative source and import history.
4. Resolution is recorded with evidence and timestamps.
5. A material public correction receives a visible correction note.

---

## 9. Functional requirements

Priority definitions: **P0** is required for the public pilot, **P1** for paid beta, and **P2** for institutional release.

### FR-001 — Privacy-preserving address lookup (P0)

The product must accept a Nevada street address, return a normalized match or actionable ambiguity/failure state, and avoid retaining the address.

Acceptance criteria:

- Common Nevada address formats are supported.
- P.O. boxes, partial inputs, out-of-state inputs, and unmatched addresses receive clear guidance.
- Exact input is not written to the application database, analytics, or logs.
- Anonymous lookup is rate-limited and protected against abuse.

### FR-002 — District resolution (P0)

The product must determine the current U.S. congressional, Nevada Senate, and Nevada Assembly districts containing the matched point.

Acceptance criteria:

- Boundaries are versioned with source, vintage, and effective dates.
- Boundary and conflicting-source cases can enter an uncertainty/review state.
- Results are tested against authoritative Nevada and Census sources.

### FR-003 — Representative results (P0)

The product must return the current officeholder for each applicable district and represent vacancies, appointments, and transitions explicitly.

### FR-004 — Accessible district map (P0)

The map must support district-layer toggles and provide a complete textual equivalent. Color cannot be the sole carrier of meaning.

### FR-005 — Standardized official profile (P0)

Each supported profile must include, where available:

- Name, official image, office, chamber, district, party, and term.
- Official website and contact channels.
- Campaign website clearly distinguished from the government website.
- Committee memberships and leadership roles.
- Sponsored/cosponsored legislation.
- Selected or recent recorded votes.
- Aggregate campaign-finance information.
- Source links, coverage dates, update times, and correction access.

### FR-006 — Historical terms (P1)

Office changes must create time-bounded terms rather than overwrite historical officeholders.

### FR-007 — Complete Bill Index, Enhanced Pilot Coverage, and bill page (P0)

The pilot shall provide two explicit coverage levels for the 2025 Nevada legislative session:

1. **Complete Bill Index:** every Assembly Bill and Senate Bill record returned by the official NELIS 83rd Session bill listings, including the official identifier, NELIS synopsis, official long title, stable source key, official overview link, retrieval time, parser version, and validation state. Source markers such as an asterisk are preserved exactly and are not interpreted without authoritative documentation. Index-only records link to NELIS and do not claim local summary, sponsor, action, status, committee, or vote completeness.
2. **Enhanced Pilot Coverage:** approximately 30–50 measures selected through the published rubric below. Enhanced records receive the deeper sourced bill page, human review, vote reconciliation, and public selection log. “Significant” must not appear as an unexplained editorial judgment.

Every governor-vetoed measure is visibly marked as an automatic qualifier in the Complete Bill Index. Automatic qualification guarantees discovery and inclusion in the published selection log; it does not imply that all qualifying measures have completed Enhanced Pilot Coverage. The enhanced queue is prioritized with the same neutral rules and review capacity is disclosed.

Automatically qualify for the enhanced review queue:

- State budget and major appropriations measures.
- Measures proposing constitutional amendments or statewide ballot questions.
- Measures vetoed by the governor and veto-override votes.
- Measures materially changing election administration or government structure.
- Measures creating or eliminating a major statewide program.
- Measures with a clearly material statewide fiscal effect documented in an official fiscal note.

Other bills qualify by meeting at least two published impact factors:

- Statewide application or effect on a substantial defined population.
- Material change to taxes, public benefits, eligibility, civil rights, criminal penalties, or regulatory obligations.
- Material official fiscal effect.
- Contested recorded floor vote.
- Substantial documented public testimony.
- Major change from existing Nevada law.

The final enhanced set must cover a broad range of subjects, including budget/tax, education, health, housing, elections/government, labor/business, criminal justice/public safety, environment/water/energy, transportation, and civil rights/social services. Selection runs year-round using the same rules and cannot be altered to favor or oppose candidates.

Each enhanced bill page must include jurisdiction, session, bill number, official title, summary, status, latest action, sponsors, committees, key dates, recorded votes, official text/history links, and the selection rule that placed it in Enhanced Pilot Coverage. Index-only results must remain clearly labeled and link directly to the authoritative NELIS record.

### FR-008 — Plain-language summary controls (P0)

- Prefer and label official summaries when sufficiently clear.
- Human-written summaries require an internal review state.
- Machine assistance may draft but may not publish without human approval.
- Summaries link to the official text and state that they are not legal advice.
- Material amendments and uncertainty cannot be silently omitted.

### FR-009 — Roll-call votes (P0)

The system must retain the original source value and normalize it to yes, no, present/not voting, excused, absent, vacancy, or unknown.

- Voice votes and unanimous consent cannot be fabricated as individual votes.
- Vote type must distinguish passage, amendment, procedural action, concurrence, and veto override where supported.
- Every displayed member vote links to the authoritative roll call or journal.

### FR-010 — Campaign-finance overview (P0 limited; P1 expanded)

Supported measures may include total receipts, disbursements, cash on hand, individual contributions, unitemized/small-dollar totals where officially defined, committee contributions, candidate self-funding, and independent expenditures.

- Direct campaign receipts are classified using official categories, including itemized individuals, unitemized receipts, candidate self-financing, party committees, PAC/other political committees, transfers, loans, other receipts, refunds, disbursements, cash on hand, and debts where supported.
- Independent expenditures supporting or opposing a candidate, electioneering communications, party spending, and other reported outside spending are separate from direct campaign receipts.
- Federal and Nevada amounts are not combined without explaining different rules and periods.
- “Small-dollar” is used only when an authoritative source defines the applicable threshold. “Unitemized” is not presented as synonymous with grassroots support.
- “Corporate,” “grassroots,” “PAC,” “Super PAC,” and “dark money” are not inferred from a name alone.
- Disclosure status uses precise labels: donors disclosed in cited filings; some funding sources disclosed; underlying donors not disclosed in the cited filing; reported intermediary/pass-through organization; source relationship under review; or insufficient public information.
- Public relationship claims distinguish directly reported fact, source-backed attribution, inference, and unknown. Unsupported inferences are not published as fact.
- Classification methods and limitations are published.
- Aggregates link to the applicable FEC or Nevada record.

### FR-011 — Search and discovery (P0)

Users can search supported officials, districts, bills, and subjects by name, identifier, and common terms.

### FR-012 — Advanced filters and comparisons (P1)

Professional users can filter by jurisdiction, session, chamber, district, official, party, committee, subject, status, vote type, and date. Comparisons must not produce an endorsement or overall score.

### FR-013 — Authentication and saved districts (P1)

- Anonymous public use remains available.
- Users can authenticate with passwordless email and approved OAuth providers.
- Users save district identifiers rather than exact addresses.
- Administrative accounts require multi-factor authentication.

### FR-014 — Watchlists and notifications (P1)

Users can follow officials, bills, committees, and supported subjects and select weekly, daily, or available event-based delivery.

- Nonessential messages include unsubscribe and preference controls.
- Notification processing is idempotent to prevent duplicates.
- Provider failures and sending limits are monitored.

### FR-015 — Subscription lifecycle (P1)

The product supports checkout, renewal, failed payment, grace period, upgrade, downgrade, cancellation, refund, and entitlement revocation. Entitlements are enforced server-side.

### FR-016 — Professional export (P1)

Permitted search results can be exported in CSV or JSON with source, retrieval, coverage, and license fields intact.

### FR-017 — Organization accounts (P2)

Organization administrators can manage members, roles, shared research, billing contacts, and access revocation.

### FR-018 — Embeds (P2)

Responsive representative, district, bill, or vote embeds retain source links, update times, accessibility, and appropriate attribution.

### FR-019 — API (P2)

The API is versioned, documented, authenticated where necessary, rate-limited, observable, licensed, and governed by acceptable-use terms.

### FR-020 — Correction workflow (P0)

Anyone can submit a correction for free. Internal states include received, triaged, investigating, resolved, rejected, and published. Resolution retains evidence, operator, timestamp, and affected records.

Service targets:

- Automated receipt immediately.
- Human triage within three business days.
- Critical current-representative or district error targeted for review within one business day.
- Ordinary factual correction targeted for resolution within ten business days.
- Complex campaign-finance or entity-resolution matters receive a status update at least every ten business days until resolved.

These are service targets rather than guaranteed legal deadlines. Actual performance is measured and published internally before stronger public commitments are made.

### FR-021 — Audit history (P0)

Every material manual change to a public record creates an immutable event containing actor, action, time, reason, and before/after references.

### FR-022 — Source-health administration (P1)

Administrators can see last successful imports, record-count changes, validation failures, stale records, parser versions, and source availability.

### FR-023 — Office-supplied statements (P2)

Verified offices/campaigns can submit structured, time-stamped statements that are labeled, revisioned, and technically separate from independent public records.

### FR-024 — Pilot waitlist (P0)

The public pilot shall provide a confirmed-opt-in launch and membership waitlist rather than promise a recurring digest.

- Required data is limited to email address and consent.
- Optional fields may include ZIP code or county, user role, desired features, and interest in $5 or $10 membership.
- The waitlist does not request political party, ideology, voting history, candidate preference, or exact residential address.
- Confirmation, unsubscribe, retention, deletion, and provider-limit behavior are tested before launch.

---

## 10. Data requirements

### 10.1 Initial authoritative sources

- U.S. Census Geocoder and TIGER/Line or TIGERweb for geographic resolution and boundaries.
- Nevada Legislature and NELIS for state legislators, bills, committees, votes, journals, amendments, fiscal notes, and exhibits.
- Congress.gov API for federal officials, bills, actions, sponsorships, and summaries.
- Official House and Senate roll-call systems where Congress.gov does not supply adequate detail.
- Federal Election Commission API and bulk files for federal campaign finance.
- Nevada Secretary of State systems for state campaign finance and election records.
- Official government and campaign websites for explicitly defined profile fields.

### 10.2 Source acquisition strategy

Prefer stable, official, machine-readable sources in this order: documented API, bulk download, structured report export, stable document, and maintained page parser.

Relatively stable initial sources include:

- Nevada Legislative Counsel Bureau congressional, State Senate, and State Assembly district shapefiles and block-equivalency files.
- Census boundary files and geographic services.
- NELIS bill text, amendments, fiscal notes, minutes, journals, exhibits, histories, and other stable official documents.
- NELIS reports that provide PDF, Excel, or Word export.
- Documented Congress.gov and FEC APIs and bulk data.
- Official election-result downloads after format and historical-coverage validation.

Sources expected to require maintained, versioned adapters include:

- NELIS bill overview, action, sponsor, committee, meeting, and status pages.
- NELIS roll-call vote pages or undocumented internal endpoints.
- Nevada legislator rosters, profiles, contact information, and committee pages.
- Nevada Secretary of State AURORA campaign-finance search and filing results unless a supported bulk export is confirmed.
- State financial-disclosure, lobbyist, employer, and candidate-roster interfaces without documented exports.

Before generalizing ingestion, complete a source-discovery spike that inventories records, formats, identifiers, terms, cadence, historical coverage, parser risk, and representative fixtures. Contact the Legislative Counsel Bureau and Secretary of State to request supported machine-readable or bulk access. Undocumented endpoints are treated as unstable even when they return structured responses.

### 10.3 Source hierarchy

1. Primary official government record.
2. Official government API or bulk dataset.
3. Official office/campaign submission for self-authored fields only.
4. Reputable nonpartisan provider with documented provenance.
5. Attributed reporting or research with independent verification where feasible.

Crowdsourced information may initiate a correction but cannot become a public fact without verification.

### 10.4 Provenance contract

Every imported public record must retain:

- Source organization and URL/dataset identifier.
- External source ID.
- Retrieval time and source publication/coverage date when available.
- Import job and parser version.
- Original value or raw-record reference.
- Normalized value.
- Validation state and last human review where applicable.

### 10.5 Freshness targets

| Dataset                          |                           Active period |           Outside active period |
| -------------------------------- | --------------------------------------: | ------------------------------: |
| Current officeholders            | Daily after election/appointment events |                          Weekly |
| District boundaries              |    Validate after every official change |          Quarterly verification |
| Nevada bills, actions, and votes |           At least daily during session |                          Weekly |
| Federal bills and actions        |                                   Daily | Daily or weekly based on demand |
| Federal finance aggregates       |           Daily or after source refresh |                          Weekly |
| Nevada finance aggregates        |             Daily near filing deadlines |               Weekly or monthly |
| Official links and contacts      |                  Weekly automated check |          Monthly human sampling |

Public pages display an appropriate “last updated” or “coverage through” value.

### 10.6 Data-quality rules

- External IDs are namespaced by source.
- People, candidates, offices, organizations, and committees are separate entities.
- Office terms and district boundaries are time bounded.
- Bill identifiers include jurisdiction and session.
- Votes retain vote event, member, original value, normalized value, and source.
- Monetary values include currency, period, filing/version state, and exact integer representation.
- Entity matches retain evidence and confidence.
- Imports are idempotent, staged, and safe to retry.
- Unexpected schema or record-count changes stop automatic publication and alert an operator.

---

## 11. Technical architecture and cost controls

This section records product constraints for implementation; detailed engineering decisions belong in architecture decision records.

### 11.1 Recommended initial stack

- Next.js and TypeScript.
- React with Tailwind CSS.
- Vercel for hosting.
- Supabase PostgreSQL, PostGIS, Auth, and initial object storage.
- MapLibre GL JS with simplified GeoJSON or PMTiles and a documented tile license.
- Version-controlled Markdown/MDX for initial editorial pages.
- Sanity only when nontechnical, multi-editor workflow justifies a CMS.
- Resend or equivalent for transactional email and later digests.
- Stripe-hosted Checkout/customer portal for paid plans.
- Scheduled GitHub Actions for ingestion jobs initially.
- Structured logs, error monitoring, uptime checks, and source-health monitoring.

### 11.2 Architecture constraints

- Government data is imported, normalized, validated, and cached locally rather than requested on every page view.
- Government API keys and sensitive requests remain server-side.
- Large documents, archives, exports, and map assets live in object storage rather than relational rows.
- Public pages use static generation or cacheable server rendering where freshness permits.
- Administrative authorization and paid entitlements are enforced server-side.
- Database changes use reviewed, reversible migrations committed to version control.
- Source integrations are isolated behind adapters.
- Development, preview, and production are isolated; production personal data is not copied into development.

### 11.3 Phase-based infrastructure budget

| Phase             |             Expected fixed cost | Upgrade rationale                               |
| ----------------- | ------------------------------: | ----------------------------------------------- |
| Private alpha     |      Approximately $15–$30/year | Domain is the primary cash expense              |
| Free public pilot |      Approximately $0–$15/month | Stay within applicable noncommercial/free terms |
| Paid beta         |     Approximately $50–$90/month | Commercial hosting and managed database backups |
| Growing product   |   Approximately $100–$300/month | Email, editors, monitoring, storage, and usage  |
| Institutional     | Approximately $300–$1,000/month | API, search, volume, redundancy, and support    |

Labor, legal review, accounting, insurance, and business formation are excluded.

### 11.4 Required upgrade points

- Vercel Hobby is for personal/noncommercial use; upgrade before accepting money or operating commercially.
- Supabase Free is acceptable for a pilot, but paid launch should use managed backups and non-pausing production service.
- Upgrade any service at 70% sustained use of a material quota.
- Enable hard spending limits and billing alerts wherever supported.
- Do not add a proprietary search or mapping service before measured usage requires it.

---

## 12. Nonfunctional requirements

### Accessibility

- Conform to WCAG 2.2 Level AA for primary public and paid journeys.
- Support keyboard operation, visible focus, screen readers, reduced motion, and zoom.
- Provide textual equivalents for every map and chart.
- Run automated checks in continuous integration plus manual keyboard/screen-reader review before milestones.

### Performance

Target production 75th-percentile Core Web Vitals:

- Largest Contentful Paint at or below 2.5 seconds.
- Interaction to Next Paint at or below 200 milliseconds.
- Cumulative Layout Shift at or below 0.1.

Representative and bill pages should return meaningful cached content within two seconds on a typical mobile connection. Address lookup should complete within three seconds under normal upstream conditions or present an honest progress/failure state.

### Reliability and recovery

For the free pilot:

- Automated daily availability check.
- Import failure alert within one hour of expected completion.
- Weekly logical database backup stored off-site.
- Target recovery time of one business day.

For paid beta:

- Managed daily backups.
- 99.5% monthly availability target, excluding announced maintenance and source outages.
- Recovery point objective of 24 hours or better.
- Four-hour recovery target for paid-account functions.
- Recovery exercise at least twice annually.

### Security

- Follow OWASP guidance and secure framework defaults.
- Enable row-level security on exposed Supabase tables.
- Keep service-role keys and secrets server-side.
- Require multi-factor authentication for administrators.
- Apply least privilege to application, ingestion, editorial, and billing roles.
- Rate-limit lookup, authentication, correction, and API endpoints.
- Verify Stripe webhook signatures and process events idempotently.
- Run dependency, secret, and vulnerability scanning.
- Publish a security contact and maintain an incident-response process before paid launch.

### Privacy

- Never persist an address submitted for representative lookup.
- Redact addresses, credentials, tokens, and sensitive form content from logs and analytics.
- Collect only the information necessary for requested account functionality.
- Provide account export and deletion before paid launch.
- Do not sell personal data or use civic-interest data for political advertising.
- Publish privacy and cookie notices before public launch.

### Language access

- Phase 1 is Spanish-ready but does not claim to be fully bilingual.
- The application uses correct language metadata, semantic HTML, selectable text, translation-friendly content structures, and no technical barriers to browser/device translation.
- Browser and device translation are fallback capabilities, not an authoritative Spanish edition.
- Human-reviewed pilot translations prioritize navigation, address lookup, representative results, errors, the address-privacy explanation, methodology overview, and correction form.
- Official English bill titles remain visibly identified as official text.
- Spanish bill summaries are not published until reviewed by a paid or formally accountable Spanish-language reviewer familiar with Nevada civic or legal terminology.
- Machine-translated content, if tested later, is labeled as experimental and retains access to the reviewed English source.
- Maintain a reviewed bilingual terminology glossary for districts, offices, legislative actions, votes, and campaign-finance categories.

### SEO and browser support

- Use stable canonical URLs for profiles, districts, bills, votes, and historical terms.
- Provide sitemaps and appropriate structured metadata.
- Support current and previous major versions of Chrome, Edge, Firefox, and Safari.
- Test primary journeys on iOS Safari and Android Chrome from 320 CSS pixels upward.

---

## 13. Editorial, ethics, and legal requirements

### 13.1 Content labels

The interface must distinguish:

1. Official public records.
2. Official government summaries.
3. Heim Civic-authored explanation.
4. Statements supplied by an office or campaign.
5. Sponsored content, if ever permitted.

### 13.2 Neutrality

- Apply consistent fields, correction standards, display rules, and commercial terms.
- Do not endorse or oppose candidates through rankings, selective omissions, labels, or promotion.
- Publish the criteria used to select featured bills.
- Disclose material funding sources and conflicts.
- Obtain qualified counsel before paid candidate/office offerings and before relying on nonprofit campaign-intervention rules.

### 13.3 Corrections

- Factual corrections are free and evidence-based.
- Material corrections receive a public note when appropriate.
- Typographical fixes may be logged internally.
- Publish the service targets defined in FR-020 without representing them as guaranteed legal deadlines.

### 13.4 AI use

- AI may assist extraction, classification, drafting, translation, tests, and anomaly detection.
- AI output is never treated as a source.
- Public factual or interpretive AI-assisted content requires human approval.
- Material prompts, models, and transformations are versioned internally.
- Model changes are regression-tested against a reviewed Nevada bill set.
- Sensitive personal data and unreleased editorial work are not sent to unapproved providers.

### 13.5 Required legal review before commercialization

- FEC restrictions on commercial use of individual contributor information.
- Nevada campaign-finance data terms and applicable election law.
- IRS restrictions if the organization is tax exempt.
- Privacy, email, subscription, refund, accessibility, and consumer-protection obligations.
- Terms for paid office/campaign workspaces, sponsorship, API licensing, and embeds.

---

## 14. Analytics and guardrails

Analytics must not capture full address input.

### Engagement metrics

- Successful representative lookups.
- Representative-to-bill and bill-to-source navigation.
- Returning users at 30 and 90 days.
- Email verification, opens, clicks, and unsubscribes.
- Watchlists and saved districts.
- Partner referrals and embed usage.

### Trust metrics

- District agreement rate.
- Records with valid source/freshness metadata.
- Import success and median staleness.
- Corrections per 1,000 viewed records.
- Median correction resolution time.
- Broken official-link rate.

### Revenue metrics

- Supporter conversion among repeat users.
- Monthly recurring revenue by product.
- Annual-plan share.
- Logo and revenue churn.
- Professional conversion and average account revenue.
- Revenue concentration by customer.
- Infrastructure cost as a percentage of revenue.

### Non-negotiable guardrails

- Core public records behind a paywall: zero.
- Exact residential addresses retained: zero.
- Paid profiles receiving ranking or correction advantages: zero.
- Unreviewed AI summaries published: zero.
- Individual contributor lists sold or used for solicitation: zero.

---

## 15. Testing and definition of done

### Required test layers

- Unit tests for parsers, normalizers, vote mappings, money, dates, and entitlements.
- Contract tests using checked-in official-source fixtures.
- Data validation for provenance, terms, topology, vote totals, and finance reconciliation.
- Integration tests for database policies, imports, authentication, payments, email, and storage.
- End-to-end tests for lookup, profiles, bills, sources, corrections, subscriptions, and exports.
- Automated and manual accessibility tests.
- Visual regression tests for profiles, bills, votes, maps, and responsive states.
- Security tests for authorization, rate limits, enumeration, webhook replay, and malicious content.
- Performance tests for lookup latency, page rendering, map payloads, and ingestion time.

### Golden geographic fixtures

Maintain reviewed, non-sensitive fixtures for:

- Las Vegas, Henderson, North Las Vegas, and unincorporated Clark County.
- Reno and Sparks.
- Carson City.
- Pahrump, Elko, Mesquite, and additional rural communities.
- Addresses close to district boundaries.
- Apartments, invalid input, partial input, P.O. boxes, and out-of-state addresses.

Use public institutional addresses or purpose-built fixtures, never real user addresses.

### Definition of done

A requirement is complete only when:

- Its acceptance criteria pass.
- Relevant automated tests pass.
- Accessibility behavior is verified.
- Security and privacy effects are reviewed.
- Analytics and monitoring exist where appropriate.
- Documentation and provenance are updated.
- Database changes include migration and recovery guidance.
- The change is reviewed in a preview environment.
- No known critical or high-priority defect remains in the delivered scope.

---

## 16. Codex development operating model

Codex will be used as a development collaborator. The repository must provide explicit, versioned instructions so generated changes remain scoped, testable, and reviewable.

### 16.1 Repository instructions

Create a root `AGENTS.md` containing:

- Product principles and prohibited behavior.
- Approved stack and architecture boundaries.
- Verified setup, development, test, build, and migration commands.
- Code conventions and directory ownership.
- Required tests by change type.
- Security, privacy, accessibility, neutrality, and provenance rules.
- Rules for fixtures and handling addresses or political data.
- Pull-request and documentation expectations.

Nested `AGENTS.md` files may add instructions for ingestion, database, UI, or documentation but may not weaken root rules.

### 16.2 Work decomposition

- Implement small issues tied to IDs such as `FR-001`.
- Each issue includes context, scope, non-goals, acceptance criteria, fixtures, and required verification.
- Prefer vertical slices that produce a testable user outcome.
- Separate schema, ingestion, public interface, and monetization changes where independently reviewable.
- Record material architecture choices in `docs/decisions/`.
- Do not combine unrelated refactoring with feature delivery.

### 16.3 Codex task template

```md
Objective:
Implement [PRD requirement ID and title].

Context:
[Relevant product, source, and architecture context.]

In scope:

- ...

Out of scope:

- ...

Acceptance criteria:

- ...

Required verification:

- Lint
- Type check
- Relevant unit/integration/end-to-end tests
- Accessibility checks for UI changes
- Data validation for ingestion changes

Constraints:

- Do not store residential addresses.
- Preserve source provenance.
- Do not change unrelated files.
```

### 16.4 Codex implementation rules

- Inspect applicable repository instructions and existing patterns before editing.
- Do not invent government endpoints, source fields, or legal interpretations.
- External data assumptions require official documentation or a checked-in fixture.
- Review and test generated migrations against representative data.
- Never let generated summaries bypass editorial review.
- Keep secrets in environment variables or secret stores; examples contain safe placeholders only.
- Never copy production personal data into prompts, tests, screenshots, or fixtures.
- Report tests run, tests not run, limitations, migrations, and operational follow-up.
- Justify new dependencies and assess license, size, security, and maintenance.

### 16.5 Continuous integration gates

- Formatting and linting.
- Type checking.
- Unit and integration tests.
- Production build verification.
- Migration validation when applicable.
- Dependency and secret scanning.
- Accessibility checks for changed public journeys.
- Critical end-to-end smoke tests.
- Preview deployment review.

### 16.6 Suggested documentation structure

```text
AGENTS.md
PRODUCT_REQUIREMENTS.md
README.md
docs/
  architecture.md
  data-sources.md
  data-dictionary.md
  editorial-policy.md
  corrections-policy.md
  privacy-model.md
  security.md
  decisions/
  runbooks/
```

---

## 17. Risks and mitigations

| Risk                           | Impact                       | Mitigation                                                                              |
| ------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------- |
| Incorrect district assignment  | Severe civic and trust harm  | Golden test suite, multiple-source validation, boundary versioning, correction workflow |
| Upstream source changes        | Stale or broken data         | Contract tests, health monitoring, parser versions, last-known-good records             |
| Misleading bill summary        | Reputational/legal harm      | Human review, source links, versioning, published summary policy                        |
| Vote context omitted           | Misleading comparisons       | Model vote type/stage and link to the official record                                   |
| Finance overclassification     | Reputational/legal harm      | Published taxonomy, original values, evidence, confidence, human review                 |
| Appearance of pay-to-play      | Loss of neutrality           | Free corrections, equal terms, separate office statements, no paid ranking              |
| Address leakage                | Privacy/safety harm          | No persistence, log redaction, server-side processing, privacy tests                    |
| Free-tier failure or data loss | Outage and trust loss        | Off-site pilot backups; paid database at commercial launch; restore drills              |
| Election-cycle traffic spike   | Performance and cost failure | Cached pages, load tests, hard spend limits, incident plan                              |
| Partisan-capture perception    | Loss of credibility          | Funding disclosure, consistent methodology, conflict policy, diverse review             |
| Scope expansion                | Delayed or abandoned launch  | Enforce phase boundaries and explicit non-goals                                         |

---

## 18. Out of scope for MVP

- Every local elected office, board, judge, and special district.
- Candidate endorsements, ideology scores, ratings, or voting recommendations.
- Definitive claims identifying all dark-money sources.
- User comments, forums, and social-network features.
- Native mobile applications.
- Campaign consulting, voter targeting, fundraising, or constituent surveillance.
- Exact-address storage.
- Comprehensive multidecade history.
- Real-time alerts.
- Full public API or enterprise service agreement.
- Paid office/campaign workspaces.
- Automatically published AI summaries.

---

## 19. Approved product decisions

1. **Brand:** Heim Civic Foundation is the nonprofit organization; Heim Civic Nevada is the first product; the planned public URL is `heimcivic.org/nevada`, pending clearance and acquisition.
2. **Structure:** Form a Nevada nonprofit corporation for public benefit and seek 501(c)(3) public-charity recognition. Heim Creative LLC remains a separate for-profit consultancy with no common corporate parent.
3. **Repository:** The source repository is private. Methodology, sources, corrections, funding, freshness, and later API documentation are public.
4. **Bill coverage:** Publish a complete official index of 2025 Nevada Assembly and Senate bills. Maintain separate Enhanced Pilot Coverage for approximately 30–50 measures chosen through the broad, year-round rubric in FR-007, and retain a public selection log. All vetoed measures remain discoverable and visibly marked as automatic qualifiers even when enhanced review is pending.
5. **Campaign finance:** Separate direct campaign receipts from outside spending and use source-specific disclosure-status labels instead of unsupported dark-money claims.
6. **Email:** Phase 1 includes a confirmed-opt-in waitlist only; recurring general and personalized digests begin after data operations are reliable.
7. **Nevada sources:** Prefer official downloads and exports; maintain versioned adapters for NELIS and Secretary of State interfaces only where supported machine-readable access is unavailable.
8. **Spanish:** Phase 1 is translation-friendly, with browser/device translation as fallback. Human-reviewed Spanish begins with critical public journeys and requires an accountable language reviewer.
9. **Corrections:** Immediate automated receipt, human triage within three business days, urgent district/officeholder review within one business day, ordinary resolution target within ten business days, and periodic updates for complex cases.
10. **Rural newsrooms:** Free access during the pilot, followed by a standard 75–80% discount and sponsor-funded waivers for qualifying small Nevada newsrooms.

### Remaining implementation validations

- Confirm availability and acquire the domain after domain, Nevada entity-name, trademark, and social-handle screening.
- Complete the Nevada source-discovery spike before committing to ingestion timelines.
- Select initial nonprofit directors, legal counsel, and a Spanish-language reviewer or review partner.

---

## 20. Confirmed constraints and remaining assumptions

| Constraint or assumption                                                                 | Status                 |
| ---------------------------------------------------------------------------------------- | ---------------------- |
| Nevada is the sole launch state.                                                         | Confirmed              |
| Core civic records remain free permanently.                                              | Confirmed              |
| Initial coverage focuses on federal and Nevada legislative offices.                      | Confirmed              |
| The founder prefers Next.js, Tailwind, Vercel, and Supabase.                             | Confirmed              |
| Supporter pricing begins at $5 and $10 monthly.                                          | Confirmed              |
| Professional and enterprise plans launch after public-product validation.                | Confirmed              |
| Exact addresses are not retained.                                                        | Confirmed              |
| Bill summaries require traceability and human review.                                    | Confirmed              |
| Sanity is optional rather than an MVP dependency.                                        | Confirmed              |
| The source repository is private and separate from the existing Figma governance plugin. | Confirmed              |
| Heim Civic Foundation and Heim Creative LLC have no common corporate parent.             | Confirmed              |
| A small founding team will operate the pilot.                                            | Assumption to validate |
| Office/campaign monetization receives legal review before launch.                        | Confirmed              |

---

## 21. Recommended first implementation epics

1. **Repository foundation:** Next.js, TypeScript, Tailwind, environment validation, testing, CI, preview deployment, root `AGENTS.md`, and architecture documentation.
2. **Civic model and provenance:** jurisdictions, districts, people, offices, terms, sources, import runs, audit records, migrations, and fixtures.
3. **Nevada boundaries:** acquire, simplify, version, validate, and publish congressional, Nevada Senate, and Nevada Assembly boundaries.
4. **Address resolution:** implement geocoding, spatial lookup, ambiguity handling, rate limits, redaction, and golden tests.
5. **Representative directory:** import the federal delegation and Nevada Legislature and publish sourced profiles and district pages.
6. **Bills and votes vertical slice:** implement one federal and one Nevada bill end to end before generalizing ingestion.
7. **Search and corrections:** public search, correction intake, internal triage, freshness display, and source-health monitoring.
8. **Finance overview:** implement deliberately limited federal aggregates and document Nevada-source constraints before expansion.
9. **Pilot hardening:** accessibility, performance, SEO, privacy, security, recovery, editorial content, and launch validation.
10. **Paid beta:** only after pilot exit criteria, implement authentication, saved districts, watchlists, email preferences, Stripe subscriptions, and entitlements.

---

## 22. Launch gates

### Before public pilot

- All P0 requirements pass.
- Accessibility and mobile testing are complete.
- Privacy, methodology, editorial, funding, and correction policies are public.
- Uptime, source-health, error, and broken-link monitoring are enabled.
- Off-site backup and restore instructions are verified.
- Analytics exclude address input.
- The product states that it is independent and not an official government service.

### Before accepting payment

- Hosting terms permit commercial use.
- Production database has managed backups.
- Business, tax, privacy, terms, refund, and billing responsibilities are reviewed.
- Payment webhook and entitlement lifecycle tests pass.
- Account export and deletion work.
- Support and incident-response processes are documented.
- Public civic facts remain equally available without payment.

### Before office/campaign workspaces

- Qualified counsel reviews election and nonprofit implications.
- Identity verification and equal-access rules are published.
- Public records and office-supplied fields are technically separate.
- Statements retain revisions and disclosure labels.
- Payment cannot influence factual correction or ranking.

### Before enterprise API

- API schema, documentation, authentication, rate limits, metering, and revocation exist.
- Data licenses and acceptable-use terms are approved.
- FEC contributor-use restrictions are enforced in exports and endpoints.
- Support and incident obligations are staffed.
- Load, abuse, authorization, and data-leakage tests pass.

---

## 23. Reference sources

Implementation must re-check current limits, terms, schemas, and licenses.

- Nevada Legislature: <https://www.leg.state.nv.us/>
- Nevada Electronic Legislative Information System: <https://www.leg.state.nv.us/App/NELIS/>
- Nevada Legislative Counsel Bureau district downloads: <https://www.leg.state.nv.us/Division/Research/Districts/Reapp/2021/district-plans/>
- NELIS report exports: <https://www.leg.state.nv.us/App/NELIS/REL/83rd2025/Reports>
- U.S. Census Geocoder: <https://www.census.gov/programs-surveys/geography/technical-documentation/complete-technical-documentation/census-geocoder.html>
- Census TIGERweb: <https://www.census.gov/data/developers/data-sets/TIGERweb-map-service.html>
- Congress.gov API: <https://api.congress.gov/>
- Federal Election Commission API: <https://api.open.fec.gov/developers/>
- FEC contributor-information restrictions: <https://www.fec.gov/updates/sale-or-use-contributor-information/>
- Nevada Secretary of State: <https://www.nvsos.gov/>
- IRS campaign-intervention guidance: <https://www.irs.gov/charities-non-profits/charitable-organizations/restriction-of-political-campaign-intervention-by-section-501c3-tax-exempt-organizations>
- IRS conflict-of-interest guidance: <https://www.irs.gov/charities-non-profits/form-1023-purpose-of-conflict-of-interest-policy>
- Nevada nonprofit corporations: <https://www.leg.state.nv.us/nrs/NRS-082.html>
- Vercel pricing: <https://vercel.com/pricing>
- Supabase pricing: <https://supabase.com/pricing>
- Supabase backups: <https://supabase.com/docs/guides/platform/backups>
- MapLibre GL JS: <https://maplibre.org/projects/gl-js/>
- Resend pricing: <https://resend.com/pricing>
- Stripe pricing: <https://stripe.com/pricing>
- GitHub Actions billing: <https://docs.github.com/en/billing/concepts/product-billing/github-actions>
- WCAG 2.2: <https://www.w3.org/TR/WCAG22/>
- OWASP Application Security Verification Standard: <https://owasp.org/www-project-application-security-verification-standard/>

---

## 24. Approval

Approval authorizes discovery, technical design, and phased implementation of the defined scope. It does not authorize publication of unverified political data, paid candidate/office products without legal review, or expansion outside Nevada without a separate maintenance plan.

| Role               | Name | Status  | Date |
| ------------------ | ---- | ------- | ---- |
| Founder / Product  | TBD  | Pending | —    |
| Engineering        | TBD  | Pending | —    |
| Data / Editorial   | TBD  | Pending | —    |
| Legal / Compliance | TBD  | Pending | —    |
