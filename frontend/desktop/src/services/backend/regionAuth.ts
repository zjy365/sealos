import { findUserCr, getUserCr, getUserKubeconfig } from '@/services/backend/kubernetes/admin';
import { globalPrisma, prisma } from '@/services/backend/db/init';
import { getRegionUid } from '@/services/enable';
import { GetUserDefaultNameSpace } from '@/services/backend/kubernetes/user';
import { customAlphabet } from 'nanoid';
import { retrySerially } from '@/utils/tools';
import { AccessTokenPayload } from '@/types/token';
import { JoinStatus, Role } from 'prisma/region/generated/client';
import { generateAccessToken, generateAppToken } from '@/services/backend/auth';

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
  userId,
  autoCreate = false
}: {
  userUid: string;
  userId: string;
  autoCreate?: boolean;
}): Promise<{
  kubeconfig: string;
  token: string;
  appToken: string;
}> {
  const region = await globalPrisma.region.findUnique({
    where: {
      uid: getRegionUid()
    }
  });
  if (!region) throw Error('The REGION_UID is undefined');

  const payload = await retrySerially(
    () =>
      prisma.$transaction(async (tx): Promise<AccessTokenPayload | null> => {
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
          // 暂时关闭该分支
          if (!autoCreate) return null;
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
      }),
    3
  );

  if (!payload) {
    throw new Error('Failed to get user from db');
  }
  const kubeconfig = await getUserKubeconfig(payload.userCrUid, payload.userCrName);
  if (!kubeconfig) {
    throw new Error('Failed to get user from k8s');
  }

  return {
    kubeconfig,
    token: generateAccessToken(payload),
    appToken: generateAppToken(payload)
  };
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
}> {
  const region = await globalPrisma.region.findUnique({
    where: {
      uid: regionUid
    }
  });
  if (!region) throw Error('The REGION_UID is undefined');
  const userInfo = await globalPrisma.userInfo.findUnique({
    where: {
      userUid
    }
  });
  if (!userInfo) throw Error('The user status is error');
  const payload = await retrySerially(
    () =>
      prisma.$transaction(async (tx): Promise<AccessTokenPayload> => {
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
          const relations = userCrResult.userWorkspace!;
          const privateRelation = relations.find((r) => r.isPrivate);
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
          const crName = nanoid();
          const workspaceId = GetUserDefaultNameSpace(crName);
          const result = await tx.userWorkspace.create({
            data: {
              status: JoinStatus.IN_WORKSPACE,
              role: Role.OWNER,
              workspace: {
                create: {
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
      }),
    3
  );
  if (!payload) {
    throw new Error('Failed to get userCr from db');
  }
  const kubeconfig = await getUserKubeconfig(payload.userCrUid, payload.userCrName);
  if (!kubeconfig) {
    throw new Error('Failed to get user from k8s');
  }
  // confirm init
  const [infoResult, usageResult] = await globalPrisma.$transaction([
    globalPrisma.userInfo.update({
      where: {
        userUid
      },
      data: {
        isInited: true
      }
    }),
    globalPrisma.workspaceUsage.create({
      data: {
        workspaceUid: payload.workspaceUid,
        userUid,
        regionUid: region.uid,
        seat: 1
      }
    })
  ]);

  return {
    kubeconfig,
    token: generateAccessToken(payload),
    appToken: generateAppToken(payload)
  };
}
