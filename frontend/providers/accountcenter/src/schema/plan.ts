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
  Period: z.enum(['MONTHLY', 'YEARLY']), // API没有这个字段，但是前端需要，从用户订阅信息中获取 const subscription = subscriptionResponse?.subscription;
  UpgradePlanList: z.union([z.array(z.string()), z.null()]),
  DowngradePlanList: z.union([z.array(z.string()), z.null()]),
  MaxSeats: z.number(),
  MaxWorkspaces: z.number(),
  MaxResources: z.string(),
  CreatedAt: z.string(),
  UpdatedAt: z.string(),
  MostPopular: z.boolean().optional(),
  NodePort: z.number(),
  PodCount: z.number(),
  LogRetention: z.number(),
  AnnualAmount: z.number()
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
    NextCycleDate: z.string(),
    Period: z.enum(['MONTHLY', 'YEARLY'])
  })
});
export type TSubscriptionApiResponse = z.infer<typeof SubscriptionApiResponse>;

// {
// 	"credits": {
// 		"userUid": "088672be-e977-4b21-a700-b02b4d94c295",
// 		"balance": 153000000,
// 		"deductionBalance": 20000000,
// 		"credits": 45000000,
// 		"deductionCredits": 0,
// 		"kycDeductionCreditsDeductionBalance": 0,
// 		"kycDeductionCreditsBalance": 5000000,
// 		"currentPlanCreditsBalance": 0,
// 		"currentPlanCreditsDeductionBalance": 0
// 	}
export const CreditsUsageApiResponse = z.object({
  credits: z.object({
    userUid: z.string(),
    balance: z.number(),
    deductionBalance: z.number(),
    credits: z.number(),
    deductionCredits: z.number(),
    kycDeductionCreditsDeductionBalance: z.number(),
    kycDeductionCreditsBalance: z.number(),
    currentPlanCreditsBalance: z.number(),
    currentPlanCreditsDeductionBalance: z.number(),
    bonusCreditsBalance: z.number(),
    bonusCreditsDeductionBalance: z.number()
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
  }),
  github: z.object({
    total: z.number(),
    used: z.number(),
    time: z.string().optional()
  }),
  currentPlan: z.object({
    total: z.number(),
    used: z.number(),
    time: z.string().optional()
  }),
  bonus: z.object({
    total: z.number(),
    used: z.number(),
    time: z.string().optional()
  })
});

export const BonusItemSchema = z.object({
  id: z.string(),
  amount: z.number(),
  usedAmount: z.number(),
  createdAt: z.string(),
  expiredAt: z.string(),
  status: z.enum(['active', 'expired', 'used_up'])
});

export const BonusDetailsApiResponse = z.object({
  userUid: z.string(),
  bonusItems: z.array(BonusItemSchema),
  totalAmount: z.number(),
  usedAmount: z.number()
});

export type TCreditsUsageApiResponse = z.infer<typeof CreditsUsageApiResponse>;
export type TCreditsUsageResponse = z.infer<typeof CreditsUsageResponse>;
export type TBonusItem = z.infer<typeof BonusItemSchema>;
export type TBonusDetailsApiResponse = z.infer<typeof BonusDetailsApiResponse>;

export const updatePlanApiRequestSchema = z.object({
  planName: z.string(),
  planID: z.string().optional(),
  payMethod: z.enum(['CARD']),
  planType: z.enum(['upgrade', 'downgrade', 'renewal'])
});
export const updatePlanRequestSchema = z.object({
  payMethod: z.string().optional(),
  cardID: z.string().optional(),
  planName: z.string(),
  planID: z.string(),
  planType: z.enum(['upgrade', 'downgrade', 'renewal']),
  period: z.enum(['MONTHLY', 'YEARLY'])
});
export const updatePlanResponseSchema = z.object({
  success: z.boolean(),
  redirectUrl: z.string(),
  error: z.string().optional()
});
export const lastTransactionApiResponseSchema = z.object({
  ID: z.string(),
  SubscriptionID: z.string(),
  UserUID: z.string(), // 用户 UID，必须是有效的 UUID
  OldPlanID: z.string(), // 原计划 ID，必须是有效的 UUID
  NewPlanID: z.string(), // 新计划 ID，必须是有效的 UUID
  OldPlanName: z.string(), // 原计划名称
  NewPlanName: z.string(), // 新计划名称
  OldPlanStatus: z.enum(['NORMAL', 'DEBT']), // 原计划状态，枚举类型
  Operator: z.enum(['created', 'upgraded', 'downgraded', 'canceled', 'renewed']), // 操作类型，枚举类型
  StartAt: z.string().datetime(), // 开始时间，
  CreatedAt: z.string().datetime(), // 创建时间
  UpdatedAt: z.string().datetime(), // 更新时间，
  Status: z.enum(['completed', 'pending', 'processing', 'failed']), // 交易状态，枚举类型
  PayStatus: z.enum(['pending', 'paid', 'no_need', 'failed']), // 支付状态，枚举类型
  PayID: z.string(), // 支付 ID
  Amount: z.number().int().positive() // 金额，必须是正整数
});
export type TLastTransactionResponse = z.infer<typeof lastTransactionApiResponseSchema>;
export type TUpdatePlanApiRequest = z.infer<typeof updatePlanApiRequestSchema>;
export type TUpdatePlanRequest = z.infer<typeof updatePlanRequestSchema>;
export type TUpdatePlanResponse = z.infer<typeof updatePlanResponseSchema>;

export const UpgradeAmountRequestSchema = z.object({
  planName: z.string(),
  period: z.enum(['MONTHLY', 'YEARLY'])
});

// const UpgradeAmountResponseSchema = z.object({
//   planName: z.string()
// });

export type TUpgradeAmountRequest = z.infer<typeof UpgradeAmountRequestSchema>;
// export type TUpgradeAmountResponse = z.infer<typeof UpgradeAmountResponseSchema>;

export const UserKycApiResponse = z.object({
  kycInfo: z.object({
    UserUID: z.string(),
    Status: z.string(),
    CreatedAt: z.string(),
    UpdatedAt: z.string(),
    NextAt: z.string()
  })
});
export type TUserKycApiResponse = z.infer<typeof UserKycApiResponse>;
