import { AccessTokenPayload } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { makeAPIClient } from '@/service/backend/region';
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
    // 获取所有应用类型
    const client = makeAPIClient(null, payload);
    const res = await client.post('/account/v1alpha1/cost-app-type-list');

    const appMap = res.data.data;
    return jsonRes(resp, {
      code: 200,
      data: {
        appMap
      }
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return jsonRes(resp, { code: error.status, message: error.response?.data.error });
    }
    console.log(error);
    jsonRes(resp, { code: 500, message: 'get price error' });
  }
}
