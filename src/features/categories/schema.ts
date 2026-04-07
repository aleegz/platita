import { z } from 'zod';

import { categoryTypeValues } from './types';

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.'),
  type: z.enum(categoryTypeValues, {
    message: 'Selecciona un tipo de categoría.',
  }),
  active: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;