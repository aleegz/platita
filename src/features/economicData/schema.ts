import { z } from 'zod';

export const economicDataFormSchema = z.object({
  dollarOfficial: z
    .number({
      invalid_type_error: 'Ingresa un valor válido para el dólar oficial.',
    })
    .int('El dólar oficial debe ser un número entero.')
    .min(0, 'El dólar oficial no puede ser negativo.'),
  inflationMonthlyBasisPoints: z
    .number({
      invalid_type_error: 'Ingresa una inflación mensual válida.',
    })
    .int('La inflación debe ser un número entero.')
    .min(0, 'La inflación no puede ser negativa.'),
});

export type EconomicDataFormValues = z.infer<typeof economicDataFormSchema>;
