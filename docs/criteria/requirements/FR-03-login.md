# FR-03 — Log in with valid credentials

The site authenticates a registered account when the email and password
match.

Site reference: TC02, API07.

## Acceptance criteria

- AC-03.1 Given a registered account, when its email and password are
  submitted under "Login to your account", then the home page shows
  "Logged in as <name>", and the navigation shows "Logout" and
  "Delete Account" instead of "Signup / Login".
- AC-03.2 Given an account created through `POST /api/createAccount`, when
  its credentials are submitted in the login form, then the visitor is
  logged in as that account's name.
- AC-03.3 Given a registered account, when `POST /api/verifyLogin` is sent
  with its email and password, then the body is
  `{"responseCode": 200, "message": "User exists!"}`. The response sets no
  session cookie, so it confirms credentials without logging anyone in.
