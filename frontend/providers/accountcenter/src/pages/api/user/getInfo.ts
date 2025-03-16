import { TUserInfoReponse } from '@/schema/user';
import { AccessTokenPayload } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { globalPrisma } from '@/service/backend/db/init';
import { jsonRes } from '@/service/backend/response';
import { HttpStatusCode } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 解析和验证请求体
  let payload: AccessTokenPayload;
  try {
    payload = await authSession(req.headers);
  } catch {
    jsonRes(res, { code: HttpStatusCode.Unauthorized, message: HttpStatusCode[401] });
    return;
  }

  try {
    // 查询用户信息
    const user = await globalPrisma.user.findUnique({
      where: {
        uid: payload.userUid // 假设 user.email 是唯一的，用于查询
      },
      select: {
        userInfo: {
          select: {
            lastname: true,
            firstname: true
          }
        },
        oauthProvider: true,
        avatarUri: true
      }
    });

    if (!user) {
      return jsonRes(res, {
        code: HttpStatusCode.NotFound,
        message: 'User not found'
      });
    }
    const userOAuthProviders = user.oauthProvider;
    // 构建响应

    const bindingsResp = {
      github: userOAuthProviders.some((p) => p.providerType === 'GITHUB'),
      google: userOAuthProviders.some((p) => p.providerType === 'GOOGLE')
    };

    return jsonRes<TUserInfoReponse>(res, {
      data: {
        user: {
          avatarUri: user.avatarUri,
          firstname: user.userInfo?.firstname || '',
          lastname: user.userInfo?.lastname || '',
          email: userOAuthProviders.find((p) => p.providerType === 'EMAIL')?.providerId || ''
        },
        bindings: bindingsResp
      }
    });
  } catch (error) {
    jsonRes(res, {
      code: 500,
      error: 'Internal Server Error'
    });
  }
}
