import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/services/backend/response';
import { globalPrisma } from '@/services/backend/db/init';
import { verifyAccessToken } from '@/services/backend/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const regionUser = await verifyAccessToken(req.headers);
    if (!regionUser)
      return jsonRes(res, {
        code: 401,
        message: 'invalid token'
      });

    const userInfo = await globalPrisma.user.findUniqueOrThrow({
      where: {
        uid: regionUser.userUid
      },
      select: {
        subscription: {
          select: {
            subscriptionPlan: {
              select: {
                name: true,
                max_seats: true,
                max_workspaces: true
              }
            },
            status: true
          }
        }
      }
    });

    // fix json parse bigint error
    const userObj = {
      subscription: {
        subscriptionPlan: {
          name: userInfo.subscription?.subscriptionPlan?.name,
          max_seats: Number(userInfo.subscription?.subscriptionPlan?.max_seats) || 1,
          max_workspaces: Number(userInfo.subscription?.subscriptionPlan?.max_workspaces) || 1
        },
        status: userInfo.subscription?.status
      }
    };

    return jsonRes(res, {
      code: 200,
      message: 'Successfully',
      data: userObj
    });
  } catch (err) {
    console.log(err);
    return jsonRes(res, {
      message: 'Failed to get user info',
      code: 500
    });
  }
}
