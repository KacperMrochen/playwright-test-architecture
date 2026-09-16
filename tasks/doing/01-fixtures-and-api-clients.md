# 01 — Fixtures and API clients

Depends on: —

The shared plumbing every other task builds on: third-party blocking, an
account per test with API teardown, HTTP login reused via cookies, and
typed API clients.

## Scope

- `fixtures/test-data.ts` — account factory (`pta-<timestamp>-<random>@example.com`),
  `account` fixture (create via API, delete in teardown, 404 tolerated,
  never fails the test), `signupData` fixture (data only, for registration
  tests, deleted in teardown), `loggedInPage` fixture (HTTP login →
  cookies → context), and a `context` override that blocks every host
  except the site and the font CDN.
- `api/` clients: `account.ts`, `auth.ts`, `products.ts`, `search.ts`,
  `brands.ts` — each returning the parsed body.

## Definition of done

- ADR 0001 blocking applies to every browser context without a spec
  asking for it.
- ADR 0002 account handling: one account per test, deleted at teardown.
- `npx playwright test --list` resolves the fixtures with no type errors.
