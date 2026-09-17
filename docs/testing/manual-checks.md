# Manual checks

Automation is a cost, not a virtue. Every automated test has to be
written, run on six projects, diagnosed when it fails and maintained when
the site moves — so a behavior earns automation by risk, not by being
automatable. The checks below are the ones that don't earn it, plus the
risks our own automation deliberately hides from itself.

This is the half of a test strategy that usually goes unwritten: a suite
with no manual counterpart implies either that everything is automated, or
that whatever isn't automated doesn't matter. Neither is true here.

A manual check traces to the contract the same way a test does: each one
names the criterion or NFR it proves, and the
[coverage map](./test-plan.md#coverage-map) lists those criteria with the
layer *manual*. Owner is QA, following the same convention as the map — a
role a real team would staff, not an actual team. `MC-NN` ids are stable
and never reused, the same rule the criteria follow.

## Why these aren't automated

| Check | Proves | Risk if it breaks | Cost to automate | Decision |
|---|---|---|---|---|
| Scroll-to-top control (the site's TC25) | AC-23.1, AC-23.2 | Cosmetic. A visitor scrolls up by hand instead | High and unstable: scroll position, smooth-scroll timing and momentum differ per engine and device preset, so the assertion is flaky in exactly the projects that would run it | Manual (MC-01) |
| Test Cases page (the site's TC07) | AC-24.1 | The site's own documentation page. No shop behavior, no customer impact | Low — one assertion | Manual (MC-02). Cheap to automate, but it would prove nothing about the store and add a test nobody reads |
| Ads and the consent dialog | NFR-02 | A real visitor sees layout shift, a consent dialog, and slower pages. We see none of it | Not automatable by us: [ADR 0001](../adr/0001-third-party-network-isolation.md) blocks these on purpose, and unblocking them re-introduces the flake the ADR removed | Manual (MC-03) |
| Real mobile devices | — (an assumption, not a criterion) | Touch, on-screen keyboards and real mobile Safari/Chrome builds differ from Playwright's device presets | A device farm — infrastructure this project doesn't have | Exploratory (MC-04) |

The last two matter most, because they're gaps *created* by decisions we
made for good reasons. The criteria name both — NFR-02 and the
device-preset assumption — and this page is where the follow-up lives
instead of trailing off.

Scrolling back up by hand (the site's TC26) has no check: it's the
browser's behavior, not the site's, and the part of it that is the site's
— content jumping as ads load — is watched in MC-03.

## The checks

### MC-01 — Scroll-to-top control

**Proves:** AC-23.1, AC-23.2.
**Trigger:** when the footer, the scroll-to-top control, or page layout
changes. Otherwise once a quarter.
**Time:** ~2 minutes.

1. Open `https://automationexercise.com/`. At the top of the page there's
   no arrow control.
2. Scroll to the bottom. The footer's "Subscription" heading is in view,
   and an arrow control has appeared at the bottom right.
3. Click the arrow.

**Expected:** the page returns to the top, the address bar still reads
`https://automationexercise.com/`, and "Full-Fledged practice website for
Automation Engineers" is in view.

### MC-02 — Test Cases page

**Proves:** AC-24.1.
**Trigger:** part of MC-01's quarterly pass.
**Time:** ~1 minute.

1. From the home page, click "Test Cases" in the navigation bar.
2. Go back, and click the "Test Cases" link on the home page banner.

**Expected:** both open `/test_cases`, with the "Test Cases" heading and
the list of the site's published test cases. If the list has changed
shape, the [source case index](./test-plan.md#source-case-index) may need
re-auditing — that's the real reason to look.

### MC-03 — A real visitor's pass

**Proves:** NFR-02.
**Trigger:** monthly, and before showing the project to anyone.
**Time:** ~10 minutes.

Run in an ordinary browser, with no blocking and no automation:

1. Load the home page. Note whether a consent dialog appears, and what it
   blocks until answered. Answer it.
2. Open a product, add it to the cart, open the cart, and press
   "Proceed To Checkout".
3. Along the way, watch for layout shift as ad slots fill, content jumping
   under the pointer, and pages that feel slow.

**Expected:** step 2 ends at the "Register / Login" prompt — that's the
pass/fail. Stopping there needs no account, so the check leaves nothing
behind on the site. What step 3 turns up goes in the run log's follow-up
column. **This is the check that would catch an ad-caused break, which
the automated suite cannot see by design.**

### MC-04 — Checkout on a real phone

**Examines:** the device-preset assumption in the criteria. Exploratory, so
there's no pass/fail.
**Trigger:** quarterly, or when checkout changes.
**Time:** 30-minute timebox, session notes rather than pass/fail.

**Charter:** *explore checkout on a real phone, with real typing and a
real keyboard, to discover input and layout problems the device presets
can't show.*

Worth attention: the card fields and the on-screen keyboard, the address
block at narrow widths, tap targets near the payment button, and whether
anything important sits under the browser chrome.

**Record:** what was explored, what was found, and what wasn't reached in
the timebox — the standard session-based format. A finding becomes either
a criterion (if it's behavior we can pin down) or a note here.

## Run log

Filled in per run, so "we do manual checks" is a claim with evidence
rather than an intention. A criterion checked by hand only counts as
covered once its check has a dated run here.

| Date | Checks | Who | Result | Follow-up |
|---|---|---|---|---|
| — | — | — | — | — |

## What would make one of these automated

A check moves from this page into the suite when any of these is true:

- **It broke twice.** Two real regressions beat any argument about cost.
- **The behavior became business-critical** — for example, if the scroll
  control became the only way to reach navigation on mobile.
- **A cheap, stable assertion appears.** Asserting the arrow control is
  visible and clickable is stable; asserting the smooth-scroll animation
  is not. If the risk can be covered by the stable half, automate that
  half only.
- **The infrastructure arrives.** MC-04 becomes automatable the day this
  project has a real device farm, not before.

The reverse also applies: an automated test that fails repeatedly for
reasons nobody acts on belongs here instead, as a manual check with an
honest cadence.
