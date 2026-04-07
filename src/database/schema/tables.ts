export const createAccountsTableStatement = `
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'wallet', 'investment', 'credit')),
    initial_balance INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

export const createCategoriesTableStatement = `
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'yield')),
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(name, type)
  );
`;

export const createTransactionsTableStatement = `
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'yield')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    date TEXT NOT NULL,
    account_id TEXT,
    from_account_id TEXT,
    to_account_id TEXT,
    category_id TEXT,
    note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );
`;

export const createMonthlyBudgetsTableStatement = `
  CREATE TABLE IF NOT EXISTS monthly_budgets (
    id TEXT PRIMARY KEY NOT NULL,
    category_id TEXT NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    budget_amount INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(category_id, month, year),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );
`;

export const createEconomicDataTableStatement = `
  CREATE TABLE IF NOT EXISTS economic_data (
    id TEXT PRIMARY KEY NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    dollar_official INTEGER NOT NULL,
    inflation_monthly_basis_points INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(month, year)
  );
`;

export const createUserProfileTableStatement = `
  CREATE TABLE IF NOT EXISTS user_profile (
    id TEXT PRIMARY KEY NOT NULL,
    display_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

export const createTableStatements = [
  createAccountsTableStatement,
  createCategoriesTableStatement,
  createTransactionsTableStatement,
  createMonthlyBudgetsTableStatement,
  createEconomicDataTableStatement,
  createUserProfileTableStatement,
] as const;