import { z } from 'zod';

const CardApiSchema = z.object({
  ID: z.string(),
  UserUID: z.string(),
  CardNo: z.string(),
  CardBrand: z.string(),
  CreatedAt: z.string(),
  Default: z.boolean(),
  LastPaymentStatus: z.string()
});

// 定义卡片列表的验证模式
export const CardListApiSchema = z.object({
  cards: z.array(CardApiSchema)
});
export const CardSchema = z.object({
  id: z.string(),
  userUID: z.string(),
  cardNo: z.string(),
  cardBrand: z.string(),
  createdAt: z.string().datetime(),
  default: z.boolean(),
  lastPaymentStatus: z.string()
});
// 定义设置默认卡的请求体 schema
export const SetDefaultCardSchema = z.object({
  cardID: z.string().uuid('Invalid card ID format')
});
// delete card schema
export const DeleteCardSchema = z.object({
  cardID: z.string().uuid('Invalid card ID format')
});

export type TCardApiSchema = z.infer<typeof CardApiSchema>;
export type TCardListApi = z.infer<typeof CardListApiSchema>;
export type TCardScheam = z.infer<typeof CardSchema>;

export type TSetDefaultCardRequest = z.infer<typeof SetDefaultCardSchema>;
export type TDeleteCardRequest = z.infer<typeof DeleteCardSchema>;
