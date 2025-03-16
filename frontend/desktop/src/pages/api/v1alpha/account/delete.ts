import { filterAccessToken } from '@/services/backend/middleware/access';
import { filterForceDelete } from '@/services/backend/middleware/checkResource';
import { ErrorHandler } from '@/services/backend/middleware/error';
import { forceDeleteUserSvc, simpleDeleteUserSvc } from '@/services/backend/svc/deleteUser';
import { NextApiRequest, NextApiResponse } from 'next';
export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  await filterAccessToken(req, res, async ({ userUid }) => {
    await simpleDeleteUserSvc(userUid)(res);
  });
});
