import { AccessTokenPayload } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { jsonRes } from '@/service/backend/response';
import { ExpansionRule, getExpansionRule } from '@/service/crmApi/expansionRule';
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

    const pageSize = 100;
    let pageNumber = 1;
    let finalRules: ExpansionRule[] = [];

    while (true) {
      const result = await getExpansionRule({
        user_id: payload.userUid,
        page_number: pageNumber,
        page_size: pageSize
      });

      if (result === null) {
        break;
      }

      finalRules.push(...result.rules);

      if (result.rules.length < pageSize) {
        break;
      }

      pageNumber++;
    }

    jsonRes(res, { code: 200, data: finalRules });
  } catch (error) {
    console.log(error);
    jsonRes(res, { code: 500, message: 'get expansion rule error' });
  }
}
