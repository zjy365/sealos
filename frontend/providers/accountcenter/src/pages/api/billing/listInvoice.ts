import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import { RechargeBillingData } from '@/types';
import { AxiosError } from 'axios';
import { subDays } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  try {
    const {
      endTime = new Date(),
      startTime = subDays(new Date(), 1),
      paymentID,
      page = 1,
      pageSize = 100,
      invoiced
    } = req.body as {
      endTime?: Date;
      startTime?: Date;
      paymentID?: string;
      page?: number;
      pageSize?: number;
      invoiced?: boolean;
    };
    const data = {
      endTime,
      paymentID,
      startTime,
      page,
      invoiced,
      pageSize
    };
    const payload = await authSession(req.headers);
    const region = await getRegionByUid();
    const client = makeAPIClient(region, payload);
    if (!client) throw Error('get api client error');
    const response = await client.post('/account/v1alpha1/payment', data);

    if (response.status !== 200)
      return jsonRes(resp, {
        code: 404,
        data: {
          invoice: []
        }
      });
    const res = response.data as { data: RechargeBillingData };
    return jsonRes(resp, {
      data: res.data
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return jsonRes(resp, { code: error.status, message: error.response?.data.error });
    }
    console.log(error);
    jsonRes(resp, { code: 500, message: 'get billing error' });
  }
}
