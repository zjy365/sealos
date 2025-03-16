import { reciveAction } from '@/api/namespace';
import { jsonRes } from '@/services/backend/response';
import { modifyWorkspaceRole } from '@/services/backend/team';
import { NextApiRequest, NextApiResponse } from 'next';
import { globalPrisma, prisma } from '@/services/backend/db/init';
import { UserRoleToRole } from '@/utils/tools';
import { JoinStatus } from 'prisma/region/generated/client';
import { verifyAccessToken } from '@/services/backend/auth';
import { findInviteCode } from '@/services/backend/db/workspaceInviteCode';
import { getRegionUid } from '@/services/enable';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload = await verifyAccessToken(req.headers);
    if (!payload) return jsonRes(res, { code: 401, message: 'token verify error' });

    const { code, action } = req.body as { code?: string; action?: reciveAction };

    if (!code) return jsonRes(res, { code: 400, message: 'code is invalid' });

    if (action === undefined || ![reciveAction.Accepte, reciveAction.Reject].includes(action))
      return jsonRes(res, {
        code: 400,
        message: `action must be ${reciveAction.Accepte}, ${reciveAction.Reject}`
      });
    if (action === reciveAction.Accepte) {
      const linkResults = await findInviteCode(code);
      if (!linkResults) return jsonRes(res, { code: 404, message: 'the link is not found' });
      const queryResults = await prisma.userWorkspace.findMany({
        where: {
          workspaceUid: linkResults.workspaceUid,
          userCrUid: {
            in: [linkResults.inviterCrUid, payload.userCrUid]
          },
          status: JoinStatus.IN_WORKSPACE
        },
        include: {
          workspace: true,
          userCr: true
        }
      });
      const inviteeStatus = queryResults.find((item) => item.userCrUid === payload.userCrUid);
      if (inviteeStatus)
        return jsonRes(res, { code: 409, message: 'you are already in namespace' });
      const inviterStatus = queryResults.find((r) => r.userCrUid === linkResults.inviterCrUid);
      if (!inviterStatus)
        return jsonRes(res, { code: 404, message: 'the inviter or the namespace is not found' });
      // check owner plan
      const ownerResult = queryResults.find((qr) => qr.role === 'OWNER');
      if (!ownerResult) {
        throw new Error('no owner in workspace');
      }
      const regionUid = getRegionUid();
      const ownerState = await globalPrisma.user.findUnique({
        where: {
          uid: ownerResult.userCr.userUid
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
      if (!ownerState) return jsonRes(res, { code: 404, message: 'The targetUser is not found' });

      if (!ownerState.subscription)
        return jsonRes(res, { code: 403, message: 'The targetUser is not subscribed' });
      const ownerWorkspaceState = ownerState.WorkspaceUsage.find(
        (usage) => usage.workspaceUid === ownerResult.workspace.uid && usage.regionUid === regionUid
      );
      if (!ownerWorkspaceState)
        return jsonRes(res, {
          code: 403,
          message: 'The  owner of workspace is not a member of the workspace'
        });
      const seat = ownerWorkspaceState.seat;
      const maxSeat = ownerState.subscription.subscriptionPlan.max_seats;
      if (seat >= maxSeat)
        return jsonRes(res, {
          code: 403,
          message: 'The owner has reached the maximum number of workspaces'
        });

      await modifyWorkspaceRole({
        k8s_username: payload.userCrName,
        role: linkResults.role,
        workspaceId: inviterStatus.workspace.id,
        action: 'Grant'
      });
      const result = await prisma.userWorkspace.create({
        data: {
          status: JoinStatus.IN_WORKSPACE,
          role: UserRoleToRole(linkResults.role),
          isPrivate: false,
          workspaceUid: linkResults.workspaceUid,
          userCrUid: payload.userCrUid,
          joinAt: new Date(),
          handlerUid: linkResults.inviterUid
        }
      });
      // sync status, user add 1,
      await globalPrisma.workspaceUsage.update({
        where: {
          regionUid_userUid_workspaceUid: {
            userUid: payload.userUid,
            workspaceUid: linkResults.workspaceUid,
            regionUid
          }
        },
        data: {
          seat: seat - 1 > 0 ? seat - 1 : 0
        }
      });
      if (!result) throw new Error('failed to change Status');
    }
    return jsonRes(res, {
      code: 200,
      message: 'Successfully'
    });
  } catch (e) {
    console.log(e);
    return jsonRes(res, { code: 500, message: 'get price error' });
  }
}
