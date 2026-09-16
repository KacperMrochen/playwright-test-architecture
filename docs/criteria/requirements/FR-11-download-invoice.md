# FR-11 — Download the invoice for a placed order

The site offers a plain-text invoice for an order once it's placed.

Site reference: TC24.

## Acceptance criteria

- AC-11.1 Given the "Order Placed!" page, then a "Download Invoice" link
  points to `/download_invoice/<total amount>`, and that URL responds with
  a `text/plain` attachment named `invoice.txt` whose content is
  `Hi <first name> <last name>, Your total purchase amount is <total amount>. Thank you`.
