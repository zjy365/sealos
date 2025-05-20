import { GET } from './request';

export interface ReferralTypeData {
  id: number;
  cid: number;
  user_id: string;
  item_key: string;
  item_value: string;
}

export interface ReferralInfo {
  referral_code: string;
  referral_type: string;
}

const defaultReferralInfo: ReferralInfo = {
  referral_code: '',
  referral_type: 'rcc'
};

export async function getReferralType(user_id: string): Promise<ReferralInfo> {
  const res = await GET<ReferralTypeData>('/api/runcc/referral_type', {
    cid: '1',
    user_id
  });
  if (res === null) {
    // default is rcc user
    return defaultReferralInfo;
  }
  if (!res.item_value) {
    return defaultReferralInfo;
  }
  try {
    return JSON.parse(res.item_value);
  } catch {
    return defaultReferralInfo;
  }
}
