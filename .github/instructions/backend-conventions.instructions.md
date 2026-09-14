---
applyTo: "packages/core-backend-api/src/**/*.ts"
description: "Use when writing or changing TypeScript code in the core backend API."
---

# Backend Conventions

## Function Parameters

When a function would take more than two total parameters, keep the identity
argument separate and group every remaining input in a typed `params` object.

Use `method(userId, params)`, where `params` contains fields such as `noteId`,
`title`, `content`, or `chunks`. Avoid long positional parameter lists.
