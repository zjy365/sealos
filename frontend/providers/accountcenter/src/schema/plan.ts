import { z } from 'zod';

type LowerFirst<S extends string> = S extends `${infer P1}${infer P2}`
  ? `${Lowercase<P1>}${P2}`
  : S;

type KeysToLowerFirst<T> = {
  [K in keyof T as LowerFirst<string & K>]: T[K] extends {} ? KeysToLowerFirst<T[K]> : T[K];
};
export const PlanSchema = z.object({
  ID: z.string(),
  Name: z.string(),
  Description: z.string(),
  Amount: z.number(),
  GiftAmount: z.number(),
  Period: z.string(),
  UpgradePlanList: z.union([z.array(z.string()), z.null()]),
  DowngradePlanList: z.union([z.array(z.string()), z.null()]),
  MaxSeats: z.number(),
  MaxWorkspaces: z.number(),
  MaxResources: z.string(),
  CreatedAt: z.string(),
  UpdatedAt: z.string(),
  MostPopular: z.boolean().optional()
});
export const PlanListSchema = z.array(PlanSchema);
export type TPlanApiResponse = KeysToLowerFirst<Omit<z.infer<typeof PlanSchema>, 'ID'>> & {
  id: string;
};
export type TPlanMaxResourcesObject = { cpu?: string; memory?: string; storage?: string };
export const SubscriptionApiResponse = z.object({
  subscription: z.object({
    ID: z.string(),
    PlanID: z.string(),
    PlanName: z.string(),
    UserUID: z.string(),
    Status: z.string(),
    StartAt: z.string(),
    UpdateAt: z.string(),
    ExpireAt: z.string(),
    CardID: z.string().nullable(),
    NextCycleDate: z.string()
  })
});
export type TSubscriptionApiResponse = z.infer<typeof SubscriptionApiResponse>;
export const CreditsUsageApiResponse = z.object({
  credits: z.object({
    userUid: z.string(),
    balance: z.number(),
    deductionBalance: z.number(),
    credits: z.number(),
    deductionCredits: z.number()
  })
});
export const CreditsUsageResponse = z.object({
  gift: z.object({
    total: z.number(),
    used: z.number(),
    time: z.string().optional()
  }),
  charged: z.object({
    total: z.number(),
    used: z.number(),
    time: z.string().optional()
  })
});
export type TCreditsUsageApiResponse = z.infer<typeof CreditsUsageApiResponse>;
export type TCreditsUsageResponse = z.infer<typeof CreditsUsageResponse>;

export const updatePlanApiRequestSchema = z.object({
  planName: z.string(),
  planID: z.string().optional(),
  payMethod: z.enum(['CARD']),
  planType: z.enum(['upgrade', 'downgrade'])
});
export const updatePlanRequestSchema = z.object({
  planName: z.string(),
  planID: z.string(),
  planType: z.enum(['upgrade', 'downgrade'])
});
export const updatePlanResponseSchema = z.object({
  success: z.boolean(),
  redirectUrl: z.string(),
  error: z.string().optional()
});

export type TUpdatePlanApiRequest = z.infer<typeof updatePlanApiRequestSchema>;
export type TUpdatePlanRequest = z.infer<typeof updatePlanRequestSchema>;
export type TUpdatePlanResponse = z.infer<typeof updatePlanResponseSchema>;
