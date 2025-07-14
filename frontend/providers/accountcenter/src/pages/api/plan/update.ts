import {
  TUpdatePlanResponse,
  updatePlanRequestSchema,
  updatePlanResponseSchema
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
    // 验证请求体
    const validation = updatePlanRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return jsonRes(resp, { code: 400, message: validation.error.message });
    }

    const { planName, planID, planType, cardID, payMethod, period } = validation.data;
    const region = await getRegionByUid(payload.regionUid);
    const client = makeAPIClient(region, payload);

    const res = await client.post<TUpdatePlanResponse>('payment/v1alpha1/subscription/pay', {
      planName,
      planID,
      payMethod: payMethod || 'CARD',
      planType,
      cardID,
      period
    });

    console.log('payment/v1alpha1/subscription/pay', res.data);

    if (!res.data.success) {
      return jsonRes(resp, { code: res.status, message: res.data.error });
    }

    return jsonRes<TUpdatePlanResponse>(resp, { code: 200, data: res.data });
  } catch (error) {
    console.log(error);
    if (error instanceof AxiosError) {
      return jsonRes(resp, {
        code: error.status,
        message: error.response?.data.error,
        data: error.response?.data
      });
    }
    console.error(error);
    return jsonRes(resp, { code: 500, message: 'Failed to update plan' });
  }
}
