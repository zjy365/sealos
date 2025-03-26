import { CronJobStatus } from '@/services/backend/cronjob/index';
import { getRegionUid } from '@/services/enable';
import { DeleteUserEvent, SyncUserPlanEvent } from '@/types/db/event';
import { TransactionStatus, TransactionType } from 'prisma/global/generated/client';
import { JoinStatus, Role } from 'prisma/region/generated/client';
import { globalPrisma, prisma } from '../db/init';
import { setUserDelete, setUserWorkspaceLock as setWorkspaceLock } from '../kubernetes/admin';
import {
  SyncUserPlanTransactionInfo,
  SyncUserPlanTransactionInfoSchema
} from '@/types/db/transcationInfo';
import { modifyWorkspaceRole, unbindingRole } from '../team';
import { Select } from '@chakra-ui/react';
import { roleToUserRole } from '@/utils/tools';

export class SyncUserPlanCrJob implements CronJobStatus<SyncUserPlanTransactionInfo> {
  private info: SyncUserPlanTransactionInfo;
  transactionType = TransactionType.DELETE_USER;
  private regionUid: string;
  UNIT_TIMEOUT = 3000;
  COMMIT_TIMEOUT = 30000;
  constructor(private transactionUid: string, info: unknown) {
    this.info = SyncUserPlanTransactionInfoSchema.parse(info);
    this.regionUid = getRegionUid();
  }
  async init() {
    if (!this.info || this.transactionUid || !this.regionUid)
      throw new Error('the transaction info not found');
  }
  async unit() {
    await this.init();
    const userUid = this.info.userUid;
    const userStauts = await globalPrisma.user.findUniqueOrThrow({
      where: {
        uid: userUid
      },
      select: {
        subscription: {
          select: {
            subscriptionPlan: {
              select: {
                max_seats: true,
                max_workspaces: true,
                max_resources: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (userStauts.subscription?.subscriptionPlan.name !== 'Free')
      throw Error('not supported other plan');
    // 获取当前workspace 状况
    const workspaceUsage = await globalPrisma.workspaceUsage.findMany({
      where: {
        userUid,
        regionUid: this.regionUid
      }
    });
    if (workspaceUsage.length < 1) {
      // 直接成功，可用区并没有多余的worksapce
      await globalPrisma.eventLog.create({
        data: {
          eventName: SyncUserPlanEvent['<SYNC_PLAN>_SET_LOCK_WORKSPACE'],
          mainId: userUid,
          data: JSON.stringify({
            userUid,
            regionUid: getRegionUid(),
            message: `Because the workspaceUsage is not found, deleting user success`
          })
        }
      });
      return;
    }

    // lock owner workspace
    const userCr = await prisma.userCr.findUnique({
      where: { userUid },
      select: {
        uid: true,
        crName: true,
        userWorkspace: {
          select: {
            workspace: {
              select: {
                uid: true,
                id: true
              }
            },
            isPrivate: true,
            status: true,
            role: true
          }
        }
      }
    });
    if (!userCr) {
      await globalPrisma.eventLog.create({
        data: {
          eventName: SyncUserPlanEvent['<SYNC_PLAN>_SET_LOCK_WORKSPACE'],
          mainId: userUid,
          data: JSON.stringify({
            userUid,
            regionUid: getRegionUid(),
            message: `Because the userCR is not found, deleting user success`
          })
        }
      });
      return;
      // throw new Error('the userCR not found');
    } // lock owner workspace
    const notprivateWorkspaceResultList = userCr.userWorkspace.filter(
      (item) => item.role === Role.OWNER && item.status === 'IN_WORKSPACE' && !item.isPrivate
    );
    // 清理workspace
    await Promise.all(
      notprivateWorkspaceResultList
        .map((r) => r.workspace)
        .filter((w) => w.uid)
        .map(async (workspace) => {
          await setWorkspaceLock(workspace.id);
          // kick out all user workspace
          // 幂等
          await prisma.userWorkspace.updateMany({
            where: {
              workspaceUid: workspace.uid
            },
            data: {
              status: JoinStatus.NOT_IN_WORKSPACE
            }
          });
          // 提交状态, 防止异常导致重复执行
          await globalPrisma.$transaction(async (tx) => {
            const workspaceUsage = await tx.workspaceUsage.findUnique({
              where: {
                regionUid_userUid_workspaceUid: {
                  regionUid: this.regionUid,
                  userUid,
                  workspaceUid: workspace.uid
                }
              }
            });
            // 如不存在则跳过
            if (!!workspaceUsage)
              await tx.workspaceUsage.delete({
                where: {
                  regionUid_userUid_workspaceUid: {
                    regionUid: this.regionUid,
                    userUid,
                    workspaceUid: workspace.uid
                  }
                }
              }),
                await tx.eventLog.create({
                  data: {
                    eventName: SyncUserPlanEvent['<SYNC_PLAN>_SET_LOCK_WORKSPACE'],
                    mainId: userUid,
                    data: JSON.stringify({
                      userUid,
                      userCrName: userCr.crName,
                      workspaceId: workspace.id,
                      regionUid: this.regionUid,
                      message: `success`
                    })
                  }
                });
          });
        })
    );
    const privateWorkspaceList = userCr.userWorkspace
      .filter(
        (item) => item.role === Role.OWNER && item.status === 'IN_WORKSPACE' && item.isPrivate
      )
      .map((r) => r.workspace);
    let privateWorkspace: (typeof privateWorkspaceList)[number];
    if (privateWorkspaceList.length === 0) return;
    else privateWorkspace = privateWorkspaceList[0];
    // 清理 private workspace seat
    const privateWorkspaceRelateionList = await prisma.userWorkspace.findMany({
      where: {
        workspaceUid: privateWorkspace.uid,
        status: 'IN_WORKSPACE',
        userCrUid: {
          not: userCr.uid
        }
      },
      select: {
        userCr: {
          select: {
            crName: true,
            uid: true
          }
        },
        role: true
      }
    });
    await Promise.all(
      privateWorkspaceRelateionList.map(async (r) => {
        const { role, userCr } = r;
        await modifyWorkspaceRole({
          k8s_username: userCr.crName,
          role: roleToUserRole(role),
          action: 'Deprive',
          workspaceId: privateWorkspace.id,
          pre_role: roleToUserRole(role)
        });
        await prisma.userWorkspace.update({
          where: {
            workspaceUid_userCrUid: {
              workspaceUid: privateWorkspace.uid,
              userCrUid: userCr.uid
            }
          },
          data: {
            status: 'NOT_IN_WORKSPACE'
          }
        });
        // 一个事务，保证seat 更新不被抢占
        await globalPrisma.$transaction(async (tx) => {
          const ownerStatus = await tx.workspaceUsage.findUnique({
            where: {
              regionUid_userUid_workspaceUid: {
                regionUid: this.regionUid,
                // 当前user
                userUid: userUid,
                workspaceUid: privateWorkspace.uid
              }
            },
            select: {
              seat: true
            }
          });
          if (!ownerStatus) {
            // 估计被其他优先级更高的操作给删除!
            // await globalPrisma.workspaceUsage.update({
            //   where: {
            //     regionUid_userUid_workspaceUid: {
            //       userUid: ownerStatus.userUid,
            //       workspaceUid: privateWorkspace.uid,
            //       regionUid: this.regionUid
            //     }
            //   },
            //   data: {
            //     seat: ownerStatus.seat > 1 ? ownerStatus.seat - 1 : 1
            //   }
            // });
            return;
            // throw new Error('no owner status in workspace');
          }
          await globalPrisma.workspaceUsage.update({
            where: {
              regionUid_userUid_workspaceUid: {
                userUid: userUid,
                workspaceUid: privateWorkspace.uid,
                regionUid: this.regionUid
              }
            },
            data: {
              seat: ownerStatus.seat > 1 ? ownerStatus.seat - 1 : 1
            }
          });
        });
      })
    );
    const region = await globalPrisma.region.findUnique({
      where: {
        uid: this.regionUid
      }
    });
    if (!region) throw new Error('region not found');
    // 创建 workspace quota
    await globalPrisma.$transaction(async (tx) => {
      // find task
      const result = await globalPrisma.accountRegionUserTask.findFirst({
        where: {
          user_uid: userUid,
          region_domain: region.domain,
          status: 'pending',
          type: 'flush-quota'
        },
        select: {
          id: true
        }
      });
      if (!!result) return;
      await globalPrisma.accountRegionUserTask.create({
        data: {
          region_domain: region.domain,
          user_uid: userUid
        }
      });
      await globalPrisma.eventLog.create({
        data: {
          eventName: SyncUserPlanEvent['<SYNC_PLAN>_UPDATE_SEAT'],
          mainId: userUid,
          data: JSON.stringify({
            userUid,
            regionUid: getRegionUid(),
            message: `kick off success`
          })
        }
      });
    });
  }
  canCommit() {
    return true;
  }
  async commit() {
    await this.init();
    const userUid = this.info.userUid;
    await globalPrisma.$transaction([
      globalPrisma.commitTransactionSet.create({
        data: {
          precommitTransactionUid: this.transactionUid
        }
      }),
      globalPrisma.eventLog.create({
        data: {
          eventName: SyncUserPlanEvent['<SYNC_PLAN>_COMMIT'],
          mainId: userUid,
          data: JSON.stringify({
            userUid,
            message: `sync user plan success`
          })
        }
      }),
      globalPrisma.precommitTransaction.findUniqueOrThrow({
        where: {
          uid: this.transactionUid,
          status: TransactionStatus.FINISH
        }
      }),
      globalPrisma.precommitTransaction.update({
        where: {
          uid: this.transactionUid,
          status: TransactionStatus.FINISH
        },
        data: {
          status: TransactionStatus.COMMITED
        }
      })
    ]);
  }
}
