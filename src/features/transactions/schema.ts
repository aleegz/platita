import { z } from 'zod';

import { transactionTypeValues } from './types';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const transactionFormSchema = z
  .object({
    type: z.enum(transactionTypeValues, {
      message: 'Selecciona un tipo de movimiento.',
    }),
    amount: z
      .number({
        invalid_type_error: 'Ingresa un monto válido.',
      })
      .int('El monto debe ser un número entero.')
      .positive('El monto debe ser mayor a cero.'),
    date: z
      .string()
      .trim()
      .regex(isoDatePattern, 'Usa el formato AAAA-MM-DD.')
      .refine(isValidIsoDate, 'Ingresa una fecha válida.'),
    accountId: z.string(),
    fromAccountId: z.string(),
    toAccountId: z.string(),
    categoryId: z.string(),
    note: z
      .string()
      .max(280, 'La nota no puede superar los 280 caracteres.'),
  })
  .superRefine((values, context) => {
    if (values.type === 'transfer') {
      if (values.fromAccountId.trim().length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecciona una cuenta de origen.',
          path: ['fromAccountId'],
        });
      }

      if (values.toAccountId.trim().length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecciona una cuenta de destino.',
          path: ['toAccountId'],
        });
      }

      if (
        values.fromAccountId.trim().length > 0 &&
        values.toAccountId.trim().length > 0 &&
        values.fromAccountId === values.toAccountId
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Origen y destino deben ser cuentas distintas.',
          path: ['toAccountId'],
        });
      }

      return;
    }

    if (values.accountId.trim().length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecciona una cuenta.',
        path: ['accountId'],
      });
    }

    if (values.categoryId.trim().length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecciona una categoría.',
        path: ['categoryId'],
      });
    }
  });

function isValidIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}
