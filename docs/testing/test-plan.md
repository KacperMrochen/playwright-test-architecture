# automationexercise.com — Test plan

Source of truth: [`docs/criteria/`](../criteria/README.md) — the
live-verified behavioral contract, `FR-NN` requirements with `AC-NN.N`
criteria. This plan doesn't own any numbering; it says where each criterion
is proven, at which layer, and in which pipeline stage.

The site's own [test cases](https://automationexercise.com/test_cases) (26)
and [API list](https://automationexercise.com/api_list) (14 endpoints) are
where the criteria came from, not the key this plan is organized by. That
mapping is kept in [Source case index](#source-case-index) so the published
list can be audited for anything we skipped — it's someone else's
documentation, with no versioning guarantee, so it's provenance rather than
a contract.

## Coverage map

Every criterion. Layer picks the cheapest thing that proves the
behavior; owner reflects the convention a real team would follow
(single-endpoint contract checks written alongside the endpoint by devs,
journeys and cross-feature checks by QA) rather than an actual team — here
both are the same person.

Tags are the pipeline axis, independent of layer — see
[`test-strategy.md`](./test-strategy.md#pipeline). Every standalone test
carries exactly one of `@smoke` or `@regression`; criteria proven as a step
inside another test inherit that test's tag and say so.

| Criterion | Behavior | Layer | Owner | Test | Tag |
|---|---|---|---|---|---|
| AC-01.1 | Signup form opens the account information page, email locked | e2e | QA | `e2e/checkout.spec.ts` — "registers and places an order" (step) | `@smoke` |
| AC-01.2 | Account information form creates the account | e2e | QA | same journey (step) | `@smoke` |
| AC-01.3 | Continue lands logged in as the new user | e2e | QA | same journey (step) | `@smoke` |
| AC-01.4 | `POST /api/createAccount` returns 201 | integration | dev | `api/account.spec.ts` | `@smoke` |
| AC-01.5 | `getUserDetailByEmail` returns the submitted profile details, except the mobile number | integration | dev | `api/account.spec.ts` | `@regression` |
| AC-01.6 | `getUserDetailByEmail` returns 404 for an unknown email | integration | dev | `api/account.spec.ts` | `@regression` |
| AC-02.1 | Signup form rejects an existing email with a message | e2e | QA | `e2e/auth.spec.ts` | `@regression` |
| AC-02.2 | `createAccount` rejects an existing email (400) | integration | dev | `api/account.spec.ts` | `@regression` |
| AC-03.1 | Login form authenticates and updates the navigation | e2e | QA | `e2e/auth.spec.ts` — "AC-03.1 logs in and out" | `@smoke` |
| AC-03.2 | An API-created account can log in through the UI | e2e | QA | `e2e/auth.spec.ts` — step inside "AC-03.1 logs in and out", whose account is API-created | `@smoke` |
| AC-03.3 | `verifyLogin` confirms valid credentials (no session) | integration | dev | `api/auth.spec.ts` | `@smoke` |
| AC-04.1 | Wrong password shows the incorrect-credentials message | e2e | QA | `e2e/auth.spec.ts` | `@regression` |
| AC-04.2 | Unknown email shows the identical message | e2e | QA | `e2e/auth.spec.ts` | `@regression` |
| AC-04.3 | `verifyLogin` returns 404 for a wrong password | integration | dev | `api/auth.spec.ts` | `@regression` |
| AC-04.4 | `verifyLogin` returns 404 for an unknown email | integration | dev | `api/auth.spec.ts` | `@regression` |
| AC-05.1 | Logout ends the session and restores Signup / Login | e2e | QA | `e2e/auth.spec.ts` — closing step of "AC-03.1 logs in and out" | `@smoke` |
| AC-05.2 | Logging out leaves the account's other sessions alone | e2e | QA | `e2e/auth.spec.ts` — "AC-05.2 logging out leaves another session alone" | `@regression` |
| AC-06.1 | Add to cart confirms with a modal | e2e | QA | `e2e/cart.spec.ts` (also exercised by the order journey) | `@regression` |
| AC-06.2 | Cart lists each product with price, quantity, total | e2e | QA | `e2e/cart.spec.ts` (also exercised by the order journey) | `@regression` |
| AC-06.3 | Adding the same product again increments its quantity | e2e | QA | `e2e/cart.spec.ts` | `@regression` |
| AC-06.4 | Quantity chosen on the detail page reaches the cart | e2e | QA | `e2e/cart.spec.ts` | `@regression` |
| AC-06.6 | A cart row's quantity can't be edited in the cart | e2e | QA | `e2e/cart.spec.ts` | `@regression` |
| AC-07.1 | Deleting a row removes it without a navigation | e2e | QA | `e2e/cart.spec.ts` | `@regression` |
| AC-07.2 | An empty cart shows the empty-cart message | e2e | QA | `e2e/cart.spec.ts` | `@regression` |
| AC-08.1 | The account's cart appears in a separate browser session | e2e | QA | `e2e/cart.spec.ts` — "AC-08.1 shows the cart in another browser session" | `@regression` |
| AC-08.2 | A logged-out cart merges into the account at login | e2e | QA | `e2e/checkout.spec.ts` — order journey (step) | `@smoke` |
| AC-09.1 | Checkout prompts a logged-out visitor to register or log in | e2e | QA | `e2e/checkout.spec.ts` — order journey (step) | `@smoke` |
| AC-10.1 | Checkout shows address details and order review | e2e | QA | `e2e/checkout.spec.ts` — order journey (step) | `@smoke` |
| AC-10.2 | Delivery and billing addresses match the account | e2e | QA | `e2e/checkout.spec.ts` — "AC-10.2 checkout shows the registered address" | `@regression` |
| AC-10.3 | Review lists every product and totals them correctly | e2e | QA | `e2e/checkout.spec.ts` — order journey (step) | `@smoke` |
| AC-10.4 | The payment form requires every card field | e2e | QA | `e2e/checkout.spec.ts` | `@regression` |
| AC-10.5 | Paying confirms the order | e2e | QA | `e2e/checkout.spec.ts` — order journey (step) | `@smoke` |
| AC-10.6 | The cart is empty after the order | e2e | QA | `e2e/checkout.spec.ts` — order journey (step) | `@smoke` |
| AC-10.7 | Checkout offers an order comment field | e2e | QA | `e2e/checkout.spec.ts` — order journey (step) | `@smoke` |
| AC-11.1 | The invoice downloads as text naming buyer and total | e2e | QA | `e2e/checkout.spec.ts` — "AC-11.1 downloads the invoice for a placed order" | `@regression` |
| AC-12.1 | `productsList` returns the catalog with complete products | integration | dev | `api/products.spec.ts` | `@smoke` |
| AC-13.1 | `deleteAccount` removes the account; its credentials stop verifying | integration | dev | `api/account.spec.ts` | `@regression` |
| AC-13.2 | `deleteAccount` returns 404 for an unknown email | integration | dev | `api/account.spec.ts` | `@regression` |
| AC-13.3 | `deleteAccount` refuses a wrong password as "not found" | integration | dev | `api/account.spec.ts` | `@regression` |
| AC-14.1 | `POST /api/productsList` reports 405 in the body | integration | dev | `api/products.spec.ts` | `@regression` |
| AC-14.2 | `DELETE /api/verifyLogin` reports 405 in the body | integration | dev | `api/auth.spec.ts` | `@regression` |
| AC-14.3 | `verifyLogin` reports 400 for a missing parameter | integration | dev | `api/auth.spec.ts` | `@regression` |
| AC-14.4 | `createAccount` reports 400 for a missing parameter | integration | dev | `api/account.spec.ts` | `@regression` |
| AC-14.5 | `PUT /api/brandsList` reports 405 in the body | integration | dev | `api/brands.spec.ts` | `@regression` |
| AC-14.6 | `searchProduct` reports 400 for a missing parameter | integration | dev | `api/search.spec.ts` | `@regression` |
| AC-14.7 | `GET /api/searchProduct` reports 405 in the body | integration | dev | `api/search.spec.ts` | `@regression` |
| AC-15.1 | Search shows "Searched Products" and results | e2e | QA | `e2e/catalog.spec.ts` — "AC-15.1 searches the catalog" | `@regression` |
| AC-15.2 | Known name matches appear in the results | e2e | QA | `e2e/catalog.spec.ts` — same test | `@regression` |
| AC-15.3 | `searchProduct` returns matching products | integration | dev | `api/search.spec.ts` | `@regression` |
| AC-15.4 | A search with no matches lists nothing, with no message | e2e | QA | `e2e/catalog.spec.ts` — "AC-15.4 lists nothing when the search matches nothing" | `@regression` |
| AC-15.5 | `searchProduct` returns an empty array, not a 404 | integration | dev | `api/search.spec.ts` | `@regression` |
| AC-16.1 | The sidebar offers Women, Men and Kids panels | e2e | QA | `e2e/catalog.spec.ts` — "AC-16.1 browses by category" | `@regression` |
| AC-16.2 | A category opens its filtered page | e2e | QA | `e2e/catalog.spec.ts` — same test | `@regression` |
| AC-17.1 | A brand opens its filtered page | e2e | QA | `e2e/catalog.spec.ts` — "AC-17.1 browses by brand" | `@regression` |
| AC-17.2 | `brandsList` returns the brands | integration | dev | `api/brands.spec.ts` | `@regression` |
| AC-18.1 | The detail page shows the product's full information | e2e | QA | `e2e/catalog.spec.ts` — "AC-18.1 shows a product's details" | `@regression` |
| AC-06.5 | Every listing uses the same add-to-cart control | e2e | QA | `e2e/cart.spec.ts` — "AC-06.5 uses the same add-to-cart control on every listing" | `@regression` |
| AC-19.1 | Subscribing from the home page confirms success | e2e | QA | `e2e/account.spec.ts` — "AC-19.1 subscribes from the home page" | `@regression` |
| AC-19.2 | The cart page's form is the same component | e2e | QA | `e2e/account.spec.ts` — same test (step) | `@regression` |
| AC-20.1 | The contact form offers its fields | e2e | QA | `e2e/contact.spec.ts` | `@regression` |
| AC-20.2 | Submitting raises a confirm dialog that must be accepted | e2e | QA | `e2e/contact.spec.ts` | `@regression` |
| AC-20.3 | Accepting submits and confirms success | e2e | QA | `e2e/contact.spec.ts` | `@regression` |
| AC-21.1 | A review is accepted and thanked for | e2e | QA | `e2e/product-review.spec.ts` | `@regression` |
| AC-22.1 | `updateAccount` changes the stored details | integration | dev | `api/account.spec.ts` | `@regression` |
| AC-22.2 | `updateAccount` returns 404 for an unknown email | integration | dev | `api/account.spec.ts` | `@regression` |
| AC-22.3 | `updateAccount` refuses a wrong password as "not found" | integration | dev | `api/account.spec.ts` | `@regression` |

That's 66 criteria. Five tests carry `@smoke`: the order journey, the
login/logout test, and three API checks (`AC-01.4`, `AC-03.3`, `AC-12.1`).
The rest are `@regression` — about 20 tests, since several criteria share
one test; the exact number is settled when they're written.

No unit layer appears above: we don't own this site's code, so there's
nothing of theirs to unit test. "Unit" applies only to our own helper code
(data builders, API clients), which
[`test-strategy.md`](./test-strategy.md#framework-and-tooling) covers.

## Source case index

The site's published numbering, and what became of each case. This is how
to check that nothing published was silently dropped — it is *not* what
tests trace to; tests trace to the criteria above.

| Site case | Criteria | Status |
|---|---|---|
| TC01 Register user | AC-01.1 – AC-01.3 | folded into the order journey — see [Redundant coverage](#redundant-coverage) |
| TC02 Login correct | AC-03.1 | covered |
| TC03 Login incorrect | AC-04.1, AC-04.2 | covered (UI message plus API10's contract) |
| TC04 Logout | AC-05.1 | covered, bundled into the login test |
| TC05 Register with an existing email | AC-02.1, AC-02.2 | covered at both layers |
| TC06 Contact Us form | AC-20.1 – AC-20.3 | covered |
| TC07 Test Cases page renders | — | manual; static content, no business risk |
| TC08 Products and product detail pages | AC-18.1 | covered |
| TC09 Search product | AC-15.1 – AC-15.3 | covered at both layers |
| TC10 Subscription (home) | AC-19.1 | covered |
| TC11 Subscription (cart) | AC-19.2 | covered by TC10's test — verified as the same component |
| TC12 Add products to cart | AC-06.1 – AC-06.3 | covered |
| TC13 Product quantity in cart | AC-06.4 | covered, bundled into the cart test |
| TC14 Order: register while checking out | AC-01.1 – AC-01.3, AC-08.2, AC-09.1, AC-10.1, AC-10.3, AC-10.5, AC-10.6 | covered — the suite's widest journey |
| TC15 Order: register before checking out | — | redundant with TC14 |
| TC16 Order: login before checking out | AC-10.2, AC-10.4 | covered by the checkout tests using an API-seeded account |
| TC17 Remove products from cart | AC-07.1, AC-07.2 | covered, bundled into the cart test |
| TC18 View category products | AC-16.1, AC-16.2 | covered |
| TC19 Brand products | AC-17.1, AC-06.5 | covered — the add-to-cart half is redundant, see below |
| TC20 Cart persists after login | AC-08.1 | covered |
| TC21 Add a product review | AC-21.1 | covered |
| TC22 Add to cart from Recommended items | AC-06.5 | redundant — verified as the same control, see below |
| TC23 Address details on checkout | AC-10.2 | covered |
| TC24 Download invoice | AC-11.1 | covered |
| TC25, TC26 Scroll behavior | — | manual; cosmetic, no business risk |
| API01 `productsList` | AC-12.1 | covered |
| API02 `productsList` POST | AC-14.1 | covered |
| API03 `brandsList` | AC-17.2 | covered |
| API04 `brandsList` PUT | AC-14.5 | covered |
| API05 `searchProduct` | AC-15.3 | covered |
| API06 `searchProduct` missing parameter | AC-14.6 | covered |
| API07 `verifyLogin` valid | AC-03.3 | covered |
| API08 `verifyLogin` missing parameter | AC-14.3 | covered |
| API09 `verifyLogin` DELETE | AC-14.2 | covered |
| API10 `verifyLogin` invalid | AC-04.3, AC-04.4 | covered |
| API11 `createAccount` | AC-01.4, AC-02.2, AC-14.4 | covered |
| API12 `deleteAccount` | AC-13.1, AC-13.2 | covered |
| API13 `updateAccount` | AC-22.1, AC-22.2 | covered |
| API14 `getUserDetailByEmail` | AC-01.5 | covered as part of registration |

## Redundant coverage

No tests exist yet, so nothing here is being *removed* — these are cases
where building the naive one-test-per-published-case suite would duplicate
coverage a cheaper layer (or an earlier journey) already proves. Naming
them now means they're never built in the first place.

Five outcomes are possible, and the Status column above is only readable if
you know which one applies:

| Outcome | What it means |
|---|---|
| **Folded** | The case sits entirely inside another test. No test of its own; the surviving test names the absorbed criteria in its `test.step()` titles. |
| **Bundled** | No test of its own, but extra assertions inside a sibling test that was being written anyway. |
| **Covered at another layer** | A cheaper layer proves it, so the e2e never exists. |
| **Redundant, never built** | Would duplicate another test outright. Listed so nobody writes it later. |
| **Demoted** | Keeps its test, loses `@smoke`, because its *core* is proven elsewhere and its remaining assertions aren't. |

Every row below was checked against the live site on 2026-09-16, so each
is a finding rather than an intention.

| Case | Already proven by | Outcome and action |
|---|---|---|
| TC01 (register user) | TC14 — runs the identical signup wizard mid-journey | **Folded.** The journey carries AC-01.1 to AC-01.3 as steps, so a broken wizard fails at a step named for the criterion |
| TC12's core (add to cart, row appears) | TC14 — starts by adding products while logged out | **Demoted** to `@regression` on Chromium. The cart test keeps AC-06.3, AC-06.4, AC-07.1 and AC-07.2, none of which the journey touches. Cost: those four lose Firefox, WebKit and mobile coverage |
| TC11 (subscribe on cart page) | TC10 (subscribe on home page) | **Redundant.** Confirmed: both pages render the same footer widget — the same `susbscribe_email` field, the same confirmation text. AC-19.2 records it, and one test covers both |
| TC15 (register-before-checkout) | TC14 + TC16 | **Redundant by composition.** Registration logs the visitor straight in (AC-01.3), and checkout for a logged-in visitor is TC16 (AC-10.2, AC-10.4). TC15 is those two criteria in sequence and proves nothing new |
| TC19 (view/cart brand products) | TC18 (navigation) + TC12 (add to cart) | **Split.** The navigation half is real and kept as AC-17.1. The add-to-cart half is redundant: the brand page's control is the same `a.add-to-cart[data-product-id]` element as the products page's, confirmed in markup |
| TC22 (add to cart from Recommended items) | TC12 (add products to cart) | **Redundant.** The recommended-items widget uses that identical control, so it gets one assertion (AC-06.5) inside the cart test rather than a journey of its own |

## Non-functional testing

| Requirement | Method | Tool | Threshold | Runs | Tag |
|---|---|---|---|---|---|
| NFR-01 Accessibility (key pages) | automated scan | `@axe-core/playwright` | zero critical/serious violations on home, products, cart, checkout | weekly schedule, read-only pages only | `@a11y` |
| Performance / load | not tested | — | — | — | — |
| Security (active scanning) | not tested | — | — | — | — |

Performance/load and active security testing are excluded on purpose:
automationexercise.com is a third-party site we don't own, and generating
load or running exploit attempts against it without authorization isn't
something this project does. This mirrors the isolation-not-evasion stance
[ADR 0001](../adr/0001-third-party-network-isolation.md) takes on
third-party blocking — we control what our own test environment does, we
don't act against systems we don't own.

NFR-01's threshold has never been measured against the live site; the first
`@a11y` run establishes whether the site meets it today.

## Test data and environments

One shared production environment, with accounts created and removed per
test. The environment constraint is in
[`test-strategy.md`](./test-strategy.md#environments-and-data), the
account strategy in
[ADR 0002](../adr/0002-test-account-strategy.md), and the data rules every
test follows in [`TESTING.md`](../../TESTING.md#test-data).

## Manual and untested

Manual doesn't mean forgotten: each check below has a trigger, an owner, a
timebox and a run log in [`manual-checks.md`](./manual-checks.md), and the
rule deciding what stays manual is in
[`test-strategy.md`](./test-strategy.md#what-we-dont-automate).

- TC07 (Test Cases page), TC25, TC26 (scroll behavior) — manual only
  (MC-01, MC-02): static content or cosmetic behavior with no business
  risk, and scroll assertions would flake across engines and devices.
- Ads, layout shift and the consent dialog (MC-03), and real mobile
  devices (MC-04) — invisible to the suite by design, since
  [ADR 0001](../adr/0001-third-party-network-isolation.md) blocks
  third-party requests and Playwright's device presets aren't real
  hardware.
- The Contact Us file upload — optional in the form, and the site never
  shows the file back, so there's nothing to assert beyond the same
  success message AC-20.3 already covers.
- Performance/load testing — not tested, third-party site, no authorization
  to generate load against it.
- Active security testing — not tested, third-party site, no authorization.
- Visual regression — not in initial scope; revisit if UI drift becomes a
  recurring problem once the suite is running.

## Risks

- **The site can change without notice** — no changelog, no versioning
  guarantee on either the UI or the 14-endpoint API. Mitigated by the
  nightly run, whose job is exactly this: our code is unchanged, so a new
  failure points at the site, and it opens a `site-drift` issue
  ([`test-strategy.md`](./test-strategy.md#detecting-site-drift)). The
  fix starts with re-verifying against the live site and updating
  `docs/criteria/`, never with editing the test until it passes.
- **The published case list is someone else's document** — the site can
  renumber or reword its test cases at any time. Nothing traces to those
  numbers except the Source case index, so a renumbering costs one table,
  not the suite.
- **Shared production data** — no isolation from other users of the public
  practice site. Mitigated by one generated account per test, deleted at
  teardown ([ADR 0002](../adr/0002-test-account-strategy.md)).
- **Third-party consent and ad scripts** — in some regions a consent
  dialog blocks every click outright; elsewhere ad requests add timing
  flake and console noise. Mitigated by
  [ADR 0001](../adr/0001-third-party-network-isolation.md)'s context-level
  blocking, which has to be in place before the first e2e test (see
  [`test-strategy.md`](./test-strategy.md#testability)).
- **No SLA or error budget** — we don't own uptime here. Mitigated only by
  treating an unavailable site as an environment failure
  ([`TESTING.md`](../../TESTING.md#flake-policy)).
