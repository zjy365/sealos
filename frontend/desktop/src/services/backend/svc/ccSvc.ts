// 定义状态码枚举
export enum StatusCode {
  OK = 200, // 请求成功
  CREATED = 201, // 创建成功
  BAD_REQUEST = 400, // 非法请求
  UNAUTHORIZED = 401, // 用户未授权
  METHOD_NOT_ALLOWED = 405, // 方法不允许
  CONFLICT = 409, // 资源冲突
  INTERNAL_SERVER_ERROR = 500 // 服务器内部错误,
}
import { Axios, AxiosError, AxiosResponse, HttpStatusCode } from 'axios';
import { IForgotPasswordParams, ILoginParams, IRegisterParams } from '@/schema/ccSvc';
import {
  IUserLoginResponse,
  IForgotPasswordResponse,
  IRegisterResponse,
  CcApiResponse,
  CcApiSuccessResponse,
  CcApiErrorResponse
} from '@/types/response/ccSvc';
import { extend } from 'dayjs';
// 配置 API 基础 URL 和 Token
const API_URL = process.env.API_URL || 'https://your-api-domain.com';
const X_API_TOKEN = process.env.X_API_TOKEN || 'your-fixed-high-entropy-token';

// 创建 Axios 实例
const apiClient = new Axios({
  baseURL: API_URL,
  headers: {
    'X-API-Token': X_API_TOKEN,
    'Content-Type': 'application/json; charset=utf-8'
  }
});
// 定义 API 响应类型
type ApiResponse<T extends unknown, E extends unknown = string> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse<E>;
type ApiErrorResponse<E extends unknown = string> = {
  success: false;
  error: E;
  status: HttpStatusCode;
};
type ApiSuccessResponse<T extends unknown> = {
  success: true;
  data: T;
  status: HttpStatusCode;
};
const errorHandler =
  <TParams, TData, F extends string, E extends unknown>(
    handler: (params: TParams) => Promise<AxiosResponse<CcApiResponse<F, TData, E>>>
  ): ((
    params: TParams
  ) => Promise<ApiSuccessResponse<CcApiSuccessResponse<F, TData>> | ApiErrorResponse<E>>) =>
  async (params: TParams) => {
    try {
      const { data: responseData, status } = await handler(params);
      if (responseData.success)
        return {
          success: true,
          data: responseData,
          status
        } as ApiSuccessResponse<CcApiSuccessResponse<F, TData>>;
      else
        return {
          success: false,
          error: responseData.error,
          status
        } as ApiErrorResponse<E>;
    } catch (_error) {
      if (_error instanceof AxiosError) {
        let error = _error as AxiosError<ApiErrorResponse<E>>;
        const data = error.response?.data;
        const status = error.response?.status || HttpStatusCode.InternalServerError;
        return {
          success: false,
          error: data?.error,
          status
        } as ApiErrorResponse<E>;
      } else
        return {
          success: false,
          error: undefined,
          status: HttpStatusCode.InternalServerError
        } as ApiErrorResponse<E>;
    }
  };
// 用户信息类型定义（按需调整）
export const cclogin = errorHandler((params: ILoginParams) =>
  apiClient.post<IUserLoginResponse>('/api/sealos-v1/user/login', params)
);
export const ccRegister = errorHandler((params: IRegisterParams) =>
  apiClient.put<IRegisterResponse>('/api/sealos-v1/user', params)
);
export const ccForget = errorHandler((params: IForgotPasswordParams) =>
  apiClient.post<IForgotPasswordResponse>('/api/sealos-v1/user/reset-password', params)
);
