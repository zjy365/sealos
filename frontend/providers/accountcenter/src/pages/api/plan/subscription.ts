import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import type { NextApiRequest, NextApiResponse } from 'next';
import { SubscriptionApiResponse, TSubscriptionApiResponse } from '@/schema/plan';
import { authSession } from '@/service/backend/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload = await authSession(req.headers);
    const region = await getRegionByUid(req.body.regionUid);
    const client = makeAPIClient(region, payload);
    const response = await client.post('/payment/v1alpha1/subscription/user-info');

    // 验证返回数据的结构
    const validation = SubscriptionApiResponse.safeParse(response.data);
    if (!validation.success) {
      console.log(validation.error.message);
      return jsonRes(res, {
        code: 500,
        message: 'Invalid response format'
      });
    }

    return jsonRes<TSubscriptionApiResponse>(res, {
      code: 200,
      data: {
        subscription: validation.data.subscription
      }
    });
  } catch (error) {
    console.error(error);
    return jsonRes(res, { code: 500, message: 'Failed to fetch subscription status' });
  }
}
