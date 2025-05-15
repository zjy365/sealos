import { BonusDetailsApiResponse, TBonusDetailsApiResponse } from '@/schema/plan';
import { AccessTokenPayload } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import { AxiosError, HttpStatusCode } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

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
    const response = await client.get('/payment/v1alpha1/credits/bonus-details');

    const validation = BonusDetailsApiResponse.safeParse(response.data);
    if (!validation.success) {
      return jsonRes(res, {
        code: 500,
        message: 'Invalid response format'
      });
    }
    return jsonRes<TBonusDetailsApiResponse>(res, {
      code: 200,
      data: validation.data
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
    return jsonRes(res, { code: 500, message: 'Failed to fetch bonus details' });
  }
}
