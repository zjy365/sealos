import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/services/backend/response';
import { enableEmailSms, getRegionUid } from '@/services/enable';
import { signUpByEmail } from '@/services/backend/globalAuth';
import { ProviderType } from 'prisma/global/generated/client';
import { generateAuthenticationToken } from '@/services/backend/auth';
import { ErrorHandler } from '@/services/backend/middleware/error';
import { registerParamsSchema } from '@/schema/email';
import { HttpStatusCode } from 'axios';
import { globalPrisma } from '@/services/backend/db/init';
import { emailSmsVerifyReq } from '@/services/backend/sms';
import { addOrUpdateCode, checkSendable } from '@/services/backend/db/verifyEmailCode';
import { hashPassword } from '@/utils/crypto';
export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!enableEmailSms()) {
    throw new Error('SMS is not enabled');
  }
  const result = registerParamsSchema.safeParse(req.body);
  if (!result.success) {
    return jsonRes(res, {
      message: result.error.errors[0].message,
      code: HttpStatusCode.BadRequest
    });
  }
  const { email, password, firstName: firstname, lastName: lastname } = result.data;
  const oauthProvider = await globalPrisma.oauthProvider.findUnique({
    where: {
      providerId_providerType: {
        providerId: email,
        providerType: 'EMAIL'
      }
    }
  });
  if (!!oauthProvider) {
    return jsonRes(res, {
      code: 409,
      message: 'Email already exists'
    });
  }
  const enableResult = await checkSendable({
    id: email
  });
  if (!enableResult) {
    return jsonRes(res, {
      code: 409,
      message: 'Email already exists'
    });
  }
  const code = await emailSmsVerifyReq(email, `${firstname} ${lastname}`);

  const updateResult = await addOrUpdateCode({
    id: email,
    payload: {
      email,
      password: hashPassword(password),
      firstName: firstname,
      lastName: lastname
    },
    code
  });
  if (!updateResult.acknowledged) {
    throw new Error('Failed to update code');
  }
  return jsonRes(res, {
    code: 200,
    message: 'Successfully'
  });
});
