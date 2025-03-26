import { verifyVerifyEmailToken } from '@/services/backend/auth';
import { filterAccessToken } from '@/services/backend/middleware/access';
import { ErrorHandler } from '@/services/backend/middleware/error';
import { jsonRes } from '@/services/backend/response';
import { verifyInfoEmailCodeSvc } from '@/services/backend/svc/sms';
import { enableEmailSms } from '@/services/enable';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!enableEmailSms()) {
    throw new Error('SMS is not enabled');
  }
  const token = z.string().parse(req.query.token);
  const result = await verifyVerifyEmailToken(token);
  if (!result) {
    return jsonRes(res, {
      message: 'token is required',
      code: 400
    });
  }
  if (result.type !== 'email') {
    return jsonRes(res, {
      message: 'invalid token',
      code: 409
    });
  }
  await verifyInfoEmailCodeSvc(result)(req, res);
});
