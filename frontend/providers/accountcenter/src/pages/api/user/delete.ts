import { AccessTokenPayload } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient, makeDesktopAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import { ApiResp } from '@/types';
import { HttpStatusCode } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let payload: AccessTokenPayload;
    try {
      payload = await authSession(req.headers);
    } catch {
      jsonRes(res, { code: HttpStatusCode.Unauthorized, message: HttpStatusCode[401] });
      return;
    }
    const client = makeDesktopAPIClient(payload);
    if (!client) throw Error('get api client error');
    const response = await client.post('/api/v1alpha/account/delete');

    const data = response.data as ApiResp;
    if (data.code !== HttpStatusCode.Ok) {
      console.log('delete user error');
      console.log(response);
      return jsonRes(res, {
        code: data.code,
        message: data.message || 'delete user error',
        data: {
          success: false
        }
      });
    }
    return jsonRes(res, {
      data: {
        success: true
      }
    });
  } catch (error) {
    console.log('delete user error');
    console.log(error);
    jsonRes(res, { code: 500, message: 'delete error' });
  }
}
