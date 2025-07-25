import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/services/backend/response';
import { enableWechat } from '@/services/enable';
import { persistImage } from '@/services/backend/persistImage';
import { ProviderType } from 'prisma/global/generated/client';
import {
  OauthCodeFilter,
  wechatOAuthEnvFilter,
  wechatOAuthGuard
} from '@/services/backend/middleware/oauth';
import { getGlobalTokenSvc } from '@/services/backend/svc/access';
import { ErrorHandler } from '@/services/backend/middleware/error';

export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!enableWechat()) {
    throw new Error('wechat clinet is not defined');
  }
  await OauthCodeFilter(req, res, async ({ code, inviterId, semData, adClickData }) => {
    await wechatOAuthEnvFilter()(async ({ clientID, clientSecret }) => {
      await wechatOAuthGuard(
        clientID,
        clientSecret,
        code
      )(res, async ({ id, name, avatar_url }) => {
        const persistUrl =
          (await persistImage(avatar_url, 'avatar/' + ProviderType.WECHAT + '/' + id)) || '';
        // await getGlobalTokenByWechatSvc(persistUrl, id, name, inviterId, semData, bdVid)(res);
        await getGlobalTokenSvc({
          avatar_url: persistUrl || '',
          providerId: id,
          name,
          inviterId,
          semData,
          adClickData,
          providerType: 'WECHAT'
        })(req, res);
      });
    });
  });
});
