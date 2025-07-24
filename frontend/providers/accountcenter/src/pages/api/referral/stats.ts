import { AccessTokenPayload } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { globalPrisma } from '@/service/backend/db/init';
import { jsonRes } from '@/service/backend/response';
import { HttpStatusCode } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

async function calculateReward(referral_id: string) {
  const referral = await globalPrisma.referral.findFirst({
    where: { id: referral_id },
    select: { created_at: true, rewards: true }
  });

  return referral?.rewards.map((reward) => ({ redeem_at: reward.created_at })) || [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let payload: AccessTokenPayload;
  try {
    payload = await authSession(req.headers);
  } catch {
    jsonRes(res, { code: HttpStatusCode.Unauthorized, message: HttpStatusCode[401] });
    return;
  }

  try {
    if (!payload) return jsonRes(res, { code: 401, message: 'token is invalid' });
    const status = await globalPrisma.account.findUnique({
      where: {
        userUid: payload.userUid
      }
    });
    if (!status) return jsonRes(res, { code: 404, message: 'user is not found' });

    const referral = await globalPrisma.referral.findUnique({
      where: { uid: payload.userUid, available: true },
      select: { id: true }
    });

    if (!referral) return jsonRes(res, { code: 404, message: 'Referral code not found' });

    const inviteCount = await globalPrisma.referral.count({
      where: { referrer_id: referral.id, verify: true }
    });
    // const pendingCount = await globalPrisma.referral.count({
    //   where: { referrer_id: referral.id, used: false, verify: true }
    // });
    // const reward = await calculateReward(referral.id);

    const reward_count = await globalPrisma.referralReward.count({
      where: { referral_id: referral.id }
    });

    return jsonRes(res, {
      data: {
        total: inviteCount,
        // pending: pendingCount,
        // reward: reward,
        reward_count: reward_count
      }
    });
  } catch (error) {
    console.log(error);
    jsonRes(res, { code: 500, data: 'get referral stats error' });
  }
}
