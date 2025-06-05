import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/services/backend/response';
import { globalPrisma } from '@/services/backend/db/init';
import { ErrorHandler } from '@/services/backend/middleware/error';

export default ErrorHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const regionList = await globalPrisma.region.findMany({
    select: {
      uid: true,
      domain: true,
      location: true,
      description: true,
      displayName: true
    }
  });
  return jsonRes(res, {
    code: 200,
    message: 'Successfully',
    data: {
      regionList: regionList.map((region) => ({
        ...region,
        description: region.description
          ? {
              isFree: true,
              ...JSON.parse(region.description)
            }
          : null
      }))
    }
  });
});
