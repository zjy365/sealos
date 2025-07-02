import { PlanListSchema } from '@/schema/plan';
import { AccessTokenPayload } from '@/service/auth';
import { authSession } from '@/service/backend/auth';
import { getRegionByUid, makeAPIClient } from '@/service/backend/region';
import { jsonRes } from '@/service/backend/response';
import { AxiosError, HttpStatusCode } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { TPlanApiResponse } from '@/schema/plan';
import { it } from 'node:test';

const tempAddNodePort = (item: any) => {
  let nodePort = 1;
  let podCount = 4;
  let logRetention = 7;
  switch (item.Name) {
    case 'Pro':
    case 'Hobby':
      nodePort = 100;
      podCount = 100;
      logRetention = 30;
      break;
  }
  if (item.NodePort == undefined) item.NodePort = nodePort;
  if (item.PodCount == undefined) item.PodCount = podCount;
  if (item.LogRetention == undefined) item.LogRetention = logRetention;
  return item;
};
export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  try {
    let payload: AccessTokenPayload;
    try {
      payload = await authSession(req.headers);
    } catch {
      jsonRes(resp, { code: HttpStatusCode.Unauthorized, message: HttpStatusCode[401] });
      return;
    }
    const region = await getRegionByUid(req.body.regionUid);
    const client = makeAPIClient(region, payload);
    const res = await client.post('/payment/v1alpha1/subscription/plan-list');
    const appMap = res.data.plans;
    // const validation = await PlanListSchema.safeParseAsync(appMap);
    // if (!validation.success) {
    //   console.log(validation.error.message);
    //   return jsonRes(resp, {
    //     code: 500,
    //     message: 'Invalid response format'
    //   });
    // }

    //@ts-ignore
    const planList: TPlanApiResponse[] = appMap.map((plan) => ({
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
      mostPopular: plan.MostPopular,
      nodePort: plan.NodePort,
      podCount: plan.PodCount,
      logRetention: plan.LogRetention,
      annualAmount: plan.AnnualAmount
    }));

    return jsonRes(resp, {
      code: 200,
      data: {
        planList
      }
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return jsonRes(resp, {
        code: error.status,
        message: error.response?.data.error,
        data: error.response?.data
      });
    }
    console.log(error);
    return jsonRes(resp, { code: 500, message: 'Failed to fetch subscription plans' });
  }
}
