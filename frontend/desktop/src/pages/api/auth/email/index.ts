import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/services/backend/response';
import { strongPassword } from '@/utils/crypto';
import { enableEmailSms, enablePassword } from '@/services/enable';
import { getPasswordStrength } from '@/utils/tools';
import { HttpStatusCode } from 'axios';
import { ErrorHandler } from '@/services/backend/middleware/error';
import { generateAuthenticationToken } from '@/services/backend/auth';
import { loginParamsSchema } from '@/schema/email';
import { signInByEmail } from '@/services/backend/globalAuth';
export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!enableEmailSms()) {
    throw new Error('SMS is not enabled');
  }
  const parseResult = loginParamsSchema.safeParse(req.body);
  if (!parseResult.success) {
    return jsonRes(res, {
      message: parseResult.error.message,
      code: HttpStatusCode.BadRequest
    });
  }

  const { email: name, password } = parseResult.data;
  const sealosResult = await signInByEmail({
    id: name,
    password
  });
  const sealosUser = sealosResult?.user;
  if (!sealosUser) {
    //密码错误
    return jsonRes(res, {
      message: 'user is not exist or password error',
      code: HttpStatusCode.Forbidden
    });
  }
  const globalToken = generateAuthenticationToken({
    userUid: sealosUser.uid,
    userId: sealosUser.id
  });
  jsonRes(res, {
    data: {
      token: globalToken,
      needInit: !sealosResult.user.userInfo?.isInited
    }
  });
});
