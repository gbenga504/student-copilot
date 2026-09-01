---
name: website-reusable-components
description: "Use when writing or editing React components/JSX/TSX in packages/website. Enforces using shared reusable components (Button, Input, Alert, etc.) from ~/components instead of raw HTML elements like <button> or <input>."
---

# Reusable Components First (website)

Always use the project's reusable components (`Button`, `Input`, `Alert`, etc.) from `~/components/...`. Do not use raw HTML elements (e.g. `<button>`, `<input>`) when a reusable equivalent exists.

Only introduce a custom one-off implementation when **no** reusable component covers that use case. If something is missing, prefer extending or adding a variant to the shared component over duplicating patterns inline.

```tsx
// ✅ Correct — use shared Button
<Button element="button" variant="text" size="small" type="button" onClick={...}>
  Preview
</Button>

// ❌ Avoid — raw button when Button exists
<button type="button" className="..." onClick={...}>Preview</button>
```

## Procedure

1. Before writing markup for interactive or common UI elements, check `~/components/` for an existing reusable component that covers the use case.
2. If one exists, use it — do not fall back to a raw HTML element.
3. If none exists, prefer extending the shared component (e.g. adding a new `variant`) over adding a one-off inline implementation.
