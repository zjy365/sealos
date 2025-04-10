const cookieKeyValueMap = {
  maxAge: 'Max-Age',
  path: 'Path',
  secure: 'Secure',
  sameSite: 'SameSite',
  domain: 'Domain',
  httpOnly: 'HttpOnly'
};
function getCookieString(options: {
  maxAge?: number | string;
  secure?: boolean;
  sameSite?: string;
  name: string;
  value: string;
  path?: string;
  domain?: string;
  httpOnly?: boolean;
}) {
  let result = `${options.name}=${options.value}`;
  Object.keys(options).forEach((key) => {
    if (key === 'name' || key === 'value') return;
    const value = options[key as keyof typeof options];
    const setKey = cookieKeyValueMap[key as keyof typeof cookieKeyValueMap];
    if (typeof value === 'boolean') {
      if (value) result += `;${setKey}`;
    } else if (value != null) {
      result += `;${setKey}=${value}`;
    }
  });
  return result;
}

const validCookieDomains = ['claws.run', 'claw.cloud'];
const referral = {
  codeQueryKey: 'link',
  codeCookieKey: 'CC_RUN_REFERRAL_CODE',
  // 单位s 90天
  codeCookieMaxAge: 3600 * 24 * 90,
  // 监控用 单位s 90天
  codeCookieTrackMaxAge: 3600 * 24 * 90,
  getCookieDomain(host: string | undefined) {
    if (process.env.NODE_ENV === 'development' || typeof host !== 'string') return undefined;
    const hostname = host.split(':')[0];
    const domain = validCookieDomains.find((d) => {
      return hostname === d || hostname?.endsWith(`.${d}`);
    });
    return domain;
  },
  getSiginCookieStr(code: string, host?: string) {
    const domain = referral.getCookieDomain(host || process.env.SEALOS_CLOUD_DOMAIN);
    return getCookieString({
      name: referral.codeCookieKey,
      value: code,
      maxAge: referral.codeCookieMaxAge,
      path: '/',
      httpOnly: true,
      secure: true,
      domain
    });
  },
  getTrackCookieStr(code: string, host?: string) {
    const domain = referral.getCookieDomain(host || process.env.SEALOS_CLOUD_DOMAIN);
    return getCookieString({
      name: referral.codeCookieKey,
      value: code,
      maxAge: referral.codeCookieTrackMaxAge,
      path: '/',
      httpOnly: true,
      secure: true,
      domain
    });
  },
  getCookiesUseInServerSideProps(
    { query, host }: { query: any; host?: any },
    type: 'Sigin' | 'Track' = 'Sigin'
  ) {
    const code = query[referral.codeQueryKey];
    const cookies: string[] = [];
    if (code) {
      const method = `get${type}CookieStr` as 'getSiginCookieStr' | 'getTrackCookieStr';
      cookies.push(referral[method]?.(code, host));
    }
    return cookies;
  }
};
export default referral;
