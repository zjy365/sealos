import { TUserInfoResponse } from '@/schema/user';
import { AccessTokenPayload } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { globalPrisma } from '@/service/backend/db/init';
import { jsonRes } from '@/service/backend/response';
import { getReferralType } from '@/service/crmApi/referralType';
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
    // console.log('payload', payload, req.headers);
    // get user agency mark
    let agencyMark = false;
    const referral_type = await getReferralType(payload.userUid);
    if (referral_type.referral_type === 'agency') {
      agencyMark = true;
    }

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
        avatarUri: true,
        createdAt: true
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

    return jsonRes<TUserInfoResponse>(res, {
      data: {
        user: {
          avatarUri: user.avatarUri,
          firstname: user.userInfo?.firstname || '',
          lastname: user.userInfo?.lastname || '',
          email: userOAuthProviders.find((p) => p.providerType === 'EMAIL')?.providerId || '',
          createdAt: user.createdAt.getTime(),
          agency: agencyMark ? true : false
        },
        bindings: bindingsResp
      }
    });
  } catch (error) {
    console.error(error);
    jsonRes(res, {
      code: 500,
      error: 'Internal Server Error'
    });
  }
}
