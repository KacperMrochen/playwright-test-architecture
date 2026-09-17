# 07 — Accessibility scan (NFR-01)

Depends on: 01

## Scope

- Install `@axe-core/playwright` (deliberately not installed until now).
- `tests/e2e/a11y.spec.ts` — scan home, products, cart and checkout,
  tagged `@a11y`, asserting zero `critical` or `serious` violations.
- `--grep-invert=@a11y` on the `test` and `test:regression:pr` scripts, so
  the scans stay out of the nightly and the merge gate
  ([test-strategy.md#pipeline](../../docs/testing/test-strategy.md#pipeline)).
  `e2e-chromium` has no tag filter, so without this the scan gates every
  merge on the site's accessibility.

## Definition of done

- Runs in the weekly job via `npm run test:a11y`.
- `npm run test:regression:pr -- --list` and `npm test -- --list` name no
  `@a11y` test, and `npm run test:a11y -- --list` names all of them.
- The weekly workflow has been dispatched by hand once and its result
  recorded — a scheduled job nobody has ever watched run isn't trusted.
- If the live site fails the threshold, record the actual violations and
  update NFR-01 in `docs/criteria/README.md` rather than weakening the
  assertion silently — the threshold has never been measured.
