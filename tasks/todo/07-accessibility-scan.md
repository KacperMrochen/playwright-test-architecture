# 07 — Accessibility scan (NFR-01)

Depends on: 01

## Scope

- Install `@axe-core/playwright` (deliberately not installed until now).
- `tests/e2e/a11y.spec.ts` — scan home, products, cart and checkout,
  tagged `@a11y`, asserting zero `critical` or `serious` violations.

## Definition of done

- Runs in the weekly job via `npm run test:a11y`.
- If the live site fails the threshold, record the actual violations and
  update NFR-01 in `docs/criteria/README.md` rather than weakening the
  assertion silently — the threshold has never been measured.
