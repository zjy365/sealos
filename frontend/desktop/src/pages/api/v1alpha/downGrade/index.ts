import { filterAccessToken } from '@/services/backend/middleware/access';
import { filterForceDelete } from '@/services/backend/middleware/checkResource';
import { ErrorHandler } from '@/services/backend/middleware/error';
import { forceDeleteUserSvc } from '@/services/backend/svc/deleteUser';
import { syncUserPlanSvc } from '@/services/backend/svc/downGrade';
import { NextApiRequest, NextApiResponse } from 'next';
export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  await filterAccessToken(req, res, async (payload) => {
    await syncUserPlanSvc(payload)(req, res);
  });
});
