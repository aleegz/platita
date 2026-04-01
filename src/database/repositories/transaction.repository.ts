import type {
  AggregateTotalRow,
  RepositoryDatabase,
  TransactionRow,
  TransferSummaryRow,
} from '../../types/database';
import {
  mapTransactionRow,
  mapTransferSummaryRow,
} from '../../types/database';
import type {
  AccountTransferSummary,
  Transaction,
} from '../../types/domain';
import type {
  CreateTransactionDTO,
  ListTransactionsByAccountDTO,
  ListTransactionsByMonthDTO,
  ListTransactionsFiltersDTO,
  SumTransactionsByTypeAndMonthDTO,
  SumTransferInOutByAccountDTO,
  UpdateTransactionDTO,
} from '../../types/dto';

const transactionSelectStatement = `
  SELECT
    id,
    type,
    amount,
    date,
    account_id,
    from_account_id,
    to_account_id,
    category_id,
    note,
    created_at,
    updated_at
  FROM transactions
`;

export type TransactionRepository = {
  create(input: CreateTransactionDTO): Promise<Transaction>;
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<Transaction | null>;
  listByMonth(input: ListTransactionsByMonthDTO): Promise<Transaction[]>;
  listWithFilters(input: ListTransactionsFiltersDTO): Promise<Transaction[]>;
  listByAccount(input: ListTransactionsByAccountDTO): Promise<Transaction[]>;
  sumByTypeAndMonth(input: SumTransactionsByTypeAndMonthDTO): Promise<number>;
  update(id: string, input: UpdateTransactionDTO): Promise<Transaction | null>;
  sumTransferInOutByAccount(
    input: SumTransferInOutByAccountDTO
  ): Promise<AccountTransferSummary>;
};

export function createTransactionRepository(
  database: RepositoryDatabase
): TransactionRepository {
  async function getById(id: string) {
    const row = await database.getFirstAsync<TransactionRow>(
      `${transactionSelectStatement} WHERE id = ?`,
      [id]
    );

    return row ? mapTransactionRow(row) : null;
  }

  async function create(input: CreateTransactionDTO) {
    await database.runAsync(
      `
        INSERT INTO transactions (
          id,
          type,
          amount,
          date,
          account_id,
          from_account_id,
          to_account_id,
          category_id,
          note,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.id,
        input.type,
        input.amount,
        input.date,
        input.accountId,
        input.fromAccountId,
        input.toAccountId,
        input.categoryId,
        input.note,
        input.createdAt,
        input.updatedAt,
      ]
    );

    const transaction = await getById(input.id);

    if (!transaction) {
      throw new Error(`Failed to load transaction ${input.id} after insert.`);
    }

    return transaction;
  }

  async function remove(id: string) {
    const result = await database.runAsync(
      `DELETE FROM transactions WHERE id = ?`,
      [id]
    );

    return result.changes > 0;
  }

  async function update(id: string, input: UpdateTransactionDTO) {
    const assignments: string[] = [];
    const parameters: Array<string | number | null> = [];

    if (input.type !== undefined) {
      assignments.push('type = ?');
      parameters.push(input.type);
    }

    if (input.amount !== undefined) {
      assignments.push('amount = ?');
      parameters.push(input.amount);
    }

    if (input.date !== undefined) {
      assignments.push('date = ?');
      parameters.push(input.date);
    }

    if (input.accountId !== undefined) {
      assignments.push('account_id = ?');
      parameters.push(input.accountId);
    }

    if (input.fromAccountId !== undefined) {
      assignments.push('from_account_id = ?');
      parameters.push(input.fromAccountId);
    }

    if (input.toAccountId !== undefined) {
      assignments.push('to_account_id = ?');
      parameters.push(input.toAccountId);
    }

    if (input.categoryId !== undefined) {
      assignments.push('category_id = ?');
      parameters.push(input.categoryId);
    }

    if (input.note !== undefined) {
      assignments.push('note = ?');
      parameters.push(input.note);
    }

    assignments.push('updated_at = ?');
    parameters.push(input.updatedAt);
    parameters.push(id);

    const result = await database.runAsync(
      `UPDATE transactions SET ${assignments.join(', ')} WHERE id = ?`,
      parameters
    );

    if (result.changes === 0) {
      return null;
    }

    return getById(id);
  }

  async function listByMonth(input: ListTransactionsByMonthDTO) {
    const { startDate, endDate } = getMonthDateRange(input.month, input.year);
    const rows = await database.getAllAsync<TransactionRow>(
      `
        ${transactionSelectStatement}
        WHERE date >= ? AND date < ?
        ORDER BY date DESC, created_at DESC, id DESC
      `,
      [startDate, endDate]
    );

    return rows.map(mapTransactionRow);
  }

  async function listWithFilters(input: ListTransactionsFiltersDTO) {
    const { whereClause, parameters } = buildTransactionFilterQuery(input);
    const rows = await database.getAllAsync<TransactionRow>(
      `
        ${transactionSelectStatement}
        ${whereClause}
        ORDER BY date DESC, created_at DESC, id DESC
      `,
      parameters
    );

    return rows.map(mapTransactionRow);
  }

  async function listByAccount(input: ListTransactionsByAccountDTO) {
    const rows = await database.getAllAsync<TransactionRow>(
      `
        ${transactionSelectStatement}
        WHERE account_id = ? OR from_account_id = ? OR to_account_id = ?
        ORDER BY date DESC, created_at DESC, id DESC
      `,
      [input.accountId, input.accountId, input.accountId]
    );

    return rows.map(mapTransactionRow);
  }

  async function sumByTypeAndMonth(input: SumTransactionsByTypeAndMonthDTO) {
    const { startDate, endDate } = getMonthDateRange(input.month, input.year);
    const row = await database.getFirstAsync<AggregateTotalRow>(
      `
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM transactions
        WHERE type = ? AND date >= ? AND date < ?
      `,
      [input.type, startDate, endDate]
    );

    return row?.total ?? 0;
  }

  async function sumTransferInOutByAccount(
    input: SumTransferInOutByAccountDTO
  ) {
    const row = await database.getFirstAsync<TransferSummaryRow>(
      `
        SELECT
          COALESCE(
            SUM(
              CASE
                WHEN type = 'transfer' AND to_account_id = ? THEN amount
                ELSE 0
              END
            ),
            0
          ) AS incoming,
          COALESCE(
            SUM(
              CASE
                WHEN type = 'transfer' AND from_account_id = ? THEN amount
                ELSE 0
              END
            ),
            0
          ) AS outgoing
        FROM transactions
      `,
      [input.accountId, input.accountId]
    );

    return mapTransferSummaryRow(
      row ?? {
        incoming: 0,
        outgoing: 0,
      }
    );
  }

  return {
    create,
    delete: remove,
    getById,
    listByMonth,
    listWithFilters,
    listByAccount,
    sumByTypeAndMonth,
    update,
    sumTransferInOutByAccount,
  };
}

function getMonthDateRange(month: number, year: number) {
  const normalizedMonth = String(month).padStart(2, '0');
  const startDate = `${year}-${normalizedMonth}-01`;

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const normalizedNextMonth = String(nextMonth).padStart(2, '0');
  const endDate = `${nextYear}-${normalizedNextMonth}-01`;

  return {
    startDate,
    endDate,
  };
}

function buildTransactionFilterQuery(input: ListTransactionsFiltersDTO) {
  const clauses: string[] = [];
  const parameters: Array<string | number> = [];

  if (input.type !== undefined) {
    clauses.push('type = ?');
    parameters.push(input.type);
  }

  if (input.categoryId !== undefined) {
    clauses.push('category_id = ?');
    parameters.push(input.categoryId);
  }

  if (input.accountId !== undefined) {
    clauses.push('(account_id = ? OR from_account_id = ? OR to_account_id = ?)');
    parameters.push(input.accountId, input.accountId, input.accountId);
  }

  if (input.fromAccountId !== undefined) {
    clauses.push('from_account_id = ?');
    parameters.push(input.fromAccountId);
  }

  if (input.toAccountId !== undefined) {
    clauses.push('to_account_id = ?');
    parameters.push(input.toAccountId);
  }

  if (input.month !== undefined && input.year !== undefined) {
    const { startDate, endDate } = getMonthDateRange(input.month, input.year);
    clauses.push('date >= ? AND date < ?');
    parameters.push(startDate, endDate);
  }

  if (input.dateFrom !== undefined) {
    clauses.push('date >= ?');
    parameters.push(input.dateFrom);
  }

  if (input.dateTo !== undefined) {
    clauses.push('date <= ?');
    parameters.push(input.dateTo);
  }

  return {
    whereClause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    parameters,
  };
}
