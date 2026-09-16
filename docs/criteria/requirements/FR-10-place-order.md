# FR-10 — Place an order

The site lets a logged-in user with products in the cart review the order
against their account details, pay, and get an order confirmation.

Site reference: TC14, TC16, TC23.

## Acceptance criteria

- AC-10.1 Given a logged-in user with products in the cart, when
  "Proceed To Checkout" is clicked, then `/checkout` shows
  "Address Details" and "Review Your Order".
- AC-10.2 Given the checkout page, then "Your delivery address" and
  "Your billing address" both show the account's registered details:
  title with first and last name, company, address lines, city, state and
  zipcode, country, and mobile number. This holds for accounts registered
  through the UI and through the API.
- AC-10.3 Given the checkout page, then "Review Your Order" lists every
  cart product with its price, quantity and line total, followed by a
  "Total Amount" equal to the sum of the line totals.
- AC-10.4 Given the checkout page, when "Place Order" is clicked, then
  `/payment` shows the card form (name on card, card number, CVC,
  expiration month, expiration year), with every field required.
- AC-10.5 Given a filled payment form, when "Pay and Confirm Order" is
  submitted, then the page shows "Order Placed!" and "Congratulations!
  Your order has been confirmed!". The order total is asserted through the
  invoice (AC-11.1) rather than through the confirmation URL, which is a
  routing detail.
- AC-10.6 Given an order was just placed, when `/view_cart` is opened, then
  the cart is empty.
- AC-10.7 Given the checkout page, then a comment field is offered
  (`textarea[name="message"]`), and an order can be placed with or without
  it. The comment isn't shown back anywhere afterwards.
