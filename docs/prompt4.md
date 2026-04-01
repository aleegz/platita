Continue the existing "Platita" project.

Now create the repository layer for SQLite access.

Rules:
- Repositories handle SQL only
- No business logic in repositories
- No UI code in repositories
- Keep functions small and explicit
- Use TypeScript types

Create:
- `src/database/repositories/account.repository.ts`
- `src/database/repositories/category.repository.ts`
- `src/database/repositories/transaction.repository.ts`
- `src/database/repositories/budget.repository.ts`
- `src/database/repositories/economicData.repository.ts`

Also create the required shared database/domain types under:
- `src/types/database.ts`
- `src/types/domain.ts`
- `src/types/dto.ts`

Repository responsibilities:

AccountRepository:
- create
- update
- list active
- get by id

CategoryRepository:
- create
- update
- list by type
- list active
- get by id

TransactionRepository:
- create
- get by id
- list by month
- list with filters
- list by account
- sum by type and month
- sum transfer in/out by account

BudgetRepository:
- upsert monthly budget
- get budgets by month/year
- get budget by category/month/year

EconomicDataRepository:
- upsert monthly economic data
- get by month/year
- list periods

Do not yet create feature services.
Do not yet create UI screens for CRUD.
Expected output:
- repositories ready
- typed return values
- project still compiles