Continue the existing "Platita" project without breaking current structure.

Now implement SQLite setup using `expo-sqlite`.

Rules:
- SQLite is the single source of truth
- Do not add ORM
- Use simple SQL-based setup
- Keep code modular
- Do not create tables inline inside screens
- Do not implement repositories yet beyond what is necessary for bootstrap

Tasks:
1. Create the SQLite client setup inside:
   - `src/database/client/sqlite.ts`
   - `src/database/client/provider.tsx`
2. Add a database initialization flow
3. Prepare a migration/bootstrap entry point in:
   - `src/database/schema/migrations.ts`
4. Make the app initialize the database on startup
5. Ensure the app still runs even before business features exist

Technical constraints:
- Use async-safe initialization
- Keep database access encapsulated
- Do not create all tables yet if you want to separate bootstrap from schema creation, but prepare the structure for it

Expected output:
- SQLite configured
- database provider ready
- app startup initializes database layer
- code compiles