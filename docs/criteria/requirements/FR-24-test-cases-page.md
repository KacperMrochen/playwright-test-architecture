# FR-24 — Open the site's published test cases

The site links to a page listing the test cases it publishes for
automation practice.

Site reference: TC07.

Checked by hand, not by the automated suite: [MC-02](../../testing/manual-checks.md#mc-02--test-cases-page).
Why it stays manual is in
[`test-strategy.md`](../../testing/test-strategy.md#what-we-dont-automate).

## Acceptance criteria

- AC-24.1 Given the home page, when either "Test Cases" link is clicked —
  in the navigation bar or on the home page banner — then `/test_cases`
  opens with the "Test Cases" heading and the list of the site's published
  test cases (26 on the verification date).
