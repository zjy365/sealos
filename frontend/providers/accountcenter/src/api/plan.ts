import { TCreditsUsageResponse, TPlanApiResponse, TSubscriptionApiResponse } from '@/schema/plan';
import { GET } from '@/service/request';

export function getPlans() {
  return GET<{ planList: TPlanApiResponse[] }>('/plan/list');
}
export function getPlanSubscription() {
  return GET<TSubscriptionApiResponse>('/plan/subscription');
}
export function getPlanCreditsUsage() {
  return GET<TCreditsUsageResponse>('/plan/creditsUsage');
}
