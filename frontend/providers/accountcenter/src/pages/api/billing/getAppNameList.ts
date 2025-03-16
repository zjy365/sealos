import { AccessTokenPayload } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import { AppListItem } from '@/types/app';
import { AxiosError, HttpStatusCode } from 'axios';
import { formatISO } from 'date-fns';
import { IncomingHttpHeaders } from 'http';
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
      appName,
      namespace,
      regionUid
    } = req.body as {
      endTime?: Date;
      startTime?: Date;
      appType: string;
      appName: string;
      namespace: string;
      regionUid?: string;
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

    const bodyRaw = {
      endTime,
      startTime,
      appType,
      appName,
      namespace
    };

    const response = await client.post('/account/v1alpha1/cost-app-list', bodyRaw);
    const res = await response.data;
    if (response.status !== 200) {
      console.log(res);
      throw Error('get applist error');
    }
    const data = res.data as {
      apps: AppListItem[];
      total: number;
      totalPage: number;
    };
    return jsonRes(resp, {
      code: 200,
      data
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return jsonRes(resp, { code: error.status, message: error.response?.data.error });
    }
    console.log(error);
    jsonRes(resp, { code: 500, message: 'get applist error' });
  }
}
