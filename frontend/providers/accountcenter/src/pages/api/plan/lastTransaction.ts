import {
  PlanListSchema,
  TLastTransactionResponse,
  lastTransactionApiResponseSchema
} from '@/schema/plan';
import { AccessTokenPayload } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import { AxiosError, HttpStatusCode } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  try {
    let payload: AccessTokenPayload;
    try {
      payload = await authSession(req.headers);
    } catch {
      jsonRes(resp, { code: HttpStatusCode.Unauthorized, message: HttpStatusCode[401] });
      return;
    }
    const region = await getRegionByUid(req.body.regionUid);
    const client = makeAPIClient(region, payload);
    const res = await client.post<{ transaction: TLastTransactionResponse }>(
      'payment/v1alpha1/subscription/last-transaction'
    );

    const transcation = res.data.transaction;

    console.log('payment/v1alpha1/subscription/last-transcation', transcation);

    return jsonRes(resp, {
      code: 200,
      data: {
        transcation
      }
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return jsonRes(resp, {
        code: error.status,
        message: error.response?.data.error,
        data: error.response?.data
      });
    }
    console.log(error);
    return jsonRes(resp, { code: 500, message: 'Failed to fetch subscription plans' });
  }
}
