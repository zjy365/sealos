import { PlanListSchema } from '@/schema/plan';
import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  try {
    const payload = await authSession(req.headers);
    const region = await getRegionByUid(req.body.regionUid);
    const client = makeAPIClient(region, payload);
    const res = await client.post('/payment/v1alpha1/subscription/plan-list');
    const appMap = res.data.plans;
    const validation = await PlanListSchema.safeParseAsync(appMap);
    if (!validation.success) {
      console.log(validation.error.message);
      return jsonRes(resp, {
        code: 500,
        message: 'Invalid response format'
      });
    }

    const planList = validation.data.map((plan) => ({
      id: plan.ID,
      name: plan.Name,
      description: plan.Description,
      amount: plan.Amount,
      giftAmount: plan.GiftAmount,
      period: plan.Period,
      upgradePlanList: plan.UpgradePlanList || [],
      downgradePlanList: plan.DowngradePlanList || [],
      maxSeats: plan.MaxSeats,
      maxWorkspaces: plan.MaxWorkspaces,
      maxResources: plan.MaxResources,
      createdAt: plan.CreatedAt,
      updatedAt: plan.UpdatedAt,
      mostPopular: plan.MostPopular
    }));
    return jsonRes(resp, {
      code: 200,
      data: {
        planList
      }
    });
  } catch (error) {
    console.log(error);
    return jsonRes(resp, { code: 500, message: 'Failed to fetch subscription plans' });
  }
}
