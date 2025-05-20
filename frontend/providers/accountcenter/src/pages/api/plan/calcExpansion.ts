import { AccessTokenPayload } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { jsonRes } from '@/service/backend/response';
import { getExpansion } from '@/service/crmApi/expansion';
import { HttpStatusCode } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export interface ExpansionParam {
  amount: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let payload: AccessTokenPayload;
    try {
      payload = await authSession(req.headers);
    } catch {
      jsonRes(res, { code: HttpStatusCode.Unauthorized, message: HttpStatusCode[401] });
      return;
    }

    const { amount } = req.body as ExpansionParam;
    if (!amount) {
      jsonRes(res, { code: 400, message: 'amount is required' });
      return;
    }

    const result = await getExpansion({ amount, user_id: payload.userUid });
    jsonRes(res, {
      code: 200,
      data: {
        amount: result
      }
    });
  } catch (error) {
    console.log(error);
    jsonRes(res, { code: 500, message: 'get amount error' });
  }
}
