# FR-08 — The cart belongs to the account, not the browser

The site stores a logged-in user's cart on the server against the account,
and merges a logged-out visitor's cart into it on login.

Site reference: TC20.

## Acceptance criteria

- AC-08.1 Given an account with products in its cart from one browser
  session, when the account logs in from a separate browser session, then
  `/view_cart` in the new session shows the same products and quantities.
- AC-08.2 Given a logged-out visitor who added products to the cart, when
  they log in, then those products are added to the account's existing
  cart. A product already in the account's cart gets the two quantities
  added together, not a second row.

This is also a test-isolation constraint: two tests logged in as the same
account share one cart, so every test that touches the cart needs its own
account.
