import { sign, verify } from 'jsonwebtoken';

const internalJwtSecret = () => process.env.INTERNAL_JWT_SECRET || '123456789';

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

export const verifyInternalToken = (token: string) => {
  // console.log(internalJwtSecret());
  return verifyJWT<AccessTokenPayload>(token, internalJwtSecret());
};
