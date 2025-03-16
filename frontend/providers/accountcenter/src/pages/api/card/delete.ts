import { DeleteCardSchema } from '@/schema/card';
import { AccessTokenPayload } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import { AxiosError, HttpStatusCode } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  if (req.method !== 'POST') {
    return jsonRes(resp, { code: 405, message: 'Method Not Allowed' });
  }

  try {
    let payload: AccessTokenPayload;
    try {
      payload = await authSession(req.headers);
    } catch {
      jsonRes(resp, { code: HttpStatusCode.Unauthorized, message: HttpStatusCode[401] });
      return;
    }
    const paramsResult = DeleteCardSchema.safeParse(req.body); // 假设请求体中包含要删除的卡的ID
    if (!paramsResult.success) {
      return jsonRes(resp, { code: 400, message: 'Invalid request body' });
    }
    const { cardID } = paramsResult.data;
    const region = await getRegionByUid(req.body.regionUid);
    const client = makeAPIClient(region, payload);
    const res = await client.post('/payment/v1alpha1/card/delete', { cardID });
    // 如果后端返回中包含 error 字段，表示操作失败
    if (res.data.error) {
      return jsonRes(resp, {
        code: res.status,
        message: res.data.error
      });
    }

    // 如果后端返回成功
    return jsonRes(resp, {
      code: 200,
      data: {
        card_id: cardID
      }
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return jsonRes(resp, { code: error.status, message: error.response?.data.error });
    }
    console.error(error);
    return jsonRes(resp, { code: 500, message: 'Failed to delete card' });
  }
}
