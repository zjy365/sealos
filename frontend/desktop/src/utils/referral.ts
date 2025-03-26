import type { NextURL } from 'next/dist/server/web/next-url';

const validCookieDomains = ['claws.run', 'claw.cloud'];
const referral = {
  codeQueryKey: 'referralCode',
  codeCookieKey: 'CC_RUN_REFERRAL_CODE',
  // 单位s 31天
  codeCookieMaxAge: 3600 * 24 * 31,
  getCookieDomain(host: string | undefined) {
    if (process.env.NODE_ENV === 'development' || typeof host !== 'string') return undefined;
    const hostname = host.split(':')[0];
    const domain = validCookieDomains.find((d) => {
      return hostname === d || hostname?.endsWith(`.${d}`);
    });
    return domain;
  }
};
export default referral;
