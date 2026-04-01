import { z } from 'zod';

export const userProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Ingresa tu nombre.')
    .max(32, 'Usa un nombre de hasta 32 caracteres.'),
});

export type UserProfileFormValues = z.infer<typeof userProfileSchema>;
