---
name: website-quality-checks
description: "Use after completing any frontend task in packages/website. Runs lint and TypeScript checks and requires fixing all errors introduced by the change before finishing."
---

# Post-task Quality Checks (website)

After completing any frontend task in `packages/website`, run linting and TypeScript checks before considering the task done.

## Procedure

1. Run `npm run lint` in `packages/website`.
2. Run `npm run typecheck` in `packages/website`.
3. Fix all lint and TypeScript errors introduced by your changes before finishing.
