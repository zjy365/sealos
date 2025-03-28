import { TRechargeApiResponse, TRechargeApiSchema, rechargeRequest } from '@/schema/card';
import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import { AxiosError } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  try {
    // For internal backend requests, use rechargeApiSchema
    const paramsResult = rechargeRequest.safeParse(req.body);
    if (!paramsResult.success) {
      return jsonRes(resp, { code: 400, message: paramsResult.error.message });
    }
    // For internal requests
    const { cardID, amount } = paramsResult.data;
    const payload = await authSession(req.headers);
    const region = await getRegionByUid(payload.regionUid);
    const client = makeAPIClient(region, payload);

    const res = await client.post<TRechargeApiResponse>('/payment/v1alpha1/pay', {
      cardID,
      amount,
      method: 'CARD'
    });
    if (!res.data.success) {
      console.log(res.data);
      return jsonRes(resp, {
        code: res.status,
        message: res.data.error
      });
    }

    return jsonRes(resp, {
      code: 200,
      data: res.data
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return jsonRes(resp, { code: error.status, message: error.response?.data.error });
    }
    console.error(error);
    return jsonRes(resp, { code: 500, message: 'Failed to recharge' });
  }
}
