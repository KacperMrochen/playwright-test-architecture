# FR-12 — List the product catalog through the API

The site returns its full product catalog from `GET /api/productsList`.

Site reference: API01.

## Acceptance criteria

- AC-12.1 Given the live catalog, when `GET /api/productsList` is sent,
  then `responseCode` is 200 and `products` is a non-empty array in which
  every product has a numeric `id`, a `name`, a `price` formatted
  `Rs. <number>`, a `brand`, and a `category` with `category` and
  `usertype.usertype`.

The response body is JSON but is served as `Content-Type: text/html`.
Tests parse the body instead of relying on the header.
