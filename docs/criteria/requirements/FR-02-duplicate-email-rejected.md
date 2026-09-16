# FR-02 — Registration rejects an email already in use

The site refuses to start or create an account when the email already
belongs to an existing account.

Site reference: TC05, API11.

## Acceptance criteria

- AC-02.1 Given an existing account, when its email is submitted under
  "New User Signup!", then the Signup / Login page is shown again with
  "Email Address already exist!" in the signup form, and the account
  information form isn't shown.
- AC-02.2 Given an existing account, when `POST /api/createAccount` is sent
  with its email, then the body is
  `{"responseCode": 400, "message": "Email already exists!"}`.
