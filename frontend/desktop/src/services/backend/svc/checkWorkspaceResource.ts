import { ApiResp } from '@/types';
import { RESOURCE_STATUS } from '@/types/response/checkResource';
import dayjs from 'dayjs';
import { NextApiResponse } from 'next';
import { Region, Prisma as GlobalPrisma } from 'prisma/global/generated/client';
import {
  Role,
  Workspace,
  UserWorkspace,
  Prisma as RegionPrisma
} from 'prisma/region/generated/client';
import { generateAuthenticationToken, generateBillingToken, generateOnceToken } from '../auth';
import { globalPrisma, prisma } from '../db/init';
import { jsonRes } from '../response';
import { Axios, HttpStatusCode } from 'axios';
import { createMiddleware } from '@/utils/factory';
import { Prisma } from '@prisma/client/extension';
// type ResourceRawType = {
//   namespace: string;
//   type: number;
//   parent_type?: 8;
//   parent_name?: string;
//   name?: string;
// };
// export type ResourceType = {
//   workspace: Workspace;
//   type: number;
//   name?: string;
// };
// export type RegionResourceType = {
//   region: Region;
//   resource: ResourceType[];
// };
type ResourceData = {
  workspaceList: RegionPrisma.UserWorkspaceGetPayload<{
    select: {
      workspace: true;
    };
  }>['workspace'][];
};
type AllResourceData = {
  regionDetailList: [
    GlobalPrisma.RegionGetPayload<{
      select: {
        uid: true;
        domain: true;
        displayName: true;
      };
    }>,
    ResourceData['workspaceList']
  ][];
};
const getWorkspaceList = async (userCrUid: string) => {
  const itemList = await prisma.userWorkspace.findMany({
    where: {
      userCrUid
    },
    select: {
      workspace: true
    }
  });
  const workspaceList = itemList.map((userWorkspace) => userWorkspace.workspace);
  return workspaceList;
};

const filterUserCr = createMiddleware<{ userUid: string }, RegionPrisma.UserCrGetPayload<true>>(
  async ({ req, res, next, ctx }) => {
    const userCr = await prisma.userCr.findUnique({
      where: {
        userUid: ctx.userUid
      }
    });
    if (!userCr) {
      jsonRes(res, {
        code: HttpStatusCode.NotFound,
        message: 'UserCr not found'
      });
      return;
    }
    await next(userCr);
    return;
  }
);
export const currentResourceSvc =
  (userId: string, userUid: string) => async (res: NextApiResponse, next?: () => void) => {
    const userCr = await prisma.userCr.findUnique({
      where: {
        userUid
      },
      select: {
        uid: true
      }
    });
    if (!userCr) {
      return jsonRes(res, {
        code: 200,
        data: {
          workspaceList: []
        }
      });
    }
    const workspaceList = await getWorkspaceList(userCr.uid);
    jsonRes<ResourceData>(res, {
      data: {
        workspaceList
      }
    });
  };
export const getClient = (domain: string, authorization: string) => {
  return new Axios({
    baseURL: `https://${domain}/api`,
    headers: {
      authorization
    }
  });
};

export const allRegionWorkspaceSvc = createMiddleware<{
  userUid: string;
  userId: string;
}>(async ({ res, req, next, ctx }) => {
  const { userId, userUid } = ctx;
  const regionList = await globalPrisma.region.findMany({
    select: {
      uid: true,
      domain: true,
      displayName: true
    }
  });
  const otherRegionList = regionList.filter(
    (region) => region.uid !== global.AppConfig.cloud.regionUID
  );
  const currentRegion = regionList.find(
    (region) => region.uid === global.AppConfig.cloud.regionUID
  );
  if (!currentRegion) {
    throw Error('Current region not found');
  }
  // const regionResourceList: RegionResourceType[] = [];
  const userCr = await prisma.userCr.findUnique({
    where: {
      userUid
    },
    select: {
      uid: true
    }
  });
  if (!userCr) {
    return jsonRes(res, {
      code: 200,
      data: {
        workspaceList: []
      }
    });
  }
  // 查看local
  const currentWorkspaceList = await getWorkspaceList(userCr.uid);
  const token = encodeURI(
    generateAuthenticationToken({
      userUid: userUid,
      userId: userId
    })
  );
  const otherRegionWorkspaceList = await Promise.all(
    otherRegionList.map<Promise<AllResourceData['regionDetailList'][number]>>(async (region) => {
      const domain = process.env.NODE_ENV === 'development' ? '127.0.0.1:3000' : region.domain;

      const client = getClient(domain, token);
      const result = await client.get<ApiResp<ResourceData>>('/mulitRegion/workspace/list/region');
      return [region, result.data.data?.workspaceList || []];
    })
  );
  // current 必须得第一项，视作默认
  const regionDetailList: AllResourceData['regionDetailList'] = [
    [currentRegion, currentWorkspaceList],
    ...otherRegionWorkspaceList
  ];
  jsonRes<AllResourceData>(res, {
    data: {
      regionDetailList
    }
  });
  return;
});
