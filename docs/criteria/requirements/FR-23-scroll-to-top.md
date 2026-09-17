# FR-23 — Return to the top of the home page

The home page shows an arrow control once a visitor scrolls down, and the
control takes them back to the top.

Site reference: TC25.

Checked by hand, not by the automated suite: [MC-01](../../testing/manual-checks.md#mc-01--scroll-to-top-control).
Why it stays manual is in
[`test-strategy.md`](../../testing/test-strategy.md#what-we-dont-automate).

## Acceptance criteria

- AC-23.1 Given the home page at the top, the arrow control isn't shown.
  When the page is scrolled to the bottom, then the footer's
  "Subscription" heading is in view and the arrow control is shown at the
  bottom right.
- AC-23.2 Given the home page scrolled to the bottom, when the arrow
  control is clicked, then the page returns to the top without the URL
  changing, and "Full-Fledged practice website for Automation Engineers"
  is in view.
