import { getRegionUid } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { getRegionByUid, getRegionList } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import { Region } from '@/types/region';
import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  try {
    // const payload = await authSession(req.headers);
    const regions = (await getRegionList()) || [];
    const currentRegionUid = getRegionUid();
    const currentRegionIdx = regions.findIndex((region: Region) => region.uid === currentRegionUid);
    if (currentRegionIdx === -1) {
      throw Error('current region not found');
    }
    if (regions.length > 1 && currentRegionIdx !== 0) {
      // switch region-0 and region-[currentRegionIdx]
      const temp = regions[currentRegionIdx];
      regions[currentRegionIdx] = regions[0];
      regions[0] = temp;
    }
    if (!regions) throw Error('get all regions error');
    return jsonRes(resp, {
      code: 200,
      data: regions
    });
  } catch (error) {
    console.log(error);
    jsonRes(resp, { code: 500, message: 'get regions error' });
  }
}
