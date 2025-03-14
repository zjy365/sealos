import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  CreditsUsageApiResponse,
  TCreditsUsageApiResponse,
  TCreditsUsageResponse
} from '@/schema/plan';
import { jsonRes } from '@/service/backend/response';
import { authSession } from '@/service/backend/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload = await authSession(req.headers);
    const region = await getRegionByUid(req.body.regionUid);
    const client = makeAPIClient(region, payload);
    const response = await client.post('/payment/v1alpha1/credits/info');

    // 验证返回数据的结构
    const validation = CreditsUsageApiResponse.safeParse(response.data);
    if (!validation.success) {
      return jsonRes(res, {
        code: 500,
        message: 'Invalid response format'
      });
    }
    const transformResponse = (creditsData: TCreditsUsageApiResponse['credits']) => {
      return {
        gift: {
          total: creditsData.credits,
          used: creditsData.deductionCredits
          // 如果需要时间信息，可以添加逻辑来计算，这里留空
        },
        charged: {
          total: creditsData.balance,
          used: creditsData.deductionBalance
          // 如果需要时间信息，可以添加逻辑来计算，这里留空
        }
      };
    };
    const creditsData = validation.data.credits;
    return jsonRes<TCreditsUsageResponse>(res, {
      code: 200,
      data: transformResponse(creditsData)
    });
  } catch (error) {
    console.error(error);
    return jsonRes(res, { code: 500, message: 'Failed to fetch credits usage' });
  }
}
