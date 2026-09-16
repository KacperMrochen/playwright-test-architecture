# FR-07 — Remove a product from the cart

The site removes a product's row from the cart on request.

Site reference: TC17.

## Acceptance criteria

- AC-07.1 Given a cart with several products, when the delete control on
  one row is clicked, then that row disappears without a page navigation
  and the other rows remain.
- AC-07.2 Given a visitor whose cart has no products, when `/view_cart` is
  opened, then it shows "Cart is empty! Click here to buy products."
