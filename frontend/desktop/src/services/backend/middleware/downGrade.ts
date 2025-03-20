import { createMiddleware } from '@/utils/factory';
import { jsonRes } from '../response';
import { globalPrisma, prisma } from '../db/init';
import { AccessTokenPayload } from '@/types/token';

export const checkUserPlanAllRegionMiddleware = createMiddleware<
  AccessTokenPayload,
  {
    allWorkspaceReady: boolean;
    seatReady: boolean;
  }
>(async ({ req, res, next, ctx }) => {
  const { userUid } = ctx;
  // 查询当前用户的SubscriptionPlan，获取maximum workspace和seat限制
  const userResult = await globalPrisma.user.findUnique({
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
      WorkspaceUsage: {
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
  const workspaceUsage = userResult.WorkspaceUsage;
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

  // 检查结果
  await next({
    // 应该是要看
    allWorkspaceReady: Object.values(groupedWorkspaceUsage).every(
      (w) => BigInt(w.workspaces.length) <= BigInt(max_workspaces)
    ),
    seatReady: workspaceUsage.every((w) => BigInt(w.seat) <= BigInt(max_seats))
  });
});
