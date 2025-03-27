import { SemData } from '@/types/sem';
import { NextApiResponse } from 'next';
import { ProviderType, UserStatus } from 'prisma/global/generated/client';
import { globalPrisma } from '../db/init';
import { getGlobalToken, getGlobalTokenByOauth } from '../globalAuth';
import { jsonRes } from '../response';
import { HttpStatusCode } from 'axios';

export const getGlobalTokenSvcWithEmail =
  (
    avatar_url: string,
    providerId: string,
    name: string,
    providerType: ProviderType,
    email: string,
    password?: string,
    inviterId?: string,
    referralCode?: string,
    semData?: SemData,
    bdVid?: string
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
      referralCode,
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
export const getGlobalTokenSvc =
  (
    avatar_url: string,
    providerId: string,
    name: string,
    providerType: ProviderType,
    password?: string,
    inviterId?: string,
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
  referralCode?: string,
  semData?: SemData,
  bdVid?: string
) =>
  getGlobalTokenSvcWithEmail(
    avatar_url,
    providerId,
    name,
    ProviderType.GITHUB,
    email,
    undefined,
    inviterId,
    referralCode,
    semData,
    bdVid
  );
export const getGlobalTokenByWechatSvc = (
  avatar_url: string,
  providerId: string,
  name: string,
  inviterId?: string,
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
    referralCode,
    semData,
    bdVid
  );
export const getGlobalTokenByPhoneSvc = (
  phone: string,
  inviterId?: string,
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
    referralCode,
    semData,
    bdVid
  );

export const getGlobalTokenByPasswordSvc = (
  name: string,
  password: string,
  inviterId?: string,
  referralCode?: string
) => getGlobalTokenSvc('', name, name, ProviderType.PASSWORD, password, inviterId, referralCode);

export const getGlobalTokenByGoogleSvc = (
  avatar_url: string,
  providerId: string,
  name: string,
  email: string,
  inviterId?: string,
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
