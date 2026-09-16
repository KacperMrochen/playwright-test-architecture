# 04 — Cart e2e

Depends on: 01

## Scope

`tests/e2e/cart.spec.ts` with `pages/ProductsPage.ts`,
`pages/ProductDetailPage.ts`, `pages/CartPage.ts`:

- AC-06.1 add-to-cart modal, AC-06.2 cart rows
- AC-06.3 quantity increments, AC-06.4 quantity from the detail page
- AC-06.5 every listing shares one add-to-cart control
- AC-06.6 quantity can't be edited in the cart
- AC-07.1 remove a row, AC-07.2 empty-cart message
- AC-08.1 the account's cart in a second browser session

## Definition of done

- All `@regression` on `e2e-chromium`.
- AC-08.1 uses a second context, not a second test.
