import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/services/backend/response';
import { enableEmailSms } from '@/services/enable';
import { ErrorHandler } from '@/services/backend/middleware/error';
import { emailCheckParamsSchema } from '@/schema/email';
import { HttpStatusCode } from 'axios';
import { checkIsVaildEmailMiddleware } from '@/services/backend/middleware/ccOauth';
export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!enableEmailSms()) {
    throw new Error('SMS is not enabled');
  }
  const result = emailCheckParamsSchema.safeParse(req.body);
  if (!result.success) {
    return jsonRes(res, {
      message: result.error.errors[0].message,
      code: HttpStatusCode.BadRequest
    });
  }
  const { email } = result.data;
  await checkIsVaildEmailMiddleware({ email })(req, res, async () => {
    return jsonRes(res, {
      code: 201,
      message: 'Successfully'
    });
  });
});
