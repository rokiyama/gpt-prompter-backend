import { randomUUID } from 'expo-crypto';

export const uuid = () => {
  const s = randomUUID();
  if (typeof s !== 'string') {
    throw new Error('failed to get randomUUID');
  }
  return s;
};
