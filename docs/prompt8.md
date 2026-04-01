Continue the existing "Platita" project.

Now implement the Transactions feature for the MVP.

Transaction types:
- income
- expense
- transfer
- yield

Business rules:
- income increases account balance
- expense decreases account balance
- transfer moves money between accounts
- yield increases account balance but is financial return, not labor income
- transfer must not count as income or expense in summaries
- transfer must require different origin and destination accounts
- category is required for income, expense, and yield
- category is optional for transfer

Implement:
1. Transaction feature types
2. Transaction services
3. Transaction hooks
4. New Movement screen form
5. Movements list screen
6. Basic filtering by:
   - month
   - type
   - account
   - category

Use:
- React Hook Form + Zod
- repository layer already created
- Spanish UI

The "Nuevo movimiento" form must support:
- type selector
- amount
- category
- account (or from/to accounts for transfer)
- date
- note

Important:
- Keep the form UX simple
- Conditionally render fields based on transaction type
- Persist correctly in SQLite
- Movements screen should list saved transactions

Do not implement charts yet.
Expected output:
- movement creation working
- listing working
- filters working at a basic level