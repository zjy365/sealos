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
  const { email: name, password, firstName: firstname, lastName: lastname } = result.data;
  const oauthProvider = await globalPrisma.oauthProvider.findUnique({
    where: {
      providerId_providerType: {
        providerId: name,
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
  const data = await signUpByEmail({
    id: name,
    password,
    name,
    firstname,
    lastname
  });
  await emailSmsVerifyReq(
    name,
    {
      type: 'email',
      regionUid: getRegionUid(),
      userUid: data.user.uid,
      userId: data.user.id
    },
    data.user.nickname
  );
  if (!data)
    return jsonRes(res, {
      code: HttpStatusCode.Unauthorized,
      message: 'Unauthorized'
    });
  const globalToken = generateAuthenticationToken({
    userUid: data.user.uid,
    userId: data.user.id
  });
  return jsonRes(res, {
    data: {
      token: globalToken,
      needInit: true
    },
    code: 200,
    message: 'Successfully'
  });
});
