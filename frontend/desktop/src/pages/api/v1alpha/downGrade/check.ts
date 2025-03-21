import { filterAccessToken } from '@/services/backend/middleware/access';
import { filterForceDelete } from '@/services/backend/middleware/checkResource';
import { checkUserPlanAllRegionMiddleware } from '@/services/backend/middleware/downGrade';
import { ErrorHandler } from '@/services/backend/middleware/error';
import { jsonRes } from '@/services/backend/response';
import { NextApiRequest, NextApiResponse } from 'next';
export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  await filterAccessToken(req, res, async (paylaod) => {
    await checkUserPlanAllRegionMiddleware(paylaod)(req, res, (data) => {
      return jsonRes(res, {
        code: 200,
        data
      });
    });
  });
});
