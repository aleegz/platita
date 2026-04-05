import {
  isCreditAccountType,
  type Account,
  type AccountType,
  type MoneyInCents,
} from '../../types/domain';

export const accountTypeValues = [
  'cash',
  'bank',
  'wallet',
  'investment',
  'credit',
] as const;

export type SaveAccountInput = {
  name: string;
  type: AccountType;
  initialBalance: MoneyInCents;
  active: boolean;
};

export type AccountTypeOption = {
  value: AccountType;
  label: string;
  description: string;
};

export const accountTypeOptions: readonly AccountTypeOption[] = [
  {
    value: 'cash',
    label: 'Efectivo',
    description: 'Billetes, monedas o caja chica.',
  },
  {
    value: 'bank',
    label: 'Banco',
    description: 'Cuenta bancaria tradicional o caja de ahorro.',
  },
  {
    value: 'wallet',
    label: 'Billetera',
    description: 'Apps y cuentas virtuales como Mercado Pago.',
  },
  {
    value: 'investment',
    label: 'Inversión',
    description: 'Fondos, brokers o cuentas de inversión.',
  },
  {
    value: 'credit',
    label: 'Crédito',
    description: 'Tarjetas o líneas de crédito que registran deuda pendiente.',
  },
] as const;

export const defaultAccountFormValues: SaveAccountInput = {
  name: '',
  type: 'cash',
  initialBalance: 0,
  active: true,
};

export function getAccountTypeLabel(type: AccountType) {
  const option = accountTypeOptions.find((item) => item.value === type);

  return option ? option.label : type;
}

export function getAccountOpeningBalanceLabel(type: AccountType) {
  return isCreditAccountType(type) ? 'Deuda inicial' : 'Saldo inicial';
}

export function getAccountOpeningBalanceHelperText(type: AccountType) {
  return isCreditAccountType(type)
    ? 'Carga la deuda con la que arranca la tarjeta. Escribe solo números y los últimos dos dígitos son los centavos.'
    : 'Escribe solo números. Los últimos dos dígitos son los centavos.';
}

export function getAccountOpeningBalancePreviewLabel(type: AccountType) {
  return isCreditAccountType(type)
    ? 'Vista previa de deuda'
    : 'Vista previa';
}

export function toAccountFormValues(account: Account): SaveAccountInput {
  return {
    name: account.name,
    type: account.type,
    initialBalance: account.initialBalance,
    active: account.active,
  };
}
