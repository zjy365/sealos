import { ErrorHandler } from '@/services/backend/middleware/error';
import {
  OauthCodeFilter,
  githubOAuthEnvFilter,
  githubOAuthGuard
} from '@/services/backend/middleware/oauth';
import { persistImage } from '@/services/backend/persistImage';
import { getGlobalTokenByGithubSvc } from '@/services/backend/svc/access';
import { enableGithub } from '@/services/enable';
import { NextApiRequest, NextApiResponse } from 'next';
import { ProviderType } from 'prisma/global/generated/client';

export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!enableGithub()) {
    throw new Error('github clinet is not defined');
  }
  await OauthCodeFilter(req, res, async ({ code, inviterId, semData, bdVid }) => {
    await githubOAuthEnvFilter()(async ({ clientID, clientSecret }) => {
      await githubOAuthGuard(
        clientID,
        clientSecret,
        code
      )(res, async ({ id, name, avatar_url, email, config }) => {
        const persistUrl = await persistImage(
          avatar_url,
          'avatar/' + ProviderType.GITHUB + '/' + id
        );
        const referralCode = req.cookies?.CC_RUN_REFERRAL_CODE || undefined;
        const agencyReferralCode = req.cookies?.CC_RUN_AGENCY_REFERRAL_CODE || undefined;
        let referralType: 'agency' | 'rcc' | undefined;
        let finalReferralCode: string | undefined;
        if (!agencyReferralCode && !referralCode) {
          referralType = undefined;
          finalReferralCode = undefined;
        } else if (agencyReferralCode) {
          referralType = 'agency';
          finalReferralCode = agencyReferralCode;
        } else {
          referralType = 'rcc';
          finalReferralCode = referralCode;
        }
        await getGlobalTokenByGithubSvc(
          persistUrl || '',
          id,
          name,
          email,
          inviterId,
          referralType,
          finalReferralCode,
          semData,
          bdVid,
          {
            github: config
          }
        )(res);
      });
    });
  });
});
