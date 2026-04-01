import { z } from 'zod';

export const budgetEditorSchema = z.object({
  budgetAmount: z
    .number({
      invalid_type_error: 'Ingresa un monto válido.',
    })
    .int('El presupuesto debe ser un número entero.')
    .min(0, 'El presupuesto no puede ser negativo.'),
});

export type BudgetEditorFormValues = z.infer<typeof budgetEditorSchema>;
