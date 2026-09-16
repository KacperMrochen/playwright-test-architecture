# FR-06 — Add products to the cart

The site adds a product to the cart, logged in or not, and keeps one row
per product with a running quantity and line total.

Site reference: TC12, TC13.

## Acceptance criteria

- AC-06.1 Given any visitor on `/products`, when "Add to cart" is clicked
  on a product, then a modal shows "Added!" and "Your product has been
  added to cart." with a "View Cart" link and a "Continue Shopping" button.
- AC-06.2 Given products were added, when `/view_cart` is opened, then each
  product appears as one row with its name, price, quantity and total.
- AC-06.3 Given a product already in the cart, when it is added again from
  `/products`, then its existing row's quantity goes up by 1 (no second
  row) and the row total equals price × quantity.
- AC-06.4 Given a product detail page (`/product_details/<id>`, quantity
  field defaults to 1), when the quantity is set to N and "Add to cart" is
  clicked, then the cart row for that product shows quantity N and a total
  of price × N.
- AC-06.5 Given any product listing — the products page, a category page,
  a brand page, or the "recommended items" widget on the home page — then
  its "Add to cart" control is the same one
  (`a.add-to-cart[data-product-id]`) and behaves the same way, so no
  listing needs its own add-to-cart test.
- AC-06.6 Given the cart, then a row's quantity is shown in a disabled
  control and can't be edited there. Quantity is only chosen before adding
  (AC-06.3, AC-06.4), so "change the quantity of something already in the
  cart" is not a behavior this site has.
