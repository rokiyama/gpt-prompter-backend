import { object, string, TypeOf } from 'zod';

export const ApiGwError = object({
  message: string(),
  connectionId: string(),
  requestId: string(),
});

// export type ApiGwError = TypeOf<typeof ApiGwError>;
