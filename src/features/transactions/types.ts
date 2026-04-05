import type {
  Account,
  Category,
  EntityId,
  IsoDateString,
  MoneyInCents,
  Transaction,
  TransactionType,
} from '../../types/domain';
import { createCurrencyFormatter } from '../../lib/formatters';

export const transactionTypeValues = [
  'income',
  'expense',
  'transfer',
  'yield',
] as const;

export type TransactionTypeOption = {
  value: TransactionType;
  label: string;
  description: string;
};

export type TransactionFormValues = {
  type: TransactionType;
  amount: MoneyInCents;
  date: IsoDateString;
  accountId: string;
  fromAccountId: string;
  toAccountId: string;
  categoryId: string;
  note: string;
};

export type SaveTransactionInput = {
  type: TransactionType;
  amount: MoneyInCents;
  date: IsoDateString;
  accountId: EntityId | null;
  fromAccountId: EntityId | null;
  toAccountId: EntityId | null;
  categoryId: EntityId | null;
  note: string | null;
};

export type TransactionListFilters = {
  month: number;
  year: number;
  type: TransactionType | null;
  accountId: EntityId | null;
  categoryId: EntityId | null;
};

export type TransactionReferenceData = {
  accounts: Account[];
  categories: Category[];
};

export const transactionTypeOptions: readonly TransactionTypeOption[] = [
  {
    value: 'income',
    label: 'Ingreso',
    description: 'Entradas de dinero por sueldo u otros ingresos.',
  },
  {
    value: 'expense',
    label: 'Gasto',
    description: 'Pagos y consumos. En cuentas crédito registran deuda pendiente.',
  },
  {
    value: 'transfer',
    label: 'Transferencia',
    description: 'Movimiento entre cuentas propias. Sirve también para pagar la tarjeta de crédito.',
  },
  {
    value: 'yield',
    label: 'Rendimiento',
    description: 'Ganancias financieras, intereses o retornos de inversión.',
  },
] as const;

export function createDefaultTransactionFormValues(
  referenceDate = new Date()
): TransactionFormValues {
  return {
    type: 'expense',
    amount: 0,
    date: toIsoDate(referenceDate),
    accountId: '',
    fromAccountId: '',
    toAccountId: '',
    categoryId: '',
    note: '',
  };
}

export const defaultTransactionFormValues = createDefaultTransactionFormValues();

const monthLabels = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

export function getTransactionTypeLabel(type: TransactionType) {
  const option = transactionTypeOptions.find((item) => item.value === type);

  return option ? option.label : type;
}

export function getTransactionTypeDescription(type: TransactionType) {
  const option = transactionTypeOptions.find((item) => item.value === type);

  return option ? option.description : '';
}

export function toSaveTransactionInput(
  values: TransactionFormValues
): SaveTransactionInput {
  if (values.type === 'transfer') {
    return {
      type: values.type,
      amount: values.amount,
      date: values.date,
      accountId: null,
      fromAccountId: values.fromAccountId || null,
      toAccountId: values.toAccountId || null,
      categoryId: null,
      note: normalizeNote(values.note),
    };
  }

  return {
    type: values.type,
    amount: values.amount,
    date: values.date,
    accountId: values.accountId || null,
    fromAccountId: null,
    toAccountId: null,
    categoryId: values.categoryId || null,
    note: normalizeNote(values.note),
  };
}

export function toTransactionFormValues(
  transaction: Transaction
): TransactionFormValues {
  if (transaction.type === 'transfer') {
    return {
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date,
      accountId: '',
      fromAccountId: transaction.fromAccountId ?? '',
      toAccountId: transaction.toAccountId ?? '',
      categoryId: '',
      note: transaction.note ?? '',
    };
  }

  return {
    type: transaction.type,
    amount: transaction.amount,
    date: transaction.date,
    accountId: transaction.accountId ?? '',
    fromAccountId: '',
    toAccountId: '',
    categoryId: transaction.categoryId ?? '',
    note: transaction.note ?? '',
  };
}

export function formatMoneyInPesos(valueInCents: number) {
  return currencyFormatter.format(valueInCents / 100);
}

export function formatTransactionDate(date: string) {
  const [year, month, day] = date.split('-');

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

export function formatPeriodLabel(month: number, year: number) {
  const monthLabel = monthLabels[month - 1];

  return `${monthLabel ?? month}/${year}`;
}

export function getTransactionAmountPrefix(type: Transaction['type']) {
  switch (type) {
    case 'expense':
      return '-';
    case 'income':
    case 'yield':
      return '+';
    default:
      return '';
  }
}

function normalizeNote(note: string) {
  const trimmedNote = note.trim();

  return trimmedNote.length > 0 ? trimmedNote : null;
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const currencyFormatter = createCurrencyFormatter({
  currency: 'ARS',
});
