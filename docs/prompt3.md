Continue the existing "Platita" project.

Now implement the SQLite schema for the MVP.

Use these tables:
- accounts
- categories
- transactions
- monthly_budgets
- economic_data

Rules:
- Money must be stored as INTEGER in cents
- Dates stored as ISO strings
- Inflation stored as basis points
- Dollar stored as integer cents
- Use SQL explicitly
- Create indexes where appropriate
- Seed default categories

Implement this inside:
- `src/database/schema/tables.ts`
- `src/database/schema/indexes.ts`
- `src/database/schema/migrations.ts`
- `src/database/seeds/defaultCategories.ts`

Schema requirements:

accounts:
- id TEXT PRIMARY KEY
- name TEXT NOT NULL
- type TEXT CHECK in ('cash','bank','wallet','investment')
- initial_balance INTEGER NOT NULL DEFAULT 0
- active INTEGER NOT NULL DEFAULT 1
- created_at TEXT NOT NULL
- updated_at TEXT NOT NULL

categories:
- id TEXT PRIMARY KEY
- name TEXT NOT NULL
- type TEXT CHECK in ('income','expense','yield')
- active INTEGER NOT NULL DEFAULT 1
- created_at TEXT NOT NULL
- updated_at TEXT NOT NULL
- UNIQUE(name, type)

transactions:
- id TEXT PRIMARY KEY
- type TEXT CHECK in ('income','expense','transfer','yield')
- amount INTEGER NOT NULL CHECK amount > 0
- date TEXT NOT NULL
- account_id TEXT NULL
- from_account_id TEXT NULL
- to_account_id TEXT NULL
- category_id TEXT NULL
- note TEXT NULL
- created_at TEXT NOT NULL
- updated_at TEXT NOT NULL

monthly_budgets:
- id TEXT PRIMARY KEY
- category_id TEXT NOT NULL
- month INTEGER NOT NULL
- year INTEGER NOT NULL
- budget_amount INTEGER NOT NULL DEFAULT 0
- created_at TEXT NOT NULL
- updated_at TEXT NOT NULL
- UNIQUE(category_id, month, year)

economic_data:
- id TEXT PRIMARY KEY
- month INTEGER NOT NULL
- year INTEGER NOT NULL
- dollar_official INTEGER NOT NULL
- inflation_monthly_basis_points INTEGER NOT NULL
- created_at TEXT NOT NULL
- updated_at TEXT NOT NULL
- UNIQUE(month, year)

Seed initial categories:
Income:
- Sueldo
- Ingreso extra

Expense:
- Comida
- Transporte
- Alquiler
- Servicios
- Salud
- Ocio
- Educación
- Impuestos

Yield:
- Rendimientos

Expected output:
- tables created
- indexes created
- seed inserted safely
- migration/bootstrap wired correctly
- app still compiles