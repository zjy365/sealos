import { generateAuthenticationToken, verifyVerifyEmailToken } from '@/services/backend/auth';
import { checkCode } from '@/services/backend/db/verifyEmailCode';
import { filterAccessToken } from '@/services/backend/middleware/access';
import { ErrorHandler } from '@/services/backend/middleware/error';
import { jsonRes } from '@/services/backend/response';
import { verifyInfoEmailCodeSvc } from '@/services/backend/svc/sms';
import { enableEmailSms } from '@/services/enable';
import { Code } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import email from '..';
import { signUpByEmail } from '@/services/backend/globalAuth';

export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!enableEmailSms()) {
    throw new Error('SMS is not enabled');
  }
  const tokenResult = z.string().safeParse(req.body.token);
  if (!tokenResult.success || !tokenResult.data) {
    return jsonRes(res, {
      message: 'token is required',
      code: 400
    });
  }
  const result = await checkCode({
    code: tokenResult.data
  });
  if (!result) {
    return jsonRes(res, {
      message: 'token is invalid',
      code: 401
    });
  }
  const { payload, id } = result;
  const { password, firstName, lastName } = payload;
  const referralCode = req.cookies?.CC_RUN_REFERRAL_CODE || undefined;
  const data = await signUpByEmail({
    id,
    password,
    firstname: firstName,
    lastname: lastName,
    referralCode
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
