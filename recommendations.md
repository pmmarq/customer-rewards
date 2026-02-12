# Frontend Review Recommendations

## Summary
This app is a single-page React UI with tabbed sections (Rewards, Analytics, Admin). Data is fetched from a mocked API, stored in component state, and derived computations are performed in components and utility functions. Styling is Tailwind-based with a small amount of custom CSS. Tests are mostly component/unit-level via React Testing Library.

## Code Smells / Bad Patterns
- Date parsing relies on `new Date("YYYY-MM-DD")` combined with `toLocaleDateString` / `toLocaleString`, which can shift dates or months in non-UTC time zones. This can mis-bucket transactions at month boundaries and display the wrong day. Files: `/Users/imouthesmp/projects/customer_awards_charter/src/components/MonthlyBreakdown.js`, `/Users/imouthesmp/projects/customer_awards_charter/src/components/Admin.js`, `/Users/imouthesmp/projects/customer_awards_charter/src/components/RewardsSummary.js`, `/Users/imouthesmp/projects/customer_awards_charter/src/utils/computeAnalytics.js`.
- `CustomerCombobox` can hit modulo-by-zero when there are no options (`itemCount === 0`), resulting in `NaN` for `highlightedIndex` and undefined behavior. File: `/Users/imouthesmp/projects/customer_awards_charter/src/components/CustomerCombobox.js`.
- Interactive elements are not consistently keyboard accessible. `CustomerRewards` uses `role="button"` without handling `Enter`/`Space`, and `SortableTable` headers are clickable `<th>` elements without a focusable control. Files: `/Users/imouthesmp/projects/customer_awards_charter/src/components/CustomerRewards.js`, `/Users/imouthesmp/projects/customer_awards_charter/src/components/SortableTable.js`.
- Sorting logic applies a “last word” heuristic to all string columns, which is incorrect for non-name strings (months, labels) and is not configurable per column. File: `/Users/imouthesmp/projects/customer_awards_charter/src/components/SortableTable.js`.
- `SortableTable` sets the default sort key to a column (`sortKey`) that is not rendered, so `aria-sort` never reflects the active sort. File: `/Users/imouthesmp/projects/customer_awards_charter/src/components/Analytics.js`.
- The label “Highest Spender” is derived from total points, not total spent, so the metric name is misleading. Files: `/Users/imouthesmp/projects/customer_awards_charter/src/components/Analytics.js`, `/Users/imouthesmp/projects/customer_awards_charter/src/utils/computeAnalytics.js`.
- Customer identity is inferred by name matching in the Admin flow, which breaks if names are duplicated or edited. Files: `/Users/imouthesmp/projects/customer_awards_charter/src/components/Admin.js`, `/Users/imouthesmp/projects/customer_awards_charter/src/components/CustomerCombobox.js`.
- Transactions are embedded directly in the JS bundle, which inflates initial bundle size and makes the data layer harder to evolve. File: `/Users/imouthesmp/projects/customer_awards_charter/src/data/transactions.js`.
- `React.memo` is applied broadly, but props like `columns` are re-created on each render, so memoization doesn’t help and adds complexity. File: `/Users/imouthesmp/projects/customer_awards_charter/src/components/Analytics.js`.
- Custom `.animate-spin` overrides Tailwind’s built-in utility, which can surprise other contributors and future refactors. File: `/Users/imouthesmp/projects/customer_awards_charter/src/App.css`.
- The toolchain mixes React 19 with `react-scripts@5`, which is a known compatibility risk for CRA-based apps. File: `/Users/imouthesmp/projects/customer_awards_charter/package.json`.

## Improvements / Recommendations
- Normalize date handling. Treat transaction dates as UTC (or as explicit local dates) and format with `Intl.DateTimeFormat` using a fixed `timeZone`. Use a stable month key like `YYYY-MM` for grouping and sorting, and map to display labels at render time.
- Guard `CustomerCombobox` keyboard navigation for empty lists (`itemCount === 0`), and implement a proper `aria-activedescendant` pattern with option `id`s for accessible combobox behavior.
- Replace `role="button"` containers with actual `<button>` elements or add key handlers for `Enter` and `Space`. For sortable headers, render a `<button>` inside `<th>` with `aria-sort` on the column and focus styles.
- Make sorting configurable per column via `sortAccessor` or `sortFn`. Avoid last-name heuristics unless a column explicitly opts in.
- Align analytics semantics. If the UI says “Highest Spender,” compute it by `totalSpent`; otherwise rename the label to “Top Points Earner.”
- Centralize transaction derivations. Precompute `points`, month keys, and normalized customer data once (e.g., in a selector or a data hook) and pass down consistent data to UI components.
- Persist manual transactions (localStorage or API). Consider a lightweight data layer (React Query / SWR) that handles caching, retries, and invalidation.
- Replace embedded transaction data with JSON fetched from `public/` or an API endpoint to reduce bundle size and enable future pagination.
- Reduce unnecessary memoization and stabilize props passed to memoized components with `useMemo` where it actually affects re-renders.
- Avoid global utility name collisions. Rename `.animate-spin` or move custom animation into Tailwind’s config under a unique class.
- Address toolchain risk. Either align React to a CRA-supported version or migrate to a modern bundler (Vite/Next) for React 19 support and faster builds.
- Add a `lint` script and consider a formatter (Prettier) so style consistency and accessibility rules are enforced at CI time. File: `/Users/imouthesmp/projects/customer_awards_charter/package.json`.

## Suggested Next Steps
1. Fix date handling and month grouping (highest impact correctness issue).
2. Address accessibility gaps in combobox and sortable table.
3. Align analytics semantics and sorting behavior.
4. Decide on a data layer approach and persistence strategy for manual transactions.
5. Plan the bundler/version alignment (CRA vs. Vite/Next).
