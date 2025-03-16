import { verifyAccessToken } from '@/services/backend/auth';
import { globalPrisma, prisma } from '@/services/backend/db/init';
import { getTeamKubeconfig } from '@/services/backend/kubernetes/admin';
import { GetUserDefaultNameSpace } from '@/services/backend/kubernetes/user';
import { get_k8s_username } from '@/services/backend/regionAuth';
import { jsonRes } from '@/services/backend/response';
import { bindingRole, modifyWorkspaceRole } from '@/services/backend/team';
import { getRegionUid, getTeamLimit } from '@/services/enable';
import { NSType, NamespaceDto, UserRole } from '@/types/team';
import { NextApiRequest, NextApiResponse } from 'next';

// const TEAM_LIMIT = getTeamLimit();
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload = await verifyAccessToken(req.headers);
    if (!payload) return jsonRes(res, { code: 401, message: 'token verify error' });
    const { teamName } = req.body as { teamName?: string };
    if (!teamName) return jsonRes(res, { code: 400, message: 'teamName is required' });
    const currentNamespaces = await prisma.userWorkspace.findMany({
      where: {
        userCrUid: payload.userCrUid,
        status: 'IN_WORKSPACE'
      },
      include: {
        workspace: {
          select: {
            displayName: true
          }
        }
      }
    });
    // 校验user 套餐
    const userState = await globalPrisma.user.findUnique({
      where: {
        uid: payload.userUid
      },
      select: {
        WorkspaceUsage: true,
        subscription: {
          select: {
            subscriptionPlan: {
              select: {
                max_seats: true,
                max_workspaces: true
              }
            }
          }
        }
      }
    });
    if (!userState) return jsonRes(res, { code: 404, message: 'The targetUser is not found' });

    if (!userState.subscription)
      return jsonRes(res, { code: 403, message: 'The targetUser is not subscribed' });
    if (
      userState.WorkspaceUsage.filter((usage) => usage.regionUid === getRegionUid()).length >=
      userState.subscription.subscriptionPlan.max_workspaces
    )
      return jsonRes(res, {
        code: 403,
        message: 'The targetUser has reached the maximum number of workspaces'
      });
    const workspaceCount = userState.WorkspaceUsage.filter(
      (usage) => usage.regionUid === regionUid
    ).length;
    const workspaceMaxCount = userState.subscription.subscriptionPlan.max_workspaces;
    if (workspaceCount >= workspaceMaxCount) {
      return jsonRes(res, {
        code: 403,
        message: 'The targetUser has reached the maximum number of workspaces'
      });
    }
    // 校验 同名 workspace
    const alreadyNamespace = currentNamespaces.findIndex((utn) => {
      const res = utn.workspace.displayName === teamName;
      return res;
    });
    if (alreadyNamespace > -1)
      return jsonRes(res, { code: 409, message: 'The team is already exist' });
    const user = await prisma.userCr.findUnique({
      where: {
        userUid: payload.userUid,
        uid: payload.userCrUid
      }
    });
    if (!user) throw new Error('fail to get user');
    const workspace_creater = await get_k8s_username();
    if (!workspace_creater) throw new Error('fail to get workspace_creater');
    const workspaceId = GetUserDefaultNameSpace(workspace_creater);
    // 创建伪user
    const creater_kc_str = await getTeamKubeconfig(workspace_creater, payload.userCrName);
    if (!creater_kc_str) throw new Error('fail to get kubeconfig');
    const workspace = await prisma.workspace.create({
      data: {
        id: workspaceId,
        displayName: teamName
      }
    });
    if (!workspace) throw new Error(`failed to create namespace: ${workspaceId}`);
    // 分配owner权限
    const utnResult = await bindingRole({
      userCrUid: user.uid,
      ns_uid: workspace.uid,
      role: UserRole.Owner,
      direct: true
    });
    if (!utnResult) throw new Error(`fail to binding namesapce: ${workspace.id}`);
    await modifyWorkspaceRole({
      role: UserRole.Owner,
      action: 'Create',
      workspaceId,
      k8s_username: payload.userCrName
    });
    const regionUid = getRegionUid();
    // sync status, user add 1,
    await globalPrisma.workspaceUsage.create({
      data: {
        userUid: payload.userUid,
        workspaceUid: workspace.uid,
        seat: 1,
        regionUid
      }
    });

    jsonRes<{ namespace: NamespaceDto }>(res, {
      code: 200,
      message: 'Successfully',
      data: {
        namespace: {
          role: UserRole.Owner,
          createTime: workspace.createdAt,
          uid: workspace.uid,
          id: workspace.id,
          nstype: NSType.Team,
          teamName: workspace.displayName
        }
      }
    });
  } catch (e) {
    console.log(e);
    jsonRes(res, { code: 500, message: 'failed to create team' });
  }
}
