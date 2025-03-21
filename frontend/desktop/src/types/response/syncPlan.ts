import { RESPONSE_MESSAGE } from './utils';

enum _SYNC_PLAN_STATUS {
  CODE_ERROR = 'CODE_ERROR'
}

export const SYNC_PLAN_STATUS = Object.assign({}, _SYNC_PLAN_STATUS, RESPONSE_MESSAGE);
export type SYNC_PLAN_STATUS = typeof SYNC_PLAN_STATUS;
