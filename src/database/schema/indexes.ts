export const createTransactionsDateIndexStatement = `
  CREATE INDEX IF NOT EXISTS idx_transactions_date
  ON transactions(date);
`;

export const createTransactionsAccountDateIndexStatement = `
  CREATE INDEX IF NOT EXISTS idx_transactions_account_date
  ON transactions(account_id, date);
`;

export const createTransactionsCategoryDateIndexStatement = `
  CREATE INDEX IF NOT EXISTS idx_transactions_category_date
  ON transactions(category_id, date);
`;

export const createTransactionsFromAccountDateIndexStatement = `
  CREATE INDEX IF NOT EXISTS idx_transactions_from_account_date
  ON transactions(from_account_id, date);
`;

export const createTransactionsToAccountDateIndexStatement = `
  CREATE INDEX IF NOT EXISTS idx_transactions_to_account_date
  ON transactions(to_account_id, date);
`;

export const createMonthlyBudgetsPeriodIndexStatement = `
  CREATE INDEX IF NOT EXISTS idx_monthly_budgets_period
  ON monthly_budgets(year, month);
`;

export const createEconomicDataPeriodIndexStatement = `
  CREATE INDEX IF NOT EXISTS idx_economic_data_period
  ON economic_data(year, month);
`;

export const createCategoriesTypeActiveIndexStatement = `
  CREATE INDEX IF NOT EXISTS idx_categories_type_active
  ON categories(type, active);
`;

export const createIndexStatements = [
  createTransactionsDateIndexStatement,
  createTransactionsAccountDateIndexStatement,
  createTransactionsCategoryDateIndexStatement,
  createTransactionsFromAccountDateIndexStatement,
  createTransactionsToAccountDateIndexStatement,
  createMonthlyBudgetsPeriodIndexStatement,
  createEconomicDataPeriodIndexStatement,
  createCategoriesTypeActiveIndexStatement,
] as const;

