import { array, boolean, number, object, string, TypeOf } from 'zod';

export const WSResponse = object({
  content: string(),
  // chunk: object({
  //   id: string(),
  //   object: string(),
  //   created: number(),
  //   model: string(),
  //   choices: array(
  //     object({
  //       delta: object({
  //         content: string(),
  //       }),
  //       index: number(),
  //       finish_reason: string().nullable(),
  //     })
  //   ),
  // }).optional(),
  done: boolean().optional(),
  // appVersion: string(),
  error: object({
    code: string(),
    message: string(),
  }).optional(),
});

// export type WSResponse = TypeOf<typeof WSResponse>;
