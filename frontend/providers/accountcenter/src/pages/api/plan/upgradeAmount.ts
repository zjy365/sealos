import {
  // TUpgradeAmountResponseSchema,
  UpgradeAmountRequestSchema
  // UpgradeAmountResponseSchema
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
      return jsonRes(resp, { code: HttpStatusCode.Unauthorized, message: 'Unauthorized' });
    }

    const upgradeAmountRequestValidation = UpgradeAmountRequestSchema.safeParse(req.body);
    if (!upgradeAmountRequestValidation.success) {
      console.log(upgradeAmountRequestValidation.error.message);
      return jsonRes(resp, {
        code: 400,
        message: 'Invalid request format'
      });
    }

    const { planName, period } = upgradeAmountRequestValidation.data;

    const region = await getRegionByUid(req.body.regionUid);
    const client = makeAPIClient(region, payload);
    const res = await client.post('/payment/v1alpha1/subscription/upgrade-amount', {
      planName,
      period
    });

    console.log('payment/v1alpha1/subscription/upgrade-amount', res.data);

    // const upgradeAmountResponseValidation = UpgradeAmountResponseSchema.safeParse(res.data);
    // if (!upgradeAmountResponseValidation.success) {
    //   console.log(upgradeAmountResponseValidation.error);
    //   return jsonRes(resp, {
    //     code: 500,
    //     message: 'Invalid response format'
    //   });
    // }

    return jsonRes(resp, {
      code: 200,
      data: res.data
    });
  } catch (error) {
    console.log(error, 'error');
    if (error instanceof AxiosError) {
      return jsonRes(resp, {
        code: error.status,
        message: error.response?.data.error,
        data: error.response?.data
      });
    }
    console.log(error);
    return jsonRes(resp, { code: 500, message: 'Failed to fetch upgrade amount' });
  }
}
