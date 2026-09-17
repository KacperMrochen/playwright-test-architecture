# 11 — Static checks as a required job

Depends on: —

`TESTING.md` lists rules that nothing turns red:
[What enforces these rules](../../TESTING.md#what-enforces-these-rules)
now names the job below for the mechanical ones. Playwright strips
TypeScript types without checking them, so a type error in a spec, a page
object or an API client reaches `main` on a green suite today.

## Scope

- `tsconfig.json` — strict, no emit, covering `tests/`, `pages/`, `api/`,
  `fixtures/` and `playwright.config.ts`.
- ESLint with `eslint-plugin-playwright` and `typescript-eslint`:
  `no-wait-for-timeout`, `no-focused-test`, `no-skipped-test`,
  `no-force-option`, `expect-expect`, `missing-playwright-await`, plus a
  restricted-import rule keeping `expect` out of `pages/` and `api/`.
- `npm run check` — `tsc --noEmit` then `eslint .`, one command locally and
  in CI.
- A `Static checks` job in `.github/workflows/pull-request.yml`: Node and
  `npm ci`, no browser install, gated by the existing `changes` job so a
  docs-only PR reports it as skipped.
- `Static checks` added to `main`'s "Protect main" ruleset, so it is
  required alongside `Pre-merge regression`.

## Definition of done

- Each of these fails the job, checked by trying it: a type error in a
  spec, `await page.waitForTimeout(1)`, an `expect` in a page object.
- The current tree passes `npm run check` unchanged — if it doesn't, the
  failure is a finding to fix, not a rule to weaken.
- The job runs and reports on a draft PR, where `Pre-merge regression`
  doesn't.
- A docs-only PR reports `Static checks` as skipped, not pending.
- `gh api repos/:owner/:repo/rules/branches/main` lists both required
  checks.
