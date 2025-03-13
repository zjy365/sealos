import { z } from 'zod';

export const initRegionTokenParamsSchema = z.object({
  regionUid: z.string({ message: 'Invalid email format' }),
  workspaceName: z
    .string()
    .min(1, { message: 'Workspace name must be at least 1 character long' })
    .max(100, { message: 'Workspace name must be at most 100 characters long' })
});
export type InitRegionTokenParams = z.infer<typeof initRegionTokenParamsSchema>;
