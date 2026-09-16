# FR-22 — Update an account through the API

The site updates a registered account's details from
`PUT /api/updateAccount`.

Site reference: API13.

## Acceptance criteria

- AC-22.1 Given a registered account, when `PUT /api/updateAccount` is
  sent with its email, password and new field values, then the body is
  `{"responseCode": 200, "message": "User updated!"}` and a following
  `getUserDetailByEmail` returns the new values.
- AC-22.2 Given an unregistered email, when `PUT /api/updateAccount` is
  sent with it, then the body is
  `{"responseCode": 404, "message": "Account not found!"}`.
- AC-22.3 Given a registered account, when `PUT /api/updateAccount` is
  sent with a wrong password, then the response is identical to AC-22.2
  and nothing is changed — the same "not found" answer the delete endpoint
  gives ([AC-13.3](FR-13-delete-account-api.md)), and the same refusal to
  distinguish a wrong password from a missing account that the login
  endpoint makes ([AC-04.3](FR-04-invalid-login-rejected.md)).
