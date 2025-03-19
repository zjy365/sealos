import { TLastTransactionResponse } from '@/schema/plan';

export function isPlanCancelling(lastTransaction: TLastTransactionResponse | undefined) {
  return lastTransaction?.Status === 'pending' && lastTransaction?.Operator === 'downgraded';
}
export function isPlanRenewFailed(lastTransaction: TLastTransactionResponse | undefined) {
  return lastTransaction?.Status === 'failed' && lastTransaction?.Operator === 'renewed';
}
