# automationexercise.com — Acceptance criteria

## Context

This project tests a third-party site it doesn't own, so these criteria
don't describe a feature being built. They describe how
[automationexercise.com](https://automationexercise.com) was *observed* to
behave, driven by hand against the live site, and they're the contract the
automated suite checks. The site's own published
[test cases](https://automationexercise.com/test_cases) and
[API list](https://automationexercise.com/api_list) were the starting point.
No criterion is a paraphrase of those titles: each one records actual
messages, status codes and response shapes seen on the live site.

Each requirement lives in its own file under
[`requirements/`](requirements/). The
[test plan](../testing/test-plan.md) says which
criterion is tested at which layer and in which pipeline stage — and
which ones are checked by hand instead, in
[`manual-checks.md`](../testing/manual-checks.md).

| ID | Requirement |
|---|---|
| [FR-01](requirements/FR-01-registration.md) | Register a new account |
| [FR-02](requirements/FR-02-duplicate-email-rejected.md) | Registration rejects an email already in use |
| [FR-03](requirements/FR-03-login.md) | Log in with valid credentials |
| [FR-04](requirements/FR-04-invalid-login-rejected.md) | Login rejects invalid credentials |
| [FR-05](requirements/FR-05-logout.md) | Log out |
| [FR-06](requirements/FR-06-add-to-cart.md) | Add products to the cart |
| [FR-07](requirements/FR-07-remove-from-cart.md) | Remove a product from the cart |
| [FR-08](requirements/FR-08-cart-belongs-to-account.md) | The cart belongs to the account, not the browser |
| [FR-09](requirements/FR-09-checkout-requires-login.md) | Checkout requires a logged-in user |
| [FR-10](requirements/FR-10-place-order.md) | Place an order |
| [FR-11](requirements/FR-11-download-invoice.md) | Download the invoice for a placed order |
| [FR-12](requirements/FR-12-product-catalog-api.md) | List the product catalog through the API |
| [FR-13](requirements/FR-13-delete-account-api.md) | Delete an account through the API |
| [FR-14](requirements/FR-14-api-request-errors.md) | The API reports request errors in the response body |
| [FR-15](requirements/FR-15-search-products.md) | Search the catalog |
| [FR-16](requirements/FR-16-browse-by-category.md) | Browse products by category |
| [FR-17](requirements/FR-17-browse-by-brand.md) | Browse products by brand |
| [FR-18](requirements/FR-18-product-detail.md) | The product detail page describes the product |
| [FR-19](requirements/FR-19-newsletter-subscription.md) | Subscribe to the newsletter |
| [FR-20](requirements/FR-20-contact-us.md) | Submit the Contact Us form |
| [FR-21](requirements/FR-21-product-review.md) | Write a product review |
| [FR-22](requirements/FR-22-update-account-api.md) | Update an account through the API |
| [FR-23](requirements/FR-23-scroll-to-top.md) | Return to the top of the home page *(checked by hand)* |
| [FR-24](requirements/FR-24-test-cases-page.md) | Open the site's published test cases *(checked by hand)* |

## Non-functional requirements

- NFR-01 **Accessibility:** the home, products, cart and checkout pages
  have zero `critical` or `serious` violations in an axe-core scan. Not
  yet measured against the live site; the first `@a11y` run establishes
  whether the site currently meets it.
- NFR-02 **Third-party content:** with ads and the consent dialog enabled,
  as a real visitor sees the site, a visitor who answers the consent
  dialog can add a product to the cart and press "Proceed To Checkout",
  which brings up the "Register / Login" prompt (AC-09.1). The dialog
  appears in some regions and blocks every click until answered
  ([ADR 0001](../adr/0001-third-party-network-isolation.md)). The suite
  blocks third-party requests by design, so this is checked by hand
  ([MC-03](../testing/manual-checks.md#mc-03--a-real-visitors-pass)).
- **Performance:** N/A. Generating load against a site we don't own isn't
  authorized.
- **Security:** N/A. Active security testing of a site we don't own isn't
  authorized.
- **Privacy:** N/A for the site. On our side, every account the suite
  creates uses a generated `@example.com` address and fake personal and
  card data.
- **Reliability:** N/A. The site offers no SLA, and how the suite treats
  an unavailable site is covered in
  [`TESTING.md`](../../TESTING.md#flake-policy).
- **Observability:** N/A. We have no access to the site's logs or metrics.

## Exit criteria

- Every acceptance criterion is proven at the layer the test plan's
  coverage map assigns: by an automated test, or — where the map says
  *manual* — by a check in
  [`manual-checks.md`](../testing/manual-checks.md) with at least one dated
  run in its log.
- Every `@smoke` test passes on the three PR-gate projects and on all six
  after a merge to main; every `@regression` test passes on `api` and
  `e2e-chromium`.
- Each new test has been seen to fail when its behavior is broken
  ([`TESTING.md`](../../TESTING.md#a-test-must-be-able-to-fail)).
- The test plan references these `AC-NN.N` IDs instead of the site's
  own `TC`/`API` numbering.
- NFR-01 has an `@a11y` test in the weekly job.
- NFR-02 has at least one dated run of its manual check.

## Decision points

- How the suite gets accounts and logged-in sessions — decided in
  [ADR 0002](../adr/0002-test-account-strategy.md): an account per test,
  created and deleted through the API, with the login form posted over
  HTTP and the session reused via `storageState`.

## Assumptions

- **The site can change without notice.** Every criterion reflects the
  site as observed when it was verified: 2026-09-16, and 2026-09-17 for
  FR-23 and FR-24. A failing test is first checked against the live site
  before anyone "fixes" the test; if the site changed, the criterion is
  updated here first. The nightly run exists to surface that drift within
  a day
  ([`test-strategy.md`](../testing/test-strategy.md#detecting-site-drift)).
- **Catalog contents aren't a contract.** Product names, prices and the
  product count (34 on the verification date, with IDs from 1 to 43 and
  gaps) are site data, not behavior. Criteria assert structure and
  arithmetic; specific products only appear as test inputs.
- **Email matching is case-sensitive.** Logging in with the registered
  email in upper case fails. This is recorded as observed, not tested:
  it's more likely an implementation detail than an intended rule.
- **The search matching rule is unknown.** Searching `top` returns
  products whose names don't contain it, so the site matches on more than
  the name — probably the category. We assert that known name matches
  appear (AC-15.2) rather than guessing the rule.
- **Device presets aren't real devices.** The mobile projects run an
  iPhone and a Pixel profile in desktop builds of WebKit and Chromium, so
  touch input, on-screen keyboards and real mobile browsers can behave
  differently. There's no pass/fail to state about that without real
  hardware, so it isn't a criterion; an exploratory session on a real
  phone ([MC-04](../testing/manual-checks.md#mc-04--checkout-on-a-real-phone))
  is how the gap is examined.
- **Writes we can't read back.** A newsletter subscription, a contact
  message and a product review are all accepted with a confirmation
  message and nothing the site shows back. The criteria stop at the
  confirmation, because that's the whole of the observable behavior.

## Out of scope

- Payment validation — the payment form accepts any value in every field
  (an order was placed with card number `not-a-card` and expiry `99/1900`),
  so there's no validation behavior to test.
- Account deletion through the UI ("Delete Account" link) — the API
  endpoint (FR-13) is what the suite relies on for cleanup, and the UI
  link would delete an account the suite still needs.
- The Contact Us file upload — optional in the form, and an upload adds
  a fixture file plus a code path the site never shows back.
- Scrolling back up by hand (the site's TC26) — the browser's behavior,
  not the site's. The risk worth watching, content jumping as ads load, is
  part of the real-visitor pass behind NFR-02.

## Open questions
