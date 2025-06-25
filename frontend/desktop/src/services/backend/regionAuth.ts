import { getUserKubeconfig } from '@/services/backend/kubernetes/admin';
import { globalPrisma, prisma } from '@/services/backend/db/init';
import { getRegionUid } from '@/services/enable';
import { GetUserDefaultNameSpace } from '@/services/backend/kubernetes/user';
import { customAlphabet } from 'nanoid';
import { retrySerially } from '@/utils/tools';
import { AccessTokenPayload } from '@/types/token';
import { JoinStatus, Role } from 'prisma/region/generated/client';
import { generateAccessToken, generateAppToken } from '@/services/backend/auth';
import { K8sApiDefault } from '@/services/backend/kubernetes/admin';
import { CreateSignUpReferralNotificationIfNotExists } from '@/services/backend/kubernetes/user';
import { v4 } from 'uuid';
import { HttpStatusCode } from 'axios';
import { TloginFailureMessage, loginFailureCounter } from './promtheus/loginFailureCounter';

const LetterBytes = 'abcdefghijklmnopqrstuvwxyz0123456789';
const HostnameLength = 8;

const nanoid = customAlphabet(LetterBytes, HostnameLength);

export async function get_k8s_username() {
  return await retrySerially<string | null>(async () => {
    const crName = nanoid();
    const result = await prisma.userCr.findUnique({
      where: {
        crName
      }
    });
    if (!result) return crName;
    else return Promise.reject(null);
  }, 3);
}

export async function getRegionToken({
  userUid,
  userId
}: {
  userUid: string;
  userId: string;
}): Promise<{
  kubeconfig: string;
  token: string;
  appToken: string;
} | null> {
  const region = await globalPrisma.region.findUnique({
    where: {
      uid: getRegionUid()
    }
  });

  if (!region) {
    const failureMessage: TloginFailureMessage = 'The REGION_UID is undefined';
    loginFailureCounter
      .labels('unknown', failureMessage, '' + HttpStatusCode['InternalServerError'])
      .inc();
    throw Error('The REGION_UID is undefined');
  }

  const result = await retrySerially(async () => {
    const userResult = await globalPrisma.user.findUnique({
      where: {
        uid: userUid
      },
      select: {
        userInfo: {
          select: {
            isInited: true
          }
        },
        WorkspaceUsage: true
      }
    });
    // 没有该user
    if (!userResult?.userInfo) {
      const failureMessage: TloginFailureMessage = 'user not found';
      loginFailureCounter.labels('unknown', failureMessage, '' + HttpStatusCode['NotFound']).inc();
      return null;
    }
    // 还没初始化，不应该允许调用该接口
    if (!userResult.userInfo.isInited) {
      const failureMessage: TloginFailureMessage = 'user not initialized';
      loginFailureCounter
        .labels('unknown', failureMessage, '' + HttpStatusCode['InternalServerError'])
        .inc();
      return null;
    }

    let workspaceUid = v4();
    let curRegionWorkspaceUsage = userResult.WorkspaceUsage.filter(
      (u) => u.regionUid == region.uid
    );
    let needCreating = curRegionWorkspaceUsage.length === 0;

    // 先处理全局状态
    if (!needCreating) {
      // 找最早的工作空间 = privaite
      curRegionWorkspaceUsage.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      // 当前可用区初始化中，用幂等逻辑
      const globalWorkspaceUid = curRegionWorkspaceUsage[0].workspaceUid;

      // 数据一致性验证：检查区域数据库中是否真的存在这个workspaceUid
      try {
        const actualPrivateWorkspace = await prisma.userWorkspace.findFirst({
          where: {
            userCr: { userUid },
            isPrivate: true,
            status: 'IN_WORKSPACE'
          },
          include: {
            workspace: true,
            userCr: true
          }
        });

        if (actualPrivateWorkspace) {
          if (actualPrivateWorkspace.workspaceUid !== globalWorkspaceUid) {
            // 自动修复全局数据库记录
            await globalPrisma.workspaceUsage.update({
              where: {
                regionUid_userUid_workspaceUid: {
                  regionUid: region.uid,
                  userUid,
                  workspaceUid: globalWorkspaceUid
                }
              },
              data: {
                workspaceUid: actualPrivateWorkspace.workspaceUid
              }
            });

            console.log('[RegionAuth] WorkspaceUid auto-fixed successfully', {
              userUid,
              oldWorkspaceUid: globalWorkspaceUid,
              newWorkspaceUid: actualPrivateWorkspace.workspaceUid
            });

            // 使用正确的workspaceUid
            workspaceUid = actualPrivateWorkspace.workspaceUid;
          } else {
            // 数据一致，使用全局记录的workspaceUid
            workspaceUid = globalWorkspaceUid;
          }
        } else {
          console.error('[RegionAuth] No private workspace found in region database');
          workspaceUid = globalWorkspaceUid;
        }
      } catch (regionDbError) {
        console.error('[RegionAuth] Failed to verify workspace consistency:', regionDbError);
        workspaceUid = globalWorkspaceUid;
      }
    } else {
      // 需要创建新的WorkspaceUsage记录
      await globalPrisma.workspaceUsage.create({
        data: {
          workspaceUid,
          userUid,
          regionUid: region.uid,
          seat: 1
        }
      });
    }

    const payload = await prisma.$transaction(async (tx): Promise<AccessTokenPayload | null> => {
      let userCrResult = await tx.userCr.findUnique({
        where: {
          userUid
        },
        include: {
          userWorkspace: {
            include: {
              workspace: true
            }
          }
        }
      });

      if (userCrResult) {
        // get a exist user
        const relations = userCrResult.userWorkspace!;
        const privateRelation = relations.find((r) => r.isPrivate);

        if (privateRelation?.workspaceUid !== workspaceUid) {
          // 不匹配的未知错误
          console.error('workspaceUid not match, workspaceUid:', workspaceUid);
          return null;
        }

        return {
          userUid: userCrResult.userUid,
          userCrUid: userCrResult.uid,
          userCrName: userCrResult.crName,
          regionUid: region.uid,
          userId,
          // there is only one private workspace
          workspaceId: privateRelation!.workspace.id,
          workspaceUid: privateRelation!.workspace.uid
        };
      } else {
        // 创建新用户资源
        const crName = nanoid();
        const regionResult = await tx.userCr.findUnique({
          where: {
            userUid
          }
        });
        if (regionResult) throw Error('the user is already exist');

        const workspaceId = GetUserDefaultNameSpace(crName);
        const result = await tx.userWorkspace.create({
          data: {
            status: JoinStatus.IN_WORKSPACE,
            role: Role.OWNER,
            workspace: {
              create: {
                uid: workspaceUid,
                id: workspaceId,
                displayName: 'private team'
              }
            },
            userCr: {
              create: {
                crName,
                userUid
              }
            },
            joinAt: new Date(),
            isPrivate: true
          },
          include: {
            userCr: {
              select: {
                uid: true,
                crName: true,
                userUid: true
              }
            },
            workspace: {
              select: {
                id: true,
                uid: true
              }
            }
          }
        });

        return {
          userCrName: result.userCr.crName,
          userCrUid: result.userCr.uid,
          userUid: result.userCr.userUid,
          regionUid: region.uid,
          userId,
          // there is only one private workspace
          workspaceId: result.workspace.id,
          workspaceUid: result.workspace.uid
        };
      }
    });

    if (!payload) {
      const failureMessage: TloginFailureMessage = 'failed to get user from db';
      loginFailureCounter
        .labels('unknown', failureMessage, '' + HttpStatusCode['InternalServerError'])
        .inc();
      throw new Error('Failed to get user from db');
    }

    const kubeconfig = await getUserKubeconfig(payload.userCrUid, payload.userCrName);
    if (!kubeconfig) {
      const failureMessage: TloginFailureMessage = 'failed to get user from k8s';
      loginFailureCounter
        .labels('unknown', failureMessage, '' + HttpStatusCode['InternalServerError'])
        .inc();
      throw new Error('Failed to get user from k8s');
    }

    return {
      kubeconfig,
      payload
    };
  }, 3);

  if (!result) return null;
  const { kubeconfig, payload } = result;
  return {
    kubeconfig,
    token: generateAccessToken(payload),
    appToken: generateAppToken(payload)
  };
}

async function createFirstSignUpNotification(workspaceId: string) {
  try {
    const defaultKc = K8sApiDefault();
    await CreateSignUpReferralNotificationIfNotExists(defaultKc, workspaceId);
  } catch (err) {
    console.error('Error occurred while creating first sign up notification:', err);
  }
}

export async function initRegionToken({
  userUid,
  userId,
  regionUid,
  workspaceName
}: {
  userUid: string;
  userId: string;
  regionUid: string;
  workspaceName: string;
}): Promise<{
  kubeconfig: string;
  token: string;
  appToken: string;
} | null> {
  const region = await globalPrisma.region.findUnique({
    where: {
      uid: regionUid
    }
  });
  if (!region) {
    const failureMessage: TloginFailureMessage = 'The REGION_UID is undefined';
    loginFailureCounter
      .labels('unknown', failureMessage, '' + HttpStatusCode['InternalServerError'])
      .inc();
    throw Error('The REGION_UID is undefined');
  }
  const result = await retrySerially(async () => {
    const userResult = await globalPrisma.user.findUnique({
      where: {
        uid: userUid
      },
      select: {
        userInfo: {
          select: {
            isInited: true
          }
        },
        WorkspaceUsage: true
      }
    });
    // 没有该user
    if (!userResult?.userInfo) {
      console.log(`user  not found userUid:${userUid}`);
      return null;
    }
    // 先更新状态再操作，避免并发问题
    // isInited 是成功的时候， 考虑到 创建 workspce-user 步骤过多，
    // 先把状态同步到WorkspaceUsage,
    // 再执行操作，最后再标记为 isInited
    // 已经初始化，不应该允许调用该接口
    if (!!userResult.userInfo.isInited) {
      console.log(`user  already initialized userUid:${userUid}`);
      const failureMessage: TloginFailureMessage = 'user already initialized userUid';
      loginFailureCounter.labels('unknown', failureMessage, '' + HttpStatusCode['Conflict']).inc();
      return null;
    }
    // initalizing or error
    let isInitalizing = userResult.WorkspaceUsage.length > 0;
    let workspaceUid = v4();
    if (isInitalizing) {
      // 正在初始化中，还未完成/挂掉
      let workspaceUsage = userResult.WorkspaceUsage[0];
      if (workspaceUsage.regionUid !== region.uid) {
        // 其他可用区正在初始化
        console.log('other region is initializing');
        console.log(`user  already initialized userUid:${userUid}`);
        const failureMessage: TloginFailureMessage = 'other region is initializing';
        loginFailureCounter
          .labels('unknown', failureMessage, '' + HttpStatusCode['Conflict'])
          .inc();

        return null;
      } else {
        // 当前可用区初始化中，用幂等逻辑
        workspaceUid = workspaceUsage.workspaceUid;
      }
    } else {
      // 没开始，
      await globalPrisma.workspaceUsage.create({
        data: {
          workspaceUid,
          userUid,
          regionUid: region.uid,
          seat: 1
        }
      });
    }
    // try {
    // db操作 做不到事务，只能用幂等解决
    let firstSignUpWorkspaceId = '';
    const regionalDbResult = await prisma.$transaction(
      async (tx): Promise<AccessTokenPayload | null> => {
        //
        let userCrResult = await tx.userCr.findUnique({
          where: {
            userUid
          },
          include: {
            userWorkspace: {
              include: {
                workspace: true
              }
            }
          }
        });
        // userCrResult 隐含了最新的 isInitalizing 状态，停机导致异常也能包含在内
        if (userCrResult) {
          const relations = userCrResult.userWorkspace!;
          const privateRelation = relations.find((r) => r.isPrivate);
          if (privateRelation?.workspaceUid !== workspaceUid) {
            // 和workspaceUsage 记录的不一致, 未知错误
            console.error('workspaceUid not match, workspaceUid:', workspaceUid);
            return null;
          }
          return {
            userUid: userCrResult.userUid,
            userCrUid: userCrResult.uid,
            userCrName: userCrResult.crName,
            regionUid: region.uid,
            userId,
            workspaceId: privateRelation!.workspace.id,
            workspaceUid: privateRelation!.workspace.uid
          };
        } else {
          const crName = nanoid();
          const workspaceId = GetUserDefaultNameSpace(crName);
          firstSignUpWorkspaceId = workspaceId;
          const result = await tx.userWorkspace.create({
            data: {
              status: JoinStatus.IN_WORKSPACE,
              role: Role.OWNER,
              // workspaceUid,
              workspace: {
                create: {
                  // 保证和状态中的那个一样
                  uid: workspaceUid,
                  id: workspaceId,
                  displayName: workspaceName
                }
              },
              userCr: {
                create: {
                  crName,
                  userUid
                }
              },
              joinAt: new Date(),
              isPrivate: true
            },
            include: {
              userCr: {
                select: {
                  uid: true,
                  crName: true,
                  userUid: true
                }
              },
              workspace: {
                select: {
                  id: true,
                  uid: true
                }
              }
            }
          });
          // await globalPrisma.
          return {
            userCrName: result.userCr.crName,
            userCrUid: result.userCr.uid,
            userUid: result.userCr.userUid,
            regionUid: region.uid,
            userId,
            // there is only one private workspace
            workspaceId: result.workspace.id,
            workspaceUid: result.workspace.uid
          };
        }
      }
    );
    if (!regionalDbResult) {
      const failureMessage: TloginFailureMessage = 'failed to get user from db';
      loginFailureCounter
        .labels('unknown', failureMessage, '' + HttpStatusCode['InternalServerError'])
        .inc();
      throw new Error(failureMessage);
    }
    // k8s 操作会自动创建, 幂等
    const kubeconfig = await getUserKubeconfig(
      regionalDbResult.userCrUid,
      regionalDbResult.userCrName
    );
    if (!kubeconfig) {
      const failureMessage: TloginFailureMessage = 'failed to get user from k8s';
      loginFailureCounter
        .labels('unknown', failureMessage, '' + HttpStatusCode['InternalServerError'])
        .inc();
      throw new Error(failureMessage);
    }
    console.log('first sign up workspace id: ', firstSignUpWorkspaceId);
    if (firstSignUpWorkspaceId) {
      await createFirstSignUpNotification(firstSignUpWorkspaceId);
    }

    await globalPrisma.userInfo.update({
      where: {
        userUid,
        isInited: false
      },
      data: {
        isInited: true
      }
    });
    return {
      kubeconfig,
      payload: regionalDbResult
    };
  }, 3);
  if (!result) {
    console.log('Failed to init workspace for new user');
    return null;
  }

  const { kubeconfig, payload } = result;
  return {
    kubeconfig,
    token: generateAccessToken(payload),
    appToken: generateAppToken(payload)
  };
}
