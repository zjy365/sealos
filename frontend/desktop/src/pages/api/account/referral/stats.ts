import { verifyAccessToken } from '@/services/backend/auth';
import { globalPrisma } from '@/services/backend/db/init';
import { jsonRes } from '@/services/backend/response';
import type { NextApiRequest, NextApiResponse } from 'next';

async function calculateReward(referral_id: number) {
  const referral = await globalPrisma.referral.findFirst({
    where: { id: referral_id },
    select: { created_at: true, rewards: true }
  });

  return referral?.rewards.map((reward) => ({ redeem_at: reward.created_at })) || [];
}

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

    const referral = await globalPrisma.referral.findUnique({
      where: { user_uid: payload.userUid, available: true },
      select: { id: true }
    });

    if (!referral) return jsonRes(res, { code: 404, message: 'Referral code not found' });

    const inviteCount = await globalPrisma.referral.count({
      where: { referrer_id: referral.id }
    });

    const pendingCount = await globalPrisma.referral.count({
      where: { referrer_id: referral.id, used: false }
    });

    const reward = await calculateReward(referral.id);

    return jsonRes(res, {
      data: {
        total: inviteCount,
        pending: pendingCount,
        reward
      }
    });
  } catch (error) {
    console.log(error);
    jsonRes(res, { code: 500, data: 'get referral stats error' });
  }
}
