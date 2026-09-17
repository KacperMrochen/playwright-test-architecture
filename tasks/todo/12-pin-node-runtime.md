# 12 — Pin the Node runtime, refresh the actions

Depends on: —

CI installs `lts/*`, so the runtime changes when the LTS line does —
without a PR, and possibly mid-nightly. Every run also warns that the
pinned actions still target the deprecated Node 20 runtime, which becomes
a setup failure once the runners drop it.

## Scope

- `.nvmrc` holding the Node major, and the setup action reading it with
  `node-version-file` instead of `node-version: lts/*`.
- `@types/node` moved to the matching major.
- `actions/checkout`, `actions/setup-node` and `actions/upload-artifact`
  raised to the current major, which removes the Node 20 deprecation
  warning.

## Definition of done

- No workflow names a Node version; `.nvmrc` is the only place it appears.
- A run's "Set up job" log shows the major from `.nvmrc`.
- No run carries the Node 20 deprecation annotation.
- `npm test` passes on the pinned runtime.
