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
import { createMiddleware } from '@/utils/factory';
import { isDisposableEmail } from 'disposable-email-domains-js';
import { globalPrisma } from '../db/init';

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

export const checkIsVaildEmailMiddleware = createMiddleware<{ email: string }>(
  async ({ ctx, req, res, next }) => {
    const { email } = ctx;
    if (!email)
      return jsonRes(res, {
        message: 'Email is invalid',
        code: HttpStatusCode.BadRequest
      });
    if (isDisposableEmail(email)) {
      return jsonRes(res, {
        code: 409,
        message: 'Email is invalid'
      });
    }
    const oauthProvider = await globalPrisma.oauthProvider.findUnique({
      where: {
        providerId_providerType: {
          providerId: email,
          providerType: 'EMAIL'
        }
      },
      select: {
        uid: true
      }
    });
    if (!!oauthProvider) {
      return jsonRes(res, {
        code: 409,
        message: 'Email is invalid'
      });
    }
    await next();
  }
);
