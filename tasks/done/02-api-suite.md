# 02 — API suite

Depends on: 01

Covers every `integration` row in the coverage map.

## Scope

| File | Criteria |
|---|---|
| `tests/api/products.spec.ts` | AC-12.1, AC-14.1 |
| `tests/api/search.spec.ts` | AC-15.3, AC-15.5, AC-14.6, AC-14.7 |
| `tests/api/brands.spec.ts` | AC-17.2, AC-14.5 |
| `tests/api/auth.spec.ts` | AC-03.3, AC-04.3, AC-04.4, AC-14.2, AC-14.3 |
| `tests/api/account.spec.ts` | AC-01.4, AC-01.5, AC-01.6, AC-02.2, AC-13.1, AC-13.2, AC-13.3, AC-14.4, AC-22.1, AC-22.2, AC-22.3 |

## Definition of done

- Every test asserts `responseCode` from the body, not only HTTP status.
- `AC-01.4`, `AC-03.3` and `AC-12.1` carry `@smoke`; the rest
  `@regression`.
- `npm test -- --project=api` passes, repeated 5×.
