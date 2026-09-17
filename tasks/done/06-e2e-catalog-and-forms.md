# 06 — Catalog and form e2e

Depends on: 01

## Scope

- `tests/e2e/catalog.spec.ts` — AC-15.1, AC-15.2, AC-15.4 (search),
  AC-16.1, AC-16.2 (category), AC-17.1 (brand), AC-18.1 (detail page)
- `tests/e2e/account.spec.ts` — AC-19.1, AC-19.2 (subscription, one test
  covering both pages)
- `tests/e2e/contact.spec.ts` — AC-20.1, AC-20.2, AC-20.3, handling the
  `confirm` dialog explicitly
- `tests/e2e/product-review.spec.ts` — AC-21.1

## Definition of done

- The contact test handles the dialog rather than stubbing `window.confirm`.
- All `@regression` on `e2e-chromium`.
