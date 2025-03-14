import { SetDefaultCardSchema } from '@/schema/card';
import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  if (req.method !== 'POST') {
    return jsonRes(resp, { code: 405, message: 'Method Not Allowed' });
  }

  try {
    const paramsResult = SetDefaultCardSchema.safeParse(req.body); // 假设请求体中包含要删除的卡的ID
    if (!paramsResult.success) {
      return jsonRes(resp, { code: 400, message: 'Invalid request body' });
    }
    const { cardID } = paramsResult.data;
    const payload = await authSession(req.headers);
    const region = await getRegionByUid(req.body.regionUid);
    const client = makeAPIClient(region, payload);
    const res = await client.post('/payment/v1alpha1/card/set-default', { cardID });
    console.log(res.data);
    // 如果后端返回中包含 error 字段，表示操作失败
    if (res.data.error || res.data.data !== 'success') {
      console.log(res.data.error);
      return jsonRes(resp, {
        code: res.status,
        message: res.data.error
      });
    }

    // 如果后端返回成功，返回更新后的订阅信息（可以扩展为返回卡信息或其他需要的信息）
    return jsonRes(resp, {
      code: 200,
      data: {
        subscription: res.data.subscription
      }
    });
  } catch (error) {
    console.error(error);
    return jsonRes(resp, { code: 500, message: 'Failed to set card as default' });
  }
}
