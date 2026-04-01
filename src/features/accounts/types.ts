import type { Account, AccountType, MoneyInCents } from '../../types/domain';

export const accountTypeValues = [
  'cash',
  'bank',
  'wallet',
  'investment',
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
    label: 'Inversion',
    description: 'Fondos, brokers o cuentas de inversion.',
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

export function toAccountFormValues(account: Account): SaveAccountInput {
  return {
    name: account.name,
    type: account.type,
    initialBalance: account.initialBalance,
    active: account.active,
  };
}
