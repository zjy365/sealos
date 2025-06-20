import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/services/backend/response';
import { generateAuthenticationToken } from '@/services/backend/auth';
import { filterAccessToken } from '@/services/backend/middleware/access';
import { ErrorHandler } from '@/services/backend/middleware/error';
export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  await filterAccessToken(req, res, async (payload) => {
    return jsonRes(res, {
      code: 200,
      message: 'Successfully',
      data: {
        token: generateAuthenticationToken({
          userUid: payload.userUid,
          userId: payload.userId
        })
      }
    });
  });
});
