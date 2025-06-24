import { authSessionWithDesktopJWT, generateDevboxToken } from '@/services/backend/auth';
import { jsonRes } from '@/services/backend/response';
import { devboxDB } from '@/services/db/init';
import { getRegionUid } from '@/utils/env';
import { makeOrganizationName } from '@/utils/user';

import { NextRequest } from 'next/server';

const findOrCreateUser = async (regionUid: string, namespaceId: string) => {
  try {
    const existingUser = await devboxDB.user.findUnique({
      where: {
        isDeleted_regionUid_namespaceId: {
          regionUid,
          namespaceId,
          isDeleted: false
        }
      },
      select: {
        uid: true,
        userOrganizations: {
          select: {
            organization: {
              select: {
                uid: true
              }
            }
          }
        }
      }
    });

    if (existingUser && existingUser.userOrganizations.length > 0) {
      return existingUser;
    }

    return await devboxDB.$transaction(
      async (tx) => {
        const organizationName = makeOrganizationName();

        if (!existingUser) {
          return await tx.user.create({
            data: {
              regionUid,
              namespaceId,
              userOrganizations: {
                create: {
                  organization: {
                    create: {
                      name: organizationName,
                      id: organizationName
                    }
                  }
                }
              }
            },
            select: {
              uid: true,
              userOrganizations: {
                select: {
                  organization: {
                    select: {
                      uid: true
                    }
                  }
                }
              }
            }
          });
        } else {
          return await tx.user.update({
            where: {
              isDeleted_regionUid_namespaceId: {
                regionUid,
                namespaceId,
                isDeleted: false
              }
            },
            data: {
              userOrganizations: {
                create: {
                  organization: {
                    create: {
                      name: organizationName,
                      id: organizationName
                    }
                  }
                }
              }
            },
            select: {
              uid: true,
              userOrganizations: {
                select: {
                  organization: {
                    select: {
                      uid: true
                    }
                  }
                }
              }
            }
          });
        }
      },
      {
        timeout: 10000,
        maxWait: 5000
      }
    );
  } catch (error: any) {
    console.error('Error in findOrCreateUser:', error);
    throw new Error(`Failed to find or create user: ${error.message || error}`);
  }
};

export async function POST(req: NextRequest) {
  const regionUid = getRegionUid();
  if (!regionUid) {
    console.log('REGION_UID is not set');
    return jsonRes({
      code: 500,
      error: 'REGION_UID is not configured'
    });
  }

  try {
    const headerList = req.headers;
    const { payload } = await authSessionWithDesktopJWT(headerList);

    const user = await findOrCreateUser(regionUid, payload.workspaceId);
    if (!user) {
      return jsonRes({
        code: 500,
        error: 'Failed to find or create user'
      });
    }

    return jsonRes({
      data: generateDevboxToken({
        userUid: user.uid,
        organizationUid: user.userOrganizations[0].organization.uid,
        regionUid,
        workspaceId: payload.workspaceId
      })
    });
  } catch (err: any) {
    console.error('Error in POST /api/auth/init:', err);
    return jsonRes({
      code: 500,
      error: err.message || 'Internal server error'
    });
  }
}
