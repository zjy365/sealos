import { verifyAccessToken } from '@/services/backend/auth';
import { globalPrisma } from '@/services/backend/db/init';
import { jsonRes } from '@/services/backend/response';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload = await verifyAccessToken(req.headers);
    if (!payload) return jsonRes(res, { code: 401, message: 'token is invalid' });
    const status = await globalPrisma.account.findUnique({
      where: {
        userUid: payload.userUid
      }
    });
    if (!status) return jsonRes(res, { code: 404, message: 'user is not found' });

    // GET method continues with the existing code
    const referral = await globalPrisma.referral.findUnique({
      where: { user_uid: payload.userUid, available: true },
      select: { code: true }
    });

    if (!referral) return jsonRes(res, { code: 404, message: 'Referral code not found' });

    const referralLink = `https://${global.AppConfig?.cloud.domain}/signin?referralCode=${referral.code}`;

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
