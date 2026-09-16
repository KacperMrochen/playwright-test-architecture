# FR-15 — Search the catalog

The site returns products matching a search term, through the products
page and through `POST /api/searchProduct`.

Site reference: TC09, API05.

## Acceptance criteria

- AC-15.1 Given the `/products` page, when a term is submitted in the
  search box, then the page shows the heading "Searched Products", the URL
  carries the term as `?search=<term>`, and at least one product is listed.
- AC-15.2 Given a search for a term that matches products by name, when
  the results are listed, then every product whose name contains the term
  appears. Results are *not* limited to name matches — searching `top`
  also returns products such as "Colour Blocked Shirt – Sky Blue" — so a
  test asserts that known matches are present, never that every result's
  name contains the term.
- AC-15.3 Given a search term, when `POST /api/searchProduct` is sent with
  `search_product`, then `responseCode` is 200 and `products` holds
  matching products in the same shape as
  [AC-12.1](FR-12-product-catalog-api.md).
- AC-15.4 Given a term matching nothing, when it is searched on
  `/products`, then the "Searched Products" heading still appears and no
  products are listed. The site shows no "no results" message.
- AC-15.5 Given a term matching nothing, when `POST /api/searchProduct` is
  sent with it, then `responseCode` is 200 and `products` is an empty
  array — not a 404.
