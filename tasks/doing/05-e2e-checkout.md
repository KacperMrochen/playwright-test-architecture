# 05 — Checkout e2e

Depends on: 01, 04

The suite's widest journey plus the checkout details around it.

## Scope

`tests/e2e/checkout.spec.ts` with `pages/CheckoutPage.ts`:

- "registers and places an order" (`@smoke`) — one test, one
  `test.step()` per criterion: AC-09.1 → AC-01.1 → AC-01.2 → AC-01.3 →
  AC-08.2 → AC-10.1 → AC-10.3 → AC-10.7 → AC-10.5 → AC-10.6
- AC-10.2 checkout shows the registered address (API-seeded account)
- AC-10.4 the payment form requires every card field
- AC-11.1 invoice downloads as `invoice.txt`

## Definition of done

- The journey passes on all five e2e projects.
- Step titles name their criterion, so a failure points at one.
