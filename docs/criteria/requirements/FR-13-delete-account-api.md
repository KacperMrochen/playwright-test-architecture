# FR-13 — Delete an account through the API

The site deletes an account when `DELETE /api/deleteAccount` is sent with
its email and password.

Site reference: API12.

## Acceptance criteria

- AC-13.1 Given an existing account, when `DELETE /api/deleteAccount` is
  sent with its email and password, then the body is
  `{"responseCode": 200, "message": "Account deleted!"}`, and a following
  `POST /api/verifyLogin` with the same credentials returns
  `responseCode` 404.
- AC-13.2 Given an unregistered email, when `DELETE /api/deleteAccount` is
  sent with it, then the body is
  `{"responseCode": 404, "message": "Account not found!"}`.
- AC-13.3 Given a registered account, when `DELETE /api/deleteAccount` is
  sent with a wrong password, then the response is identical to AC-13.2
  and the account still exists. A wrong password is reported as "not
  found", so a failed cleanup can't be told apart from an already-deleted
  account by its response alone.
