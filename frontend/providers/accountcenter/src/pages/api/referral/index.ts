import { authSession } from '@/service/backend/auth';
import { AccessTokenPayload } from '@/service/auth';
import { globalPrisma } from '@/service/backend/db/init';
import { jsonRes } from '@/service/backend/response';
import { HttpStatusCode } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let payload: AccessTokenPayload;
  try {
    payload = await authSession(req.headers);
  } catch {
    jsonRes(res, { code: HttpStatusCode.Unauthorized, message: HttpStatusCode[401] });
    return;
  }

  try {
    const status = await globalPrisma.user.findUnique({
      where: {
        uid: payload.userUid
      }
    });
    if (!status) return jsonRes(res, { code: 404, message: 'user is not found' });

    // GET method continues with the existing code
    const referral = await globalPrisma.referral.findUnique({
      where: { uid: payload.userUid, available: true, verify: true },
      select: { code: true }
    });

    if (!referral) return jsonRes(res, { code: 404, message: 'Referral code not found' });

    let domain = process.env.CLAWCLOUD_RUN_DOMAIN || 'not_config';
    const referralLink = `https://${domain}/signin?referralCode=${referral.code}`;

    return jsonRes(res, {
      data: {
        code: referral.code,
        link: referralLink
      }
    });
  } catch (error) {
    console.log(error);
    jsonRes(res, { code: 500, data: 'get referral link error' });
  }
}
