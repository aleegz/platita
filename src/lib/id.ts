import { randomUUID } from 'expo-crypto';

export function createEntityId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}
