import { TRechargeApiResponse, TRechargeRequest } from '@/schema/card';
import {
  TCreditsUsageResponse,
  TLastTransactionResponse,
  TPlanApiResponse,
  TSubscriptionApiResponse,
  TUpdatePlanRequest,
  TUpdatePlanResponse,
  TBonusDetailsApiResponse
} from '@/schema/plan';
import { GET, POST } from '@/service/request';

export function getPlans() {
  return GET<{ planList: TPlanApiResponse[] }>('/plan/list');
}
export function getPlanSubscription() {
  return GET<TSubscriptionApiResponse>('/plan/subscription');
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
export function getUpgradePlanAmount(planName: string) {
  return POST<{ amount: number }>('/plan/upgradeAmount', { planName });
}
export function recharge(data: TRechargeRequest) {
  return POST<TRechargeApiResponse>('/payment/recharge', data);
}
export function getLastTransaction() {
  return GET<{ transcation: TLastTransactionResponse }>('/plan/lastTransaction');
}
