import { GET } from './request';

export interface ExpansionParams {
  /**
   * 单位是美分，整数
   */
  amount: number;
  user_id: string;
}

export function getExpansion(params: ExpansionParams) {
  return GET<number>('/api/runcc/expansion', {
    cid: '1',
    ...params
  });
}
