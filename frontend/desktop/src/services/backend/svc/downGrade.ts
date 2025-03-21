import { createMiddleware } from '@/utils/factory';
import { jsonRes } from '../response';
import { globalPrisma, prisma } from '../db/init';
import { AccessTokenPayload } from '@/types/token';
import { DeleteUserEvent } from '@/types/db/event';
import { RESOURCE_STATUS } from '@/types/response/checkResource';
import { DELETE_USER_STATUS } from '@/types/response/deleteUser';
import { UserStatus, TransactionStatus, TransactionType } from 'prisma/global/generated/client';
import { v4 } from 'uuid';
import { HttpStatusCode } from 'axios';
import { SYNC_PLAN_STATUS } from '@/types/response/syncPlan';

export const syncUserPlanSvc = createMiddleware<AccessTokenPayload>(
  async ({ req, res, next, ctx }) => {
    const { userUid } = ctx;
    const user = await globalPrisma.user.findUnique({
      where: {
        uid: userUid
      },
      select: {
        // WorkspaceUsage: true,
        subscription: {
          select: {
            subscriptionPlan: {
              select: {
                max_seats: true,
                max_workspaces: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!user)
      return jsonRes(res, {
        code: HttpStatusCode.NotFound,
        message: 'user not found'
      });
    if (user.subscription?.subscriptionPlan.name !== 'Free') {
      // throw new Error('User is already on free plan');
      return jsonRes(res, {
        code: HttpStatusCode.Conflict,
        message: 'not supported other plan for user'
      });
    }
    const txUid = v4();
    const regionResults = await globalPrisma.region.findMany();
    if (!regionResults) throw Error('region list is null');
    const regionList = regionResults.map((r) => r.uid);
    // add task ( catch by outer )
    await globalPrisma.$transaction(async (tx) => {
      await tx.precommitTransaction.create({
        data: {
          uid: txUid,
          status: TransactionStatus.READY,
          // infoUid,
          info: {
            userUid
          },
          transactionType: TransactionType.SYNC_PLAN
        }
      });
      await tx.transactionDetail.createMany({
        data: regionList.map((regionUid) => ({
          status: TransactionStatus.READY,
          transactionUid: txUid,
          regionUid
        }))
      });
    });
    return jsonRes(res, {
      message: SYNC_PLAN_STATUS.RESULT_SUCCESS,
      code: 200
    });
  }
);
