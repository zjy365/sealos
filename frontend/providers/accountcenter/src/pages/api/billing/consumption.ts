import { AccessTokenPayload } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import { AxiosError, HttpStatusCode } from 'axios';
import { formatISO } from 'date-fns';
import subDays from 'date-fns/esm/fp/subDays';
import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  // 获取时间段内的所有消费总额
  try {
    const {
      endTime = formatISO(new Date(), {
        representation: 'complete'
      }),
      startTime = formatISO(new Date(), {
        representation: 'complete'
      }),
      appType = '',
      namespace = '',
      appName = '',
      regionUid
    } = req.body as {
      endTime?: Date;
      startTime?: Date;
      appType?: string;
      namespace?: string;
      appName?: string;
      regionUid?: string;
    };
    const bodyRaw = {
      endTime,
      startTime,
      appType,
      appName,
      namespace
    };
    let payload: AccessTokenPayload;
    try {
      payload = await authSession(req.headers);
    } catch {
      jsonRes(resp, { code: HttpStatusCode.Unauthorized, message: HttpStatusCode[401] });
      return;
    }
    const region = await getRegionByUid(regionUid);
    const client = makeAPIClient(region, payload);
    if (!client) throw Error('get api client error');
    const results = await client.post('/account/v1alpha1/costs/consumption', bodyRaw);
    const data = results.data;
    if (results.status !== 200) {
      console.log(data);
      throw Error('get consumption error');
    }
    return jsonRes(resp, {
      code: 200,
      data
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return jsonRes(resp, { code: error.status, message: error.response?.data.error });
    }
    console.log(error);
    jsonRes(resp, { code: 500, message: 'get consumption error' });
  }
}
