# FR-04 — Login rejects invalid credentials

The site refuses to authenticate when the password is wrong or the email
isn't registered, and gives the same answer in both cases.

Site reference: TC03, API10.

## Acceptance criteria

- AC-04.1 Given a registered account, when its email is submitted with a
  wrong password in the login form, then `/login` shows
  "Your email or password is incorrect!" and the visitor stays logged out.
- AC-04.2 Given an unregistered email, when it is submitted in the login
  form, then the message is identical to AC-04.1, so the page doesn't
  reveal whether the email exists.
- AC-04.3 Given a registered account, when `POST /api/verifyLogin` is sent
  with a wrong password, then the body is
  `{"responseCode": 404, "message": "User not found!"}`.
- AC-04.4 Given an unregistered email, when `POST /api/verifyLogin` is sent
  with it, then the body is identical to AC-04.3.
