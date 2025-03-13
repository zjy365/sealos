import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/services/backend/response';
import { globalPrisma } from '@/services/backend/db/init';
import { verifyAccessToken, verifyAuthenticationToken } from '@/services/backend/auth';
import { ErrorHandler } from '@/services/backend/middleware/error';

export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const regionUser = await verifyAuthenticationToken(req.headers);
  if (!regionUser)
    return jsonRes(res, {
      code: 401,
      message: 'invalid token'
    });

  const regionList = await globalPrisma.region.findMany();
  return jsonRes(res, {
    code: 200,
    message: 'Successfully',
    data: {
      regionList: regionList.map((region) => ({
        ...region,
        description: region.description ? JSON.parse(region.description) : null
      }))
    }
  });
});
