import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/services/backend/response';
import { strongPassword } from '@/utils/crypto';
import { enableEmailSms, enablePassword } from '@/services/enable';
import { getGlobalToken, signUpByEmail } from '@/services/backend/globalAuth';
import { ProviderType } from 'prisma/global/generated/client';
import { ErrorHandler } from '@/services/backend/middleware/error';
import { registerParamsSchema } from '@/schema/email';
import { HttpStatusCode } from 'axios';
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
  console.log('get params success');
  const data = await signUpByEmail({
    id: name,
    password,
    name,
    firstname,
    lastname
  });
  console.log('signUp success');
  if (!data)
    return jsonRes(res, {
      code: HttpStatusCode.Unauthorized,
      message: 'Unauthorized'
    });
  return jsonRes(res, {
    data: {
      token: data,
      needInit: true
    },
    code: 200,
    message: 'Successfully'
  });
});
