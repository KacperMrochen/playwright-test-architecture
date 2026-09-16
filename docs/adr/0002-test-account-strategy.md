# 0002 — An account per test, created and deleted through the API

Status: proposed
Date: 2026-09-16
Supersedes: —

## Context

Most of what this suite tests needs a user account: logging in, the cart,
checkout, invoices. The target is a third-party production site shared with
everyone else using it, and the only data lifecycle it offers is
`POST /api/createAccount` and `DELETE /api/deleteAccount`. There's no
staging, no seed or reset endpoint, and no bulk cleanup.

Two facts, both verified against the live site on 2026-09-16, decide this:

- **The cart belongs to the account, on the server**
  ([FR-08](../criteria/requirements/FR-08-cart-belongs-to-account.md)). Two
  sessions logged in as one account share a cart, and a logged-out
  visitor's cart is merged in at login.
- **There are no auth tokens.** The site uses Django sessions; a
  `sessionid` cookie is issued by posting the login form, which works over
  plain HTTP without a browser. `POST /api/verifyLogin` only confirms
  credentials and issues nothing
  ([AC-03.3](../criteria/requirements/FR-03-login.md)).

The question was whether the suite should keep registering accounts as
often as it does, or reuse a known one.

## Options considered

### An account per test, created and deleted through the API

- Pro: tests are fully independent; no shared cart, so parallel workers and
  concurrent CI runs can't collide.
- Pro: no long-lived credentials, so no CI secrets, and forked pull
  requests can run the whole gate.
- Pro: nothing persists on the shared site — teardown deletes every account.
- Con: roughly three extra HTTP requests per test (create, log in, delete).
- Con: an interrupted run leaks accounts that can never be found again,
  because the site has no endpoint that lists them.

### One known account, credentials in CI secrets

- Pro: no registrations at all during a run.
- Pro: the smallest possible request volume against a site we don't own.
- Con: the shared cart makes it unusable for cart and checkout tests, which
  is most of what needs an account.
- Con: concurrent runs (two pull requests, or CI plus a local run) would
  corrupt each other's cart and produce failures that look like real bugs.
- Con: needs a repository secret and a local environment variable, plus a
  step that recreates the account when the site drops it; forked pull
  requests get neither.

### One account per worker, with the cart emptied between tests

- Pro: far fewer registrations than per-test, one per worker.
- Pro: safe within a worker, since its tests run one at a time.
- Con: needs `GET /delete_cart/<id>` called for each row before every test,
  which is setup that can itself fail or be forgotten.
- Con: tests stop being independent: one leaving unexpected state breaks
  the next, and the failure surfaces in the wrong test.
- Con: the saving is a few seconds per worker.

## Decision

We chose an account per test, created and deleted through the API. The
shared-cart behavior rules out any option where two tests can be logged in
as the same account, and the cost that made reuse attractive — accounts
piling up on a public site — doesn't exist once teardown deletes every
account it creates, including those a registration test made.

Sessions are still cheap: fixtures post the login form over HTTP and hand
the cookie to the browser via `storageState`, so only FR-03's own test
types into the login form.

## Consequences

- Positive: every test is independent, so parallelism is limited by
  runtime alone, and `fullyParallel` stays safe.
- Positive: the repository needs no secrets, and contributors can run the
  full suite with no setup.
- Positive: nothing is left behind on a site we don't own.
- Negative: a PR-gate run creates and deletes around 6 accounts, and a full
  regression run more. That's deliberate traffic against a third-party
  site, justified only because it's a practice site published for exactly
  this purpose.
- Negative: an interrupted run leaves accounts behind permanently. Emails
  carry a `pta-` prefix so a human can recognize them, but there's no way
  to enumerate or sweep them.
- Follow-up: the fixture in `fixtures/test-data.ts` owns creation, login
  and teardown; the rules it implements are in
  [`TESTING.md`](../../TESTING.md#test-data).
