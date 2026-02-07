# Security & Code Quality Audit

Reviewed by: Senior Engineer (simulated review)
Scope: All source files in `src/`

---

## Summary

No critical vulnerabilities. The app uses React's built-in JSX escaping, has no backend, no auth, no user input, and no external data sources. The main findings are defensive coding gaps that would matter if this evolved toward real API integration.

**20 findings**: 0 Critical, 2 High, 5 Medium, 7 Low, 6 Info

---

## High Severity

### 1. No input validation on API response data

**Type:** Bad Practice / Data Integrity
**File:** `src/hooks/useTransactions.js:19-23`

The hook blindly trusts whatever `fetchTransactions()` returns and sets it directly into state. If this were a real API, a malformed or corrupted response would flow through the entire component tree unchecked.

```js
fetchTransactions()
  .then((data) => {
    if (!cancelled) {
      setTransactions(data); // no validation of shape or types
      setLoading(false);
    }
  })
```

**Fix:** Validate the response shape before calling `setTransactions`. For a real app, use a schema validation library (Zod, Yup) or at minimum check `Array.isArray(data)` and that each item has the expected fields.

---

### 2. No Error Boundary

**Type:** Bad Practice / Resilience
**File:** `src/App.js`

A single malformed transaction (e.g. `amount: undefined`) would throw in `calculatePoints`, crash the `useMemo` in `RewardsSummary`, and bring down the entire app with a white screen. There is no Error Boundary to catch render-time exceptions.

**Fix:** Wrap the main content area in a React Error Boundary component with a user-friendly fallback UI.

---

## Medium Severity

### 3. Missing keyboard event handler on expandable cards

**Type:** Accessibility
**File:** `src/components/CustomerRewards.js:15-20`

The customer header div has `role="button"` and `tabIndex={0}`, which makes it focusable. However, it only handles `onClick`. Keyboard users who press Enter or Space on the focused element will not trigger the expand/collapse action.

```js
<div
  className="..."
  onClick={toggle}
  role="button"
  tabIndex={0}
  // missing: onKeyDown handler for Enter/Space
>
```

**Fix:**
```js
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggle();
  }
}}
```

---

### 4. Missing `aria-expanded` on expandable sections

**Type:** Accessibility
**File:** `src/components/CustomerRewards.js:15-20`

Screen readers have no way to know whether a customer card is expanded or collapsed. The toggle button should communicate its state.

**Fix:** Add `aria-expanded={expanded}` to the clickable div.

---

### 5. Inline style object created on every render

**Type:** Performance
**File:** `src/components/CustomerRewards.js:29`

```js
style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
```

This creates a new object reference on every render, preventing shallow comparison optimizations. Minor in this app, but it's a common anti-pattern.

**Fix:** Use Tailwind's built-in rotation classes:
```js
className={`... transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`}
```

---

### 6. API service can never fail

**Type:** Bad Practice / Error Handling
**File:** `src/services/api.js:10-16`

```js
export function fetchTransactions() {
  return new Promise((resolve) => { // never rejects
    const delay = Math.random() * 3000;
    setTimeout(() => {
      resolve(transactions);
    }, delay);
  });
}
```

The error path in `useTransactions` is dead code — it can never be reached in practice. This means the error UI in `App.js` is untestable in a real integration context and the error handling pattern is unvalidated.

**Fix:** Consider adding a small random failure rate to the mock, or at minimum document that the error path is only exercised via unit tests with mocked rejections.

---

### 7. No loading timeout

**Type:** Bad Practice / UX
**File:** `src/hooks/useTransactions.js`

If this were a real API and the request hung indefinitely, the spinner would display forever with no timeout or retry mechanism.

**Fix:** Add a timeout that sets an error state after a reasonable period (e.g. 10 seconds), and optionally a retry button.

---

## Low Severity

### 8. No PropTypes on any component

**Type:** Code Quality
**Files:** All components in `src/components/`

None of the components declare PropTypes. This removes runtime type checking during development and makes the component API implicit rather than explicit. Since the project specifically avoids TypeScript, PropTypes are the standard alternative.

**Fix:** Add `prop-types` as a dependency and declare PropTypes for every component.

---

### 9. Missing `aria-live` on loading indicator

**Type:** Accessibility
**File:** `src/App.js:29`

The loading container has `role="status"` which is good, but lacks `aria-live="polite"` to announce the loading state change to screen readers.

---

### 10. Magic number in API delay

**Type:** Code Quality
**File:** `src/services/api.js:11`

```js
const delay = Math.random() * 3000;
```

The `3000` is an unexplained magic number.

**Fix:** Extract to a named constant: `const MAX_SIMULATED_DELAY_MS = 3000;`

---

### 11. `toLocaleString` date formatting is locale-dependent

**Type:** Code Quality / Portability
**Files:** `src/components/RewardsSummary.js:17-19`, `src/utils/computeAnalytics.js:48-50`

```js
new Date(date).toLocaleString('default', { month: 'long', year: 'numeric' })
```

The output varies by locale/runtime. In CI environments or international deployments, month names may differ, potentially breaking grouping logic or tests. Currently works because both `RewardsSummary` and `computeAnalytics` use the identical call, but it's a fragile coupling.

**Fix:** Use a deterministic formatter (e.g. `date-fns` `format()`) or pin the locale explicitly: `new Date(date).toLocaleString('en-US', ...)`.

---

### 12. Floating-point accumulation in `computeAnalytics`

**Type:** Code Quality / Math
**File:** `src/utils/computeAnalytics.js:24`

```js
const totalSpent = transactions.reduce((sum, txn) => sum + txn.amount, 0);
```

Repeated floating-point addition can accumulate rounding errors. For 30 transactions this is negligible, but with thousands of records, displayed dollar amounts could drift (e.g. `$445.0000000000001`).

**Fix:** The `.toFixed(2)` calls in the UI mask this, so it's cosmetic. For a production financial app, use integer cents or a decimal library.

---

### 13. `useTransactions` cleanup doesn't abort the underlying timer

**Type:** Code Quality
**File:** `src/hooks/useTransactions.js:31-33`

The cleanup sets `cancelled = true`, which correctly prevents state updates, but the `setTimeout` inside `api.js` still fires. In a real app with `fetch()`, you'd want an `AbortController`.

---

### 14. Month string used as React key

**Type:** Code Quality
**File:** `src/components/CustomerRewards.js:37`

```js
<MonthlyBreakdown key={month} .../>
```

Using a display string as a key is functional here because month names are unique per customer, but it's a fragile pattern. A composite key like `${customerId}-${month}` would be more robust.

---

## Info

### 15. No Content Security Policy

**File:** `public/index.html`

No CSP meta tag is configured. For a homework project this doesn't matter, but for deployment it's standard practice to add `Content-Security-Policy` headers.

---

### 16. Test coverage gaps

While coverage is good overall, the following are not tested:
- Malformed transaction data (missing fields, wrong types)
- Large datasets (performance regression)
- Accessibility violations (consider `jest-axe`)
- The error UI in `App.js` when the real API is used (only tested via mock rejection)

---

### 17. `react-scripts` 5.0.1 has known upstream vulnerabilities

**File:** `package.json`

CRA's `react-scripts` bundles many transitive dependencies. Running `npm audit` will likely show advisories. These are in dev/build tooling, not in the production bundle, but worth noting.

**Fix:** Run `npm audit` periodically. Consider migrating to Vite if starting fresh.

---

### 18. No `.env` or environment configuration

The app has no environment-specific configuration. If the mock API were replaced with a real one, the endpoint URL would need to come from environment variables, not be hardcoded.

---

### 19. `StatCard` is not exported or independently testable

**File:** `src/components/Analytics.js:4-11`

The `StatCard` helper is defined inside the Analytics module file but not exported. This is fine for a private helper, but it means it can only be tested indirectly through `Analytics`. If it grows in complexity, consider extracting it.

---

### 20. No `React.memo` on presentational components

**Files:** `MonthlyBreakdown.js`, `Navigation.js`, `StatCard` in `Analytics.js`

Pure presentational components that receive the same props on re-render could benefit from `React.memo` to skip unnecessary re-renders. Low impact in this app given the small data set, but good practice for larger lists.

---

## Dependency Summary

| Package | Version | Status |
|---------|---------|--------|
| react | 19.2.4 | Current |
| react-dom | 19.2.4 | Current |
| react-scripts | 5.0.1 | Maintained, has transitive audit warnings |
| tailwindcss | 3.4.x | Current |
| @testing-library/react | 16.3.2 | Current |
| @testing-library/user-event | 13.5.0 | Functional but v14 is latest |

No unnecessary production dependencies. Clean dependency tree.

---

## Verdict

The codebase is well-structured and follows React best practices. For a homework/demo project, the issues above are minor. If this were heading toward production with real API data, the top priorities would be:

1. Add input validation on API responses
2. Add an Error Boundary
3. Fix keyboard accessibility on expandable cards
4. Add PropTypes to all components
