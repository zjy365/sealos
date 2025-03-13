import {
  IForgotPasswordParams,
  ILoginParams,
  IRegisterParams,
  loginParamsSchema,
  registerParamsSchema
} from '@/schema/ccSvc';
import { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '../response';
import { HttpStatusCode } from 'axios';
import { z } from 'zod';

export const filterLoginParams = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: (data: ILoginParams) => void
) => {
  const parseResult = loginParamsSchema.safeParse(req.body);
  if (!parseResult.success)
    return jsonRes(res, {
      message: parseResult.error.errors[0].message,
      code: HttpStatusCode.BadRequest
    });
  await Promise.resolve(next(parseResult.data));
};
export const filterRegisterParams = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: (data: IRegisterParams) => void
) => {
  const parseResult = registerParamsSchema.safeParse(req.body);
  const country = 'US';
  if (!parseResult.success)
    return jsonRes(res, {
      message: parseResult.error.errors[0].message,
      code: HttpStatusCode.BadRequest
    });

  await Promise.resolve(next({ ...parseResult.data, country }));
};

export const filterForgotPasswordParams = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: (data: IForgotPasswordParams) => void
) => {
  const { email } = req.body as IForgotPasswordParams;

  if (!email)
    return jsonRes(res, {
      message: 'Email is invalid',
      code: HttpStatusCode.BadRequest
    });
  await Promise.resolve(next({ email }));
};
