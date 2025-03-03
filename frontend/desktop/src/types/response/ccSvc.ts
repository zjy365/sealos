export type IUserLoginResponse = CcApiResponse<
  'user',
  {
    email: string;
    email_verified: boolean;
    id: number;
    firstname: string;
    lastname: string;
    language: string;
    country: string;
    created_at: string;
  },
  {}
>;
export type IRegisterResponse = CcApiResponse<
  'user',
  {
    id: string;
  },
  {}
>;

export type IForgotPasswordResponse = CcApiResponse<never, never, {}>;
export type CcApiResponse<Field extends string, T extends unknown, E extends unknown> =
  | CcApiSuccessResponse<Field, T>
  | CcApiErrorResponse<E>;
export type CcApiErrorResponse<E extends unknown = string> = {
  success: false;
  error: E;
};
export type CcApiSuccessResponse<Field extends string, T extends unknown> = {
  [k in Field]: T;
} & {
  success: true;
};
