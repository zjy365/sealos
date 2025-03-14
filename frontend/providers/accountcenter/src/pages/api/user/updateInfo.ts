import { AccessTokenPayload, getRegionUid } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { globalPrisma } from '@/service/backend/db/init';
import { jsonRes } from '@/service/backend/response';
import { HttpStatusCode } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { UpdateInfoRequest } from '@/schema/user';
import { z } from 'zod';
import { getRegionByUid } from '@/service/backend/region';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 解析和验证请求体
  const validation = UpdateInfoRequest.safeParse(req.body);
  if (!validation.success) {
    return jsonRes(res, {
      code: HttpStatusCode.BadRequest,
      message: validation.error.message
    });
  }

  const { firstname, lastname } = validation.data;

  let payload: AccessTokenPayload;
  try {
    payload = await authSession(req.headers);
  } catch {
    return jsonRes(res, {
      code: HttpStatusCode.Unauthorized
    });
  }

  try {
    // 更新用户信息
    const result = await globalPrisma.userInfo.upsert({
      where: { userUid: payload.userUid },
      update: {
        firstname,
        lastname
      },
      create: {
        isInited: false,
        firstname,
        lastname,
        signUpRegionUid: getRegionUid(),
        userUid: payload.userUid
      }
    });

    // 更新成功后，查询最新的用户信息并返回
    const updatedUser = await globalPrisma.user.findUnique({
      where: { uid: payload.userUid },
      select: {
        userInfo: {
          select: {
            lastname: true,
            firstname: true
          }
        },
        avatarUri: true
      }
    });

    return jsonRes(res, {
      code: HttpStatusCode.Ok,
      data: {
        firstName: updatedUser?.userInfo?.firstname || '',
        lastName: updatedUser?.userInfo?.lastname || '',
        avatarUri: updatedUser?.avatarUri || ''
      }
    });
  } catch (error) {
    console.log(error);
    return jsonRes(res, {
      code: HttpStatusCode.InternalServerError,
      message: 'Internal Server Error'
    });
  }
}
