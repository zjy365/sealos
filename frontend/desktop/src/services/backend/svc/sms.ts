import { NextApiResponse } from 'next';
import { addOrUpdateCode, SmsType } from '../db/verifyCode';
import { jsonRes } from '../response';
import { captchaReq, emailSmsReq, emailSmsVerifyReq, smsReq } from '../sms';
import { createMiddleware } from '@/utils/factory';
import { globalPrisma } from '../db/init';
import email from '@/pages/api/auth/email';
import { verifyVerifyEmailToken } from '../auth';
import { VerifyTokenPayload } from '@/types/token';

export const sendSmsCodeResp =
  (smsType: SmsType, id: string, code: string) =>
  async (res: NextApiResponse, next?: () => void) => {
    await addOrUpdateCode({ id, smsType, code });
    return jsonRes(res, {
      message: 'successfully',
      code: 200
    });
  };
export const sendPhoneCodeSvc = (phone: string) => async (res: NextApiResponse) => {
  const code = await smsReq(phone);
  return sendSmsCodeResp('phone', phone, code)(res);
};
export const sendEmailCodeSvc = (email: string) => async (res: NextApiResponse) => {
  const code = await emailSmsReq(email);
  return sendSmsCodeResp('email', email, code)(res);
};
// export const sendEmailVerifyMiddleware = createMiddleware<{ email: string }>(
//   async ({ ctx, next }) => {
//     const { email } = ctx;
//     await emailSmsVerif(email);
//     await next();
//   }
// );

export const verifyInfoEmailCodeSvc = createMiddleware<VerifyTokenPayload>(
  async ({ ctx, req, res }) => {
    const { userUid } = ctx;
    const isCorrect = await globalPrisma.userInfo.findUnique({
      where: {
        userUid,
        verifyEmail: false
      }
    });
    if (!isCorrect) {
      return jsonRes(res, {
        message: 'already verified',
        code: 409
      });
    }
    const result = await globalPrisma.userInfo.update({
      where: {
        userUid
      },
      data: {
        verifyEmail: true
      }
    });
    jsonRes(res, {
      message: 'successfully',
      code: 200
    });
  }
);
