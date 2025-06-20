import { globalPrisma } from '@/service/backend/db/init';
import { jsonRes } from '@/service/backend/response';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
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
  } catch (error) {
    console.log(error);
    jsonRes(res, { code: 500, message: 'get all regions error' });
  }
}
