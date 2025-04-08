import { NextApiRequest, NextApiResponse } from 'next';
import { enableGithub } from '@/services/enable';
import { filterAccessToken } from '@/services/backend/middleware/access';
import {
  OauthCodeFilter,
  bindGithubGuard,
  githubOAuthEnvFilter,
  githubOAuthGuard
} from '@/services/backend/middleware/oauth';
import { bindGithubSvc, bindProviderV2Svc } from '@/services/backend/svc/bindProvider';
import { ErrorHandler } from '@/services/backend/middleware/error';
import { ProviderType } from 'prisma/global/generated/client';

export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!enableGithub()) {
    throw new Error('github clinet is not defined');
  }
  await filterAccessToken(req, res, async ({ userUid }) => {
    await OauthCodeFilter(req, res, async ({ code }) => {
      await githubOAuthEnvFilter()(async ({ clientID, clientSecret }) => {
        await githubOAuthGuard(
          clientID,
          clientSecret,
          code
        )(res, ({ id, config }) =>
          bindGithubGuard(id, userUid)(res, () =>
            // bindGithubSvc(id, userUid)(res)
            bindProviderV2Svc({
              providerId: id,
              providerType: ProviderType.GITHUB,
              userUid: userUid,
              config: config
            })(req, res)
          )
        );
      });
    });
  });
});
