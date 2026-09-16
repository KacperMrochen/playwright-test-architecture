# Manual checks

Automation is a cost, not a virtue. Every automated test has to be
written, run on six projects, diagnosed when it fails and maintained when
the site moves — so a behavior earns automation by risk, not by being
automatable. The checks below are the ones that don't earn it, plus the
risks our own automation deliberately hides from itself.

This is the half of a test strategy that usually goes unwritten: a suite
with no manual counterpart implies either that everything is automated, or
that whatever isn't automated doesn't matter. Neither is true here.

Owner is QA, following the same convention as the
[coverage map](./test-plan.md#coverage-map) — a role a real team would
staff, not an actual team. `MC-NN` ids are stable and never reused, the
same rule the criteria follow.

## Why these aren't automated

| Case | Risk if it breaks | Cost to automate | Decision |
|---|---|---|---|
| TC25, TC26 scroll behavior | Cosmetic. A visitor scrolls manually instead | High and unstable: scroll position, smooth-scroll timing and momentum differ per engine and device preset, so the assertion is flaky in exactly the projects that would run it | Manual (MC-01) |
| TC07 Test Cases page renders | The site's own documentation page. No shop behavior, no customer impact | Low — one assertion | Manual (MC-02). Cheap to automate, but it would prove nothing about the store and add a test nobody reads |
| Ads and the consent dialog | A real visitor sees layout shift, a consent dialog, and slower pages. We see none of it | Not automatable by us: [ADR 0001](../adr/0001-third-party-network-isolation.md) blocks these on purpose, and unblocking them re-introduces the flake the ADR removed | Manual (MC-03) |
| Real mobile devices | Touch, on-screen keyboards and real mobile Safari/Chrome builds differ from Playwright's device presets | A device farm — infrastructure this project doesn't have | Manual (MC-04) |

The last two matter most, because they're gaps *created* by decisions we
made for good reasons. `test-strategy.md` names the device-preset caveat
honestly; this page is where the follow-up lives instead of trailing off.

## The checks

### MC-01 — Scroll behavior (TC25, TC26)

**Trigger:** when the footer, the scroll-to-top control, or page layout
changes. Otherwise once a quarter.
**Time:** ~3 minutes.

1. Open the home page and scroll to the bottom.
2. Click the upward arrow control — the page returns to the top.
3. Scroll to the bottom again and scroll back up by hand, without the
   arrow — nothing snaps back, jumps or fights the scroll.

**Expected:** both return the visitor to the top, smoothly and without
layout jumping as ads fill in.

### MC-02 — Test Cases page (TC07)

**Trigger:** part of MC-01's quarterly pass.
**Time:** ~1 minute.

1. Open `/test_cases` from the navigation.
2. The list of published cases renders, and the page is not a 404 or an
   empty shell.

**Expected:** the page the criteria were originally derived from still
exists. If it has changed shape, the
[source case index](./test-plan.md#source-case-index) may need
re-auditing — that's the real reason to look.

### MC-03 — A real visitor's pass, with ads and consent enabled

**Trigger:** monthly, and before showing the project to anyone.
**Time:** ~10 minutes.

Run in an ordinary browser, with no blocking and no automation:

1. Load the home page. Note whether a consent dialog appears, and what it
   blocks until answered.
2. Accept it, then browse products, add to the cart and reach checkout.
3. Watch for layout shift as ad slots fill, content jumping under the
   pointer, and pages that feel slow.

**Expected:** the journeys our suite proves still work for a visitor who
sees the whole page. **This is the check that would catch an ad-caused
break, which the automated suite cannot see by design.**

### MC-04 — Exploratory charter: checkout on a real device

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
rather than an intention.

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
