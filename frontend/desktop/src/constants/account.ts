export const GUIDE_DESKTOP_INDEX_KEY = 'frontend.guide.desktop.index';
export const LicenseFrontendKey = 'cloud.sealos.io/license-frontend';

export const templateDeployKey = 'cloud.sealos.io/deploy-on-sealos';

export const userSystemNamespace = 'user-system' as const;

export enum trackEventName {
  'dailyLoginFirst' = 'dailyLoginFirst',
  'signUp' = 'signUp'
}
export enum CcStatusCodes {
  OK = 200, // 请求成功
  Created = 201, // 创建成功
  BadRequest = 400, // 非法请求
  Unauthorized = 401, // 未授权
  MethodNotAllowed = 405, // 方法不允许
  Conflict = 409, // 冲突
  InternalServerError = 500 // 内部服务器错误
}
export enum SwitchRegionType {
  INIT = 'INIT',
  SWITCH = 'SWITCH',
  VERIFYEMAIL = 'VERIFYEMAIL'
}
