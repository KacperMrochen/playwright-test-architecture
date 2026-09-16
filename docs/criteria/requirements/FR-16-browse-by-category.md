# FR-16 — Browse products by category

The site filters the catalog to one category when a category is chosen
from the sidebar.

Site reference: TC18.

## Acceptance criteria

- AC-16.1 Given any catalog page, then the left sidebar offers the
  "Women", "Men" and "Kids" panels, each expanding to its categories.
- AC-16.2 Given an expanded panel, when a category is chosen, then the URL
  becomes `/category_products/<id>`, the heading reads
  "<Usertype> - <Category> Products" (for example "Women - Dress
  Products"), and at least one product is listed.
