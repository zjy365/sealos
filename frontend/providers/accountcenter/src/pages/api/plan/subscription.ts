import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import type { NextApiRequest, NextApiResponse } from 'next';
import { SubscriptionApiResponse, TSubscriptionApiResponse } from '@/schema/plan';
import { authSession } from '@/service/backend/auth';
import { AxiosError, HttpStatusCode } from 'axios';
import { AccessTokenPayload } from '@/service/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let payload: AccessTokenPayload;
    try {
      payload = await authSession(req.headers);
    } catch {
      jsonRes(res, { code: HttpStatusCode.Unauthorized, message: HttpStatusCode[401] });
      return;
    }

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
    console.log(validation.data, '/payment/v1alpha1/subscription/user-info');

    return jsonRes<TSubscriptionApiResponse>(res, {
      code: 200,
      data: {
        subscription: validation.data.subscription
      }
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return jsonRes(res, {
        code: error.status,
        message: error.response?.data.error,
        data: error.response?.data
      });
    }
    console.error(error);
    return jsonRes(res, { code: 500, message: 'Failed to fetch subscription status' });
  }
}
