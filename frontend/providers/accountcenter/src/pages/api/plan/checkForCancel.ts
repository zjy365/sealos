import { jsonRes } from '@/service/backend/response';
import type { NextApiRequest, NextApiResponse } from 'next';
import { authSession } from '@/service/backend/auth';
import { globalPrisma as prisma } from '@/service/backend/db/init';
import { UserStatus } from 'prsima/global/generated/client';
import { every } from 'lodash';
import { AccessTokenPayload } from '@/service/auth';
import { AxiosError, HttpStatusCode } from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 校验请求体
    let payload: AccessTokenPayload;
    try {
      payload = await authSession(req.headers);
    } catch {
      jsonRes(res, { code: HttpStatusCode.Unauthorized, message: HttpStatusCode[401] });
      return;
    }
    const userUid = payload.userUid;
    // 查询当前用户的SubscriptionPlan，获取maximum workspace和seat限制
    const userResult = await prisma.user.findUnique({
      where: { uid: userUid },
      select: {
        subscription: {
          select: {
            subscriptionPlan: {
              select: {
                max_workspaces: true,
                max_seats: true
              }
            }
          }
        },
        workspaceUsage: {
          select: {
            regionUid: true,
            workspaceUid: true,
            seat: true
          }
        }
      }
    });

    if (!userResult?.subscription) {
      return jsonRes(res, { code: 404, message: 'Subscription not found' });
    }

    const { max_workspaces, max_seats } = userResult.subscription.subscriptionPlan;

    const workspaceUsage = userResult.workspaceUsage;
    const groupedWorkspaceUsage = workspaceUsage.reduce<{
      [key: string]: {
        regionUid: string;
        workspaces: typeof workspaceUsage;
      };
    }>((acc, usage) => {
      if (!acc[usage.regionUid]) {
        acc[usage.regionUid] = { regionUid: usage.regionUid, workspaces: [] };
      }
      acc[usage.regionUid].workspaces.push({ ...usage });
      return acc;
    }, {});

    const totalWorkspaces = workspaceUsage.length;
    const totalSeats = workspaceUsage.reduce((acc, usage) => acc + usage.seat, 0);

    // 检查通过
    return jsonRes(res, {
      code: 200,
      data: {
        workspaceReady: Object.values(groupedWorkspaceUsage).every((w) => w.workspaces.length <= 1),
        seatReady: Object.values(groupedWorkspaceUsage).every((w) =>
          w.workspaces.every((u) => u.seat <= 1)
        )
      }
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return jsonRes(res, { code: error.status, message: error.response?.data.error });
    }
    console.error('Failed to check subscription cancellation:', error);
    return jsonRes(res, { code: 500, message: 'Internal Server Error' });
  }
}
