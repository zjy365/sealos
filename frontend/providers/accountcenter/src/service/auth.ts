import { sign, verify } from 'jsonwebtoken';

const internalJwtSecret = () => process.env.INTERNAL_JWT_SECRET || '123456789';
// global.AppConfig?.costCenter.auth.jwt.internal || '123456789';

// const billingJwtSecret = () => global.AppConfig?.costCenter.auth.jwt.billing || '123456789';
export const getRegionUid = () => process.env.REGION_UID || '';
export type AuthenticationTokenPayload = {
  userUid: string;
  userId: string;
  regionUid: string;
  userCrName: string;
};
export type AccessTokenPayload = {
  regionUid: string;
  userCrUid: string;
  userCrName: string;
  workspaceUid: string;
  workspaceId: string;
} & AuthenticationTokenPayload;

export const verifyJWT = <T extends Object = AccessTokenPayload>(token: string, secret: string) =>
  new Promise<T | null>((resolve) => {
    if (!token) return resolve(null);
    verify(token, secret, (err, payload) => {
      if (err) {
        resolve(null);
      } else if (!payload) {
        resolve(null);
      } else {
        resolve(payload as T);
      }
    });
  });

export const generateBillingToken = (props: AuthenticationTokenPayload) =>
  sign(props, internalJwtSecret(), { expiresIn: '5d' });

export const verifyInternalToken = (token: string) => {
  // console.log(internalJwtSecret());
  return verifyJWT<AccessTokenPayload>(token, internalJwtSecret());
};
