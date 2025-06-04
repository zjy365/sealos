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

    return jsonRes(res, {
      code: 200,
      message: 'Successfully',
      data: userInfo
    });
  } catch (err) {
    console.log(err);
    return jsonRes(res, {
      message: 'Failed to get user info',
      code: 500
    });
  }
}
