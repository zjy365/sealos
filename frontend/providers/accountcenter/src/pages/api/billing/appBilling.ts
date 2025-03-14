import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import { formatISO } from 'date-fns';
import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  try {
    const {
      endTime = formatISO(new Date(), {
        representation: 'complete'
      }),
      startTime = formatISO(new Date(), {
        representation: 'complete'
      }),
      appType,
      orderID,
      appName,
      namespace,
      page = 1,
      pageSize = 100,
      regionUid
    } = req.body as {
      endTime?: Date;
      startTime?: Date;
      appType: string;
      appName: string;
      namespace: string;
      orderID?: string;
      pageSize: number;
      page: number;
      regionUid?: string;
    };
    const payload = await authSession(req.headers);
    const region = await getRegionByUid(regionUid);
    const client = makeAPIClient(region, payload);
    if (!client) throw Error('get api client error');
    const bodyRaw = {
      endTime,
      startTime,
      appType,
      appName,
      orderID,
      namespace,
      page,
      pageSize
    };
    // const body = JSON.stringify(bodyRaw);
    const response = await client.post('/account/v1alpha1/costs/app', bodyRaw);
    const res = response.data;
    if (response.status !== 200) {
      console.log(res);
      throw Error('get appbilling error');
    }
    const data = res.app_costs;
    return jsonRes(resp, {
      code: 200,
      data
    });
  } catch (error) {
    console.log(error);
    jsonRes(resp, { code: 500, message: 'get appbilling error' });
  }
}
