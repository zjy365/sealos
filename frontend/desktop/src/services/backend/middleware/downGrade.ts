import { createMiddleware } from '@/utils/factory';
import { jsonRes } from '../response';
import { globalPrisma, prisma } from '../db/init';
import { AccessTokenPayload, DownGradeTokenPayload } from '@/types/token';
import { WorkspaceUsage } from 'prisma/global/generated/client';
import { isWithinLimit } from '@/utils/tools';

export const checkUserPlanAllRegionMiddleware = createMiddleware<
  { subscriptionPlanId: string; payload: DownGradeTokenPayload },
  {
    allWorkspaceReady: boolean;
    seatReady: boolean;
    max_workspace: number;
    max_seat: number;
    groupedWorkspaceUsage: any;
  }
>(async ({ req, res, next, ctx }) => {
  const { subscriptionPlanId, payload } = ctx;
  const { userUid } = payload;
  // 查询当前用户的SubscriptionPlan，获取maximum workspace和seat限制
  const [userResult, subscriptionPlan] = await globalPrisma.$transaction([
    globalPrisma.user.findUnique({
      where: { uid: userUid },
      select: {
        WorkspaceUsage: {
          select: {
            regionUid: true,
            workspaceUid: true,
            seat: true
          }
        }
      }
    }),
    globalPrisma.subscriptionPlan.findUnique({
      where: { id: subscriptionPlanId },
      select: {
        max_workspaces: true,
        max_seats: true
      }
    })
  ]);
  if (!subscriptionPlan) {
    return jsonRes(res, { code: 404, message: 'Subscription not found' });
  }
  if (!userResult) {
    return jsonRes(res, { code: 404, message: 'User not found' });
  }
  const { max_workspaces, max_seats } = subscriptionPlan;
  const workspaceUsage = userResult.WorkspaceUsage;
  const groupedWorkspaceUsage = workspaceUsage.reduce<{
    [key: string]: {
      workspaces: Pick<WorkspaceUsage, 'workspaceUid' | 'seat'>[];
    };
  }>((acc, usage) => {
    if (!acc[usage.regionUid]) {
      acc[usage.regionUid] = { workspaces: [] };
    }
    acc[usage.regionUid].workspaces.push({ ...usage });
    return acc;
  }, {});

  // 检查结果
  await next({
    // 应该是要看
    allWorkspaceReady: Object.values(groupedWorkspaceUsage).every((w) =>
      isWithinLimit(w.workspaces.length, Number(max_workspaces))
    ),
    seatReady: workspaceUsage.every((w) => isWithinLimit(w.seat, Number(max_seats))),
    max_workspace: Number(max_workspaces),
    max_seat: Number(max_seats),
    groupedWorkspaceUsage
  });
});
