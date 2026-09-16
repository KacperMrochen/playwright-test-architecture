# FR-19 — Subscribe to the newsletter

The site accepts an email address in the footer subscription form and
confirms the subscription without reloading the page.

Site reference: TC10, TC11.

## Acceptance criteria

- AC-19.1 Given the home page footer under the heading "Subscription",
  when an email address is submitted, then "You have been successfully
  subscribed!" appears.
- AC-19.2 Given the cart page, when the same form is used, then it behaves
  identically. It is literally the same component — same `susbscribe_email`
  field (the site's spelling) in the shared footer — so one test covers
  both pages.
