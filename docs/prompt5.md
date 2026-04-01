Continue the existing "Platita" project.

Now create Zustand stores for global UI/app state.

Rules:
- Zustand is NOT the source of truth for financial data
- SQLite remains the source of truth
- Use Zustand only for UI state, filters, and selected period
- Keep stores small and explicit

Create:
- `src/store/app.store.ts`
- `src/store/filters.store.ts`
- `src/store/ui.store.ts`

Requirements:

app.store:
- selectedMonth
- selectedYear
- appLoaded
- actions to change month/year
- action to mark app as loaded

filters.store:
- transactionFilters
  - type
  - accountId
  - categoryId
- actions to set/reset filters

ui.store:
- loading flags
- snackbar/toast state
- modal/bottom-sheet state if useful
- actions to open/close/update UI state

Also:
- create any required store types
- keep API ergonomic for screens and hooks

Do not store persisted financial data here.
Do not add Redux.
Expected output:
- clean Zustand stores
- typed actions/selectors
- app still compiles