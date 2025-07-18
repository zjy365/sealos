import { SemData } from '@/types/sem';
import { HttpStatusCode } from 'axios';
import { NextApiResponse } from 'next';
import { ProviderType, UserStatus } from 'prisma/global/generated/client';
import { globalPrisma } from '../db/init';
import { getGlobalToken, getGlobalTokenByOauth } from '../globalAuth';
import { jsonRes } from '../response';

export const getGlobalTokenSvcWithEmail =
  (
    avatar_url: string,
    providerId: string,
    name: string,
    providerType: ProviderType,
    email: string,
    password?: string,
    inviterId?: string,
    referralType?: 'agency' | 'rcc',
    referralCode?: string,
    semData?: SemData,
    bdVid?: string,
    config?: any
  ) =>
  async (res: NextApiResponse, next?: () => void) => {
    const data = await getGlobalTokenByOauth({
      provider: providerType,
      providerId,
      avatar_url,
      name,
      email,
      inviterId,
      password,
      referralType,
      referralCode,
      semData,
      bdVid,
      config
    });
    if (!data)
      return jsonRes(res, {
        code: HttpStatusCode.Unauthorized,
        message: 'Unauthorized'
      });
    else if (data === 'email conflict') {
      return jsonRes(res, {
        code: HttpStatusCode.Conflict,
        message: 'Email already used by another user'
      });
    } else if (data === 'ACCOUNT_LOCKED') {
      return jsonRes(res, {
        code: HttpStatusCode.Forbidden,
        message:
          'The email is already binded with a deleted account. According our policy, it cannot be registered again until 30 days later.'
      });
    }
    return jsonRes(res, {
      data,
      code: HttpStatusCode.Ok,
      message: 'Successfully'
    });
  };
export const getGlobalTokenSvc =
  (
    avatar_url: string,
    providerId: string,
    name: string,
    providerType: ProviderType,
    password?: string,
    inviterId?: string,
    referralType?: 'agency' | 'rcc',
    referralCode?: string,
    semData?: SemData,
    bdVid?: string
  ) =>
  async (res: NextApiResponse, next?: () => void) => {
    const data = await getGlobalToken({
      provider: providerType,
      providerId,
      avatar_url,
      name,
      inviterId,
      referralType,
      referralCode,
      password,
      semData,
      bdVid
    });
    if (!data)
      return jsonRes(res, {
        code: HttpStatusCode.Unauthorized,
        message: 'Unauthorized'
      });
    return jsonRes(res, {
      data,
      code: HttpStatusCode.Ok,
      message: 'Successfully'
    });
  };

export const getGlobalTokenByGithubSvc = (
  avatar_url: string,
  providerId: string,
  name: string,
  email: string,
  inviterId?: string,
  referralType?: 'agency' | 'rcc',
  referralCode?: string,
  semData?: SemData,
  bdVid?: string,
  config?: any
) =>
  getGlobalTokenSvcWithEmail(
    avatar_url,
    providerId,
    name,
    ProviderType.GITHUB,
    email,
    undefined,
    inviterId,
    referralType,
    referralCode,
    semData,
    bdVid,
    config
  );
export const getGlobalTokenByWechatSvc = (
  avatar_url: string,
  providerId: string,
  name: string,
  inviterId?: string,
  referralType?: 'agency' | 'rcc',
  referralCode?: string,
  semData?: SemData,
  bdVid?: string
) =>
  getGlobalTokenSvc(
    avatar_url,
    providerId,
    name,
    ProviderType.WECHAT,
    undefined,
    inviterId,
    referralType,
    referralCode,
    semData,
    bdVid
  );
export const getGlobalTokenByPhoneSvc = (
  phone: string,
  inviterId?: string,
  referralType?: 'agency' | 'rcc',
  referralCode?: string,
  semData?: SemData,
  bdVid?: string
) =>
  getGlobalTokenSvc(
    '',
    phone,
    phone,
    ProviderType.PHONE,
    undefined,
    inviterId,
    referralType,
    referralCode,
    semData,
    bdVid
  );

export const getGlobalTokenByPasswordSvc = (
  name: string,
  password: string,
  inviterId?: string,
  referralType?: 'agency' | 'rcc',
  referralCode?: string,
  semData?: SemData,
  bdVid?: string
) =>
  getGlobalTokenSvc(
    '',
    name,
    name,
    ProviderType.PASSWORD,
    password,
    inviterId,
    referralType,
    referralCode,
    semData,
    bdVid
  );

export const getGlobalTokenByGoogleSvc = (
  avatar_url: string,
  providerId: string,
  name: string,
  email: string,
  inviterId?: string,
  referralType?: 'agency' | 'rcc',
  referralCode?: string,
  semData?: SemData,
  bdVid?: string
) =>
  getGlobalTokenSvcWithEmail(
    avatar_url,
    providerId,
    name,
    ProviderType.GOOGLE,
    email,
    undefined,
    inviterId,
    referralType,
    referralCode,
    semData,
    bdVid
  );

export const checkUserStatusSvc =
  (userUid: string) => async (res: NextApiResponse, next?: () => void) => {
    const user = await globalPrisma.user.findUnique({
      where: {
        uid: userUid,
        status: UserStatus.NORMAL_USER
      }
    });
    if (!user)
      return jsonRes(res, {
        code: 401,
        message: 'Unauthorized'
      });
    jsonRes(res, {
      code: 200,
      message: 'Successfully'
    });
    next?.();
  };
