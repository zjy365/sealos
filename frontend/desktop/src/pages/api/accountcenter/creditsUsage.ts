import { verifyAppToken } from '@/services/backend/auth';
import { jsonRes } from '@/services/backend/response';
import { ApiResp } from '@/types';
import type { NextApiRequest, NextApiResponse } from 'next';

type ConsumptionResult = {
  // gift: { total: number; used: number };
  charged: { total: number; used: number };
  github: { total: number; used: number };
  currentPlan: { total: number; used: number };
  bonus: { total: number; used: number };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload = await verifyAppToken(req.headers);
    if (!payload) return jsonRes(res, { code: 401, message: 'failed to get info' });
    const authorization = req.headers.authorization;
    if (!authorization) return jsonRes(res, { code: 401, message: 'failed to get info' });
    const base = global.AppConfig.desktop.auth.accountCenterUrl as string;
    if (!base) return jsonRes(res, { code: 404, message: 'account center url is not found' });

    const consumptionUrl = base + '/api/user/getInfo';

    const response = await fetch(consumptionUrl, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${authorization}`
      }
    });

    if (!response.ok) {
      return jsonRes(res, { code: response.status, message: 'Failed to fetch credits usage' });
    }

    const data = (await response.json()) as ApiResp<{
      user: {
        avatarUri: string;
        firstname: string;
        lastname: string;
        email: string;
        createdAt: string;
        agency: boolean;
      };
      bindings: {
        email: string;
        phone: string;
        wechat: string;
        github: string;
        google: string;
      };
    }>;
    const isAgency = data.data?.user.agency;

    // Second API call to plan/creditsUsage
    const planCreditsUrl = base + '/api/plan/creditsUsage';
    const planResponse = await fetch(planCreditsUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${authorization}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        regionUid: payload.regionUid
      })
    });

    if (!planResponse.ok) {
      return jsonRes(res, {
        code: planResponse.status,
        message: 'Failed to fetch plan credits usage'
      });
    }

    const planData = await planResponse.json();

    // Get the credits usage data from plan response
    const creditsUsage = planData.data as ConsumptionResult;

    // Third API call to billing/listInvoice only when isAgency is false
    if (!isAgency) {
      const invoiceUrl = base + '/api/billing/listInvoice';
      const invoiceResponse = await fetch(invoiceUrl, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${authorization}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page: 1,
          pageSize: 100
        })
      });

      if (invoiceResponse.ok) {
        const invoiceData = await invoiceResponse.json();

        // Sum up all Gift values from payments
        const totalGift =
          invoiceData.data?.payments?.reduce((sum: number, payment: any) => {
            return sum + (payment.Gift || 0);
          }, 0) || 0;

        creditsUsage.bonus.total = totalGift;
      }
    }

    jsonRes(res, {
      data: {
        creditsUsage: creditsUsage,
        isAgency: isAgency
      }
    });
  } catch (err: any) {
    jsonRes(res, { code: 500, data: err?.body });
  }
}
