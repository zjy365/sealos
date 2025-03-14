import { CardListApiSchema, TCardScheam } from '@/schema/card'; // 假设你在schema文件夹中定义了CardListSchema
import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  try {
    const payload = await authSession(req.headers);
    const region = await getRegionByUid(req.body.regionUid);
    const client = makeAPIClient(region, payload);
    const res = await client.post('/payment/v1alpha1/card/list'); // 假设这个API可以获取card列表
    const cardMap = res.data;
    const validation = CardListApiSchema.safeParse(cardMap);

    if (!validation.success) {
      console.log(validation.error);
      return jsonRes(resp, {
        code: res.status,
        message: 'Invalid response format'
      });
    }

    const cardList = validation.data.cards.map((card) => ({
      id: card.ID,
      userUID: card.UserUID,
      cardNo: card.CardNo,
      cardBrand: card.CardBrand,
      createdAt: card.CreatedAt,
      default: card.Default,
      lastPaymentStatus: card.LastPaymentStatus
    }));

    return jsonRes<{ cardList: TCardScheam[] }>(resp, {
      code: 200,
      data: {
        cardList
      }
    });
  } catch (error) {
    console.error(error);
    return jsonRes(resp, { code: 500, message: 'Failed to fetch cards' });
  }
}
