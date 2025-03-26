import { filterAccessToken } from '@/services/backend/middleware/access';
import { filterForceDelete } from '@/services/backend/middleware/checkResource';
import { checkUserPlanAllRegionMiddleware } from '@/services/backend/middleware/downGrade';
import { ErrorHandler } from '@/services/backend/middleware/error';
import { jsonRes } from '@/services/backend/response';
import { DownGradeTokenPayload } from '@/types/token';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  await filterAccessToken(req, res, async (payload) => {
    const subscriptionPlanIdResult = z.string().uuid().safeParse(req.body.subscriptionPlanId);
    if (!subscriptionPlanIdResult.success) {
      return jsonRes(res, {
        code: 400,
        data: subscriptionPlanIdResult.error,
        message: 'Invalid subscription plan ID'
      });
    }
    const subscriptionPlanId = subscriptionPlanIdResult.data;
    await checkUserPlanAllRegionMiddleware({
      payload: payload as DownGradeTokenPayload,
      subscriptionPlanId
    })(req, res, (data) => {
      return jsonRes(res, {
        code: 200,
        data
      });
    });
  });
});
