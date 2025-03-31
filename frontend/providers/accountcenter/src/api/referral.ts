import { ApiResp } from '@/service/kubernet';
import { GET, POST } from '@/service/request';

export interface ReferralStats {
  total: number;
  reward: Array<{ redeem_at: string }>;
}
export interface ReferralLinkData {
  code: string;
  link: string;
}
function catchReferralResponseCode<T>(res: ApiResp<T>) {
  if (res.code === 404) return res;
  if (res.code < 200 || res.code >= 400) {
    return Promise.reject(res.code + ':' + res.message);
  }
  return res;
}
export function getReferralLink() {
  return GET<ApiResp<ReferralLinkData>>('/referral', {}, { noParseAPIResponseData: true }).then(
    catchReferralResponseCode
  );
}
export function getReferralStats() {
  return GET<ApiResp<ReferralStats>>('/referral/stats', {}, { noParseAPIResponseData: true }).then(
    catchReferralResponseCode
  );
}
