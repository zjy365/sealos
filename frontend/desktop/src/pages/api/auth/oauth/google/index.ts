import { NextApiRequest, NextApiResponse } from 'next';
import { enableGoogle } from '@/services/enable';
import { persistImage } from '@/services/backend/persistImage';
import { ProviderType } from 'prisma/global/generated/client';
import {
  googleOAuthEnvFilter,
  googleOAuthGuard,
  OauthCodeFilter
} from '@/services/backend/middleware/oauth';
import { getGlobalTokenByGoogleSvc } from '@/services/backend/svc/access';
import { ErrorHandler } from '@/services/backend/middleware/error';

export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!enableGoogle()) throw new Error('google clinet is not defined');
  await OauthCodeFilter(
    req,
    res,
    async ({ code, inviterId, semData, bdVid }) =>
      await googleOAuthEnvFilter()(async ({ clientID, clientSecret, callbackURL }) => {
        await googleOAuthGuard(
          clientID,
          clientSecret,
          code,
          callbackURL
        )(res, async ({ email, id, name, avatar_url }) => {
          const presistAvatarUrl =
            (await persistImage(avatar_url, 'avatar/' + ProviderType.GOOGLE + '/' + id)) || '';
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
          await getGlobalTokenByGoogleSvc(
            presistAvatarUrl,
            id,
            name,
            email,
            inviterId,
            referralType,
            finalReferralCode,
            semData,
            bdVid
          )(res);
        });
      })
  );
});
