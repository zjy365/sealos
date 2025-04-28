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

class Referral {
  private static readonly VALID_COOKIE_DOMAINS = ['claws.run', 'claw.cloud'];
  private static readonly COOKIE_MAX_AGE = 3600 * 24 * 90; // 90 days in seconds
  private static readonly COOKIE_TRACK_MAX_AGE = 3600 * 24 * 90; // 90 days in seconds

  private cookieKey: string;
  private queryKey: string;

  constructor(cookieKey: string, queryKey: string) {
    this.cookieKey = cookieKey;
    this.queryKey = queryKey;
  }

  private getCookieDomain(host: string | undefined): string | undefined {
    if (process.env.NODE_ENV === 'development' || typeof host !== 'string') return undefined;
    const hostname = host.split(':')[0];
    return Referral.VALID_COOKIE_DOMAINS.find((d) => hostname === d || hostname?.endsWith(`.${d}`));
  }

  private buildCookieString(code: string, host: string | undefined, maxAge: number): string {
    const domain = this.getCookieDomain(host || process.env.SEALOS_CLOUD_DOMAIN);
    return getCookieString({
      name: this.cookieKey,
      value: code,
      maxAge,
      path: '/',
      httpOnly: true,
      secure: true,
      domain
    });
  }

  public getSiginCookieStr(code: string, host?: string): string {
    return this.buildCookieString(code, host, Referral.COOKIE_MAX_AGE);
  }

  public getTrackCookieStr(code: string, host?: string): string {
    return this.buildCookieString(code, host, Referral.COOKIE_TRACK_MAX_AGE);
  }

  public getCookiesUseInServerSideProps(
    { query, host }: { query: any; host?: any },
    type: 'Sigin' | 'Track' = 'Sigin'
  ): string | undefined {
    const code = query[this.queryKey];
    if (code) {
      const method = `get${type}CookieStr` as 'getSiginCookieStr' | 'getTrackCookieStr';
      return this[method]?.(code, host);
    }
    return undefined;
  }
}

export const referral = new Referral('CC_RUN_REFERRAL_CODE', 'link');
export const agencyReferral = new Referral('CC_RUN_AGENCY_REFERRAL_CODE', 'agencyLink');
