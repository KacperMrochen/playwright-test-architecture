# FR-17 — Browse products by brand

The site filters the catalog to one brand, and lists its brands through
`GET /api/brandsList`.

Site reference: TC19, API03.

## Acceptance criteria

- AC-17.1 Given any catalog page, then the sidebar lists brands with a
  product count each, and choosing one opens `/brand_products/<brand>`
  with the heading "Brand - <Brand> Products" and at least one product.
- AC-17.2 Given the live catalog, when `GET /api/brandsList` is sent, then
  `responseCode` is 200 and `brands` is a non-empty array of `{id, brand}`.
  Brand names repeat across ids (`Madame` appears under several), so a
  test must not assume the names are unique.
