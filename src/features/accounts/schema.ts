import { z } from 'zod';

import { accountTypeValues } from './types';

export const accountFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.'),
  type: z.enum(accountTypeValues, {
    message: 'Selecciona un tipo de cuenta.',
  }),
  initialBalance: z
    .number({
      invalid_type_error: 'Ingresa un saldo inicial válido.',
    })
    .int('El saldo inicial debe ser un número entero.')
    .min(0, 'El saldo inicial no puede ser negativo.'),
  active: z.boolean(),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
