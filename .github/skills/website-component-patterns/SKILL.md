---
name: website-component-patterns
description: "Use when writing or editing React/TypeScript component code in packages/website. Covers colors reference, classNames formatting for long class lists, render functions instead of JSX comments, meaningful array callback variable names, switch-case brace/spacing rules, and named functions in useEffect."
---

# Component Patterns (website)

## Colors

For guidelines on colors (primary, text, borders, etc.), refer to `packages/website/README.md`.

## Keep classnames readable; use the classNames library for long lists

Avoid long, single-line `className` strings. Use the `classNames` library and break conditional or multi-part class lists into multiple lines for readability.

```tsx
// ✅ Correct
className={classNames(
  "flex items-center gap-2 rounded-lg px-4 py-2",
  {
     "bg-primary text-white": isActive,
     "opacity-50 cursor-not-allowed": isDisabled
  }
)}

// ❌ Avoid
className="flex items-center gap-2 rounded-lg px-4 py-2 bg-primary text-white opacity-50 cursor-not-allowed"
```

## Use render functions instead of inline JSX comments

When a component's `return` block contains distinct logical sections, extract each section into a named `renderXxx` function inside the component body rather than labelling blocks with `{/* Comment */}`. The function name replaces the comment — no additional comments are needed.

```tsx
// ✅ Correct
const renderStickyHeader = () => (
  <div className="sticky top-0 bg-white">...</div>
);

const renderEmptyState = () => <div>No items yet</div>;

return (
  <div>
    {renderStickyHeader()}
    {renderEmptyState()}
  </div>
);

// ❌ Avoid
return (
  <div>
    {/* Sticky header */}
    <div className="sticky top-0 bg-white">...</div>

    {/* Empty state */}
    <div>No items yet</div>
  </div>
);
```

Apply this pattern consistently when building or editing any component that has more than one logical section in its render output.

**Render helpers must live inside the component.** Define `renderXxx` (and any similar render helpers) in the component body only. Never place a render method outside the component (e.g. at module scope or in another file) — it should always be a function declared inside the component so it closes over that component's props and state.

## Use meaningful variable names in array callbacks

When mapping, filtering, or reducing over arrays, the callback parameter must be a descriptive name that reflects the item's type or role, not a single-letter abbreviation.

```ts
// ✅ Correct
orders.map((order) => order.id);
users.filter((user) => user.isActive);
assets.map((existingAsset) =>
  existingAsset.localId === id
    ? { ...existingAsset, status: "done" }
    : existingAsset,
);

// ❌ Avoid
orders.map((o) => o.id);
users.filter((u) => u.isActive);
assets.map((a) => (a.localId === id ? { ...a, status: "done" } : a));
```

This applies to all array methods (`map`, `filter`, `reduce`, `find`, `forEach`, `some`, `every`).

## Always wrap switch case bodies in curly braces with an empty line between cases

Every `case` (including `default`) must wrap its body in `{ }`, and there must be an empty line before each subsequent `case` or `default` clause.

```ts
// ✅ Correct
switch (status) {
  case "active": {
    return "Active";
  }

  case "inactive": {
    return "Inactive";
  }

  default: {
    return status;
  }
}

// ❌ Avoid
switch (status) {
  case "active":
    return "Active";
  case "inactive":
    return "Inactive";
  default:
    return status;
}
```

## Always use named functions in useEffect calls

The function name documents the effect's purpose and makes stack traces easier to read. Never pass an anonymous arrow function as the first argument.

```tsx
// ✅ Correct
useEffect(
  function fetchUserImages() {
    // ...
  },
  [userId],
);

useEffect(function subscribeToCheckoutSession() {
  // ...
}, []);

// ❌ Avoid
useEffect(() => {
  // ...
}, [userId]);
```
