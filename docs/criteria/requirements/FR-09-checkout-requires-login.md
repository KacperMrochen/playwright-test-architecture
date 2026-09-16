# FR-09 — Checkout requires a logged-in user

The site doesn't let a logged-out visitor into checkout, and points them to
register or log in.

Site reference: TC14.

## Acceptance criteria

- AC-09.1 Given a logged-out visitor with products in the cart, when
  "Proceed To Checkout" is clicked, then a "Checkout" modal shows
  "Register / Login account to proceed on checkout." with a
  "Register / Login" link to `/login` and a "Continue On Cart" button, and
  the checkout page isn't opened.
