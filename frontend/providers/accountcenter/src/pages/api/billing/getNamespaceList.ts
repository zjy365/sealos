import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import { AxiosError } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  try {
    const { endTime, startTime, regionUid } = req.body as {
      endTime?: Date;
      startTime?: Date;
      regionUid?: string;
    };
    if (!endTime)
      return jsonRes(resp, {
        code: 400,
        message: 'endTime is invalid'
      });
    if (!startTime)
      return jsonRes(resp, {
        code: 400,
        message: 'endTime is invalid'
      });
    const payload = await authSession(req.headers);
    const region = await getRegionByUid(regionUid);
    const client = makeAPIClient(region, payload);
    if (!client) throw Error('get api client error');
    const res = await client.post('/account/v1alpha1/namespaces', {
      endTime,
      startTime,
      type: 0
    });
    const data = res.data;
    return jsonRes(resp, {
      code: 200,
      data: data.data,
      message: data.message
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return jsonRes(resp, { code: error.status, message: error.response?.data.error });
    }
    console.log(error);
    jsonRes(resp, { code: 500, message: 'get namespaceList error' });
  }
}
