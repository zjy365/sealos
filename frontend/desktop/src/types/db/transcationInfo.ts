import { z } from 'zod';

export const DeleteUserTransactionInfoSchema = z.object({
  userUid: z.string().uuid()
});

export type DeleteUserTransactionInfo = z.infer<typeof DeleteUserTransactionInfoSchema>;

export const MergeUserTransactionInfoSchema = z.object({
  userUid: z.string().uuid(),
  mergeUserUid: z.string().uuid()
});

export type MergeUserTransactionInfo = z.infer<typeof MergeUserTransactionInfoSchema>;

export const SyncUserPlanTransactionInfoSchema = z.object({
  userUid: z.string().uuid()
  // subscriptionTransactionId: z.string().uuid()
});

export type SyncUserPlanTransactionInfo = z.infer<typeof SyncUserPlanTransactionInfoSchema>;
