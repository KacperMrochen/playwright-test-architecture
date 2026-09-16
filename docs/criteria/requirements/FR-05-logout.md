# FR-05 — Log out

The site ends the session when a logged-in user logs out.

Site reference: TC04.

## Acceptance criteria

- AC-05.1 Given a logged-in user, when "Logout" is clicked, then `/login`
  is shown, "Logged in as" no longer appears, and the navigation shows
  "Signup / Login" again.
- AC-05.2 Given two browser sessions logged in as the same account, when
  one logs out, then the other stays logged in — logout ends only the
  session that performed it. Sessions are independent, so a test that logs
  out can't disturb another test's session, but it also can't rely on
  logout to clear one.
