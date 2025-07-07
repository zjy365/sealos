import { TRechargeApiResponse, TRechargeRequest } from '@/schema/card';
import {
  TBonusDetailsApiResponse,
  TCreditsUsageResponse,
  TLastTransactionResponse,
  TPlanApiResponse,
  TSubscriptionApiResponse,
  TUpdatePlanRequest,
  TUpdatePlanResponse,
  TUserKycApiResponse
} from '@/schema/plan';
import { ExpansionRule } from '@/service/crmApi/expansionRule';
import { GET, POST } from '@/service/request';

export function getPlans() {
  return GET<{ planList: TPlanApiResponse[] }>('/plan/list');
}
export function getPlanSubscription() {
  return GET<TSubscriptionApiResponse>('/plan/subscription');
}

export function getUserKycInfo() {
  return GET<TUserKycApiResponse>('/plan/kycInfo');
}
export function getPlanCreditsUsage() {
  return GET<TCreditsUsageResponse>('/plan/creditsUsage');
}
export function getBonusDetails() {
  return GET<TBonusDetailsApiResponse>('/plan/bonusDetails');
}
export type TCheckForCancelResponse = {
  workspaceReady: boolean;
  seatReady: boolean;
};
export function checkForCancel() {
  return GET<TCheckForCancelResponse>('/plan/checkForCancel');
}
export function updatePlan(data: TUpdatePlanRequest) {
  return POST<TUpdatePlanResponse>('/plan/update', data);
}
export function getUpgradePlanAmount(payload: { planName: string; period: 'MONTHLY' | 'YEARLY' }) {
  return POST<{ amount: number }>('/plan/upgradeAmount', payload);
}

export function recharge(data: TRechargeRequest) {
  return POST<TRechargeApiResponse>('/payment/recharge', data);
}
export function getLastTransaction() {
  return GET<{ transcation: TLastTransactionResponse }>('/plan/lastTransaction');
}

export function getExpansionRule() {
  return GET<ExpansionRule[]>('/plan/expansionRule');
}

export function calcExpansion(amount: number) {
  return POST<{ amount: number }>('/plan/calcExpansion', { amount });
}
