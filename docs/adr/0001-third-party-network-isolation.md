# 0001 — Block third-party requests in the browser context

Status: proposed
Date: 2026-09-16
Supersedes: —

## Context

The target site carries Google ad scripts. In practice they cause two
different problems, and only the first is the one usually expected:

- **Flake.** Ad and tracker requests load on their own schedule, add
  network noise and console errors unrelated to anything under test, and
  shift layout as slots fill.
- **A hard block.** From an EU connection, `pagead2.googlesyndication.com`
  pulls in a Google Funding Choices consent dialog (`.fc-consent-root`)
  that covers the page and intercepts every click. Verified live on
  2026-09-16: Playwright reports it as a click timeout on an element it can
  see, which reads like a broken selector rather than a popup. Nothing
  proceeds until it's dismissed.

Whether a given runner sees the dialog depends on where it is, so the same
suite would pass locally in one region and hang in another. That's not a
flake budget question; it's a correctness question about our own test
environment.

The pages reference three external hosts: `pagead2.googlesyndication.com`
(ad script), `fonts.googleapis.com` (stylesheet) and `www.youtube.com` (a
nav link, not a resource). The consent host,
`fundingchoicesmessages.google.com`, appears only at runtime, injected by
the ad script — it isn't in the markup at all.

## Options considered

### Do nothing; absorb it with retries

- Pro: no code.
- Con: doesn't work. The dialog blocks every click, so a retry fails the
  same way.
- Con: retries exist to absorb rare infrastructure noise, not a
  reproducible blocker.

### Dismiss the dialog in a fixture

- Pro: the page runs as a real visitor sees it, ads and all.
- Con: the dialog's button text is localized — it appeared here in Polish.
  Matching it means either locale-specific strings or brittle structural
  selectors.
- Con: it doesn't always appear, so every test pays a conditional wait for
  something that may never come.
- Con: the ad requests, and the flake they bring, are still there.

### Block a list of known ad and consent hosts

- Pro: targeted; everything else loads normally.
- Pro: proven — the full journey ran clean with the two hosts blocked.
- Con: a blocklist is only as current as its last update. A new ad host, or
  the site changing networks, silently reintroduces the problem, and the
  symptom is once again a click timeout that looks like a selector bug.

### Block every request that isn't the site under test, except fonts

- Pro: nothing third-party can appear later without us deciding to allow
  it, which fits a site that changes without notice.
- Pro: strictly faster and quieter — no ad payloads at all.
- Con: if the site legitimately adds a CDN, the block turns into a
  confusing failure until someone updates the allowlist.
- Con: `fonts.googleapis.com` has to be allowed explicitly, or text renders
  in fallback fonts and the accessibility scan measures something the real
  site doesn't look like.

## Decision

We block every request outside `automationexercise.com` at the browser
context level, allowing `fonts.googleapis.com` and `fonts.gstatic.com`.

The allowlist wins over the blocklist for the same reason the nightly
drift check exists: this site changes without telling us, and a blocklist
fails silently and confusingly when it does. An allowlist fails loudly, in
one obvious place, and the fix is one line.

This applies to our own browser context only. We don't act on the site or
anyone else's systems — the ad requests simply never leave our test
browser. API tests are unaffected; they don't load a page at all.

## Consequences

- Positive: the consent dialog never appears, so tests behave the same in
  every region, including runners we don't control.
- Positive: less flake, quieter console output, faster page loads.
- Positive: the two engine-and-device projects get the same treatment, so
  mobile runs aren't the odd ones out.
- Negative: we test the site without its ads. Layout shifts a real visitor
  sees, and any bug caused by the ad script itself, are invisible to this
  suite. That's an accepted blind spot, not an oversight.
- Negative: the allowlist is a thing to maintain. If the site adopts a CDN,
  someone has to notice the failure and add the host.
- Follow-up: the blocking belongs in the shared browser fixture, so no spec
  can forget it ([`TESTING.md`](../../TESTING.md#layers-and-where-code-lives)).
  Logging blocked hosts once per run makes a newly added third party
  visible rather than mysterious.
