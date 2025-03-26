//@ts-ignore
import { getAppConfig } from '@/pages/api/platform/getAppConfig';
import { retrySerially } from '@/utils/tools';
import Dysmsapi, * as dysmsapi from '@alicloud/dysmsapi20170525';
import * as $tea from '@alicloud/tea-typescript';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Utils, * as $Util from '@alicloud/tea-util';
import Captcha, * as $Captcha from '@alicloud/captcha20230305';
import nodemailer from 'nodemailer';
import { getRegionUid } from '../enable';
import { globalPrisma } from './db/init';
import {
  generateAccessToken,
  generateVerifyEmailToken,
  verifyJWT,
  verifyVerifyEmailToken
} from './auth';
import { VerifyTokenPayload } from '@/types/token';
import { SwitchRegionType } from '@/constants/account';
const getTransporter = () => {
  if (!global.nodemailer) {
    const emailConfig = global.AppConfig.desktop.auth.idp.sms?.email;
    if (!emailConfig) throw Error('email transporter config error');
    const transporter = nodemailer.createTransport({
      pool: true,
      host: emailConfig.host,

      port: emailConfig.port,
      secure: true, // use TLS
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password
      }
    });
    global.nodemailer = transporter;
  }
  return global.nodemailer;
};

export const smsReq = async (phoneNumbers: string) => {
  // for dev
  if (process.env.NODE_ENV === 'development' && !process.env.DEV_SMS_ENABLED) {
    return '123456';
  }
  const aliConfig = global.AppConfig.desktop.auth.idp.sms?.ali;
  if (!aliConfig) throw Error('config error');
  const { signName, templateCode, accessKeyID: accessKeyId, accessKeySecret } = aliConfig;
  // for dev
  if (process.env.NODE_ENV === 'development' && !process.env.DEV_SMS_ENABLED) {
    const code = '123456';
    return code;
  }
  const code = Math.floor(Math.random() * 900000 + 100000).toString();
  const sendSmsRequest = new dysmsapi.SendSmsRequest({
    phoneNumbers,
    signName,
    templateCode,
    templateParam: `{"code":${code}}`
  });
  const config = new $OpenApi.Config({
    accessKeyId,
    accessKeySecret
  });

  const client = new Dysmsapi(config);
  const runtime = new $Util.RuntimeOptions({});
  await retrySerially(async () => {
    try {
      const _result = await client.sendSmsWithOptions(sendSmsRequest, runtime);

      if (!_result) {
        throw new Error('sms result is null');
      }
      if (_result.statusCode !== 200) {
        throw new Error(`sms result status code is ${_result.statusCode}
				${_result.body}
				${phoneNumbers},
				${new Date()}
				`);
      }
      if (_result.body.code !== 'OK') {
        throw new Error(`
				${_result.body.message}
				${phoneNumbers},
				${new Date()}`);
      }
      return _result;
    } catch (error) {
      return Promise.reject(error);
    }
  }, 3);
  return code;
};

export const captchaReq = async ({ captchaVerifyParam }: { captchaVerifyParam?: string }) => {
  // for dev
  const captchaConfig = global.AppConfig.desktop.auth.captcha;
  if (!captchaConfig?.enabled) throw Error('config error');
  const aliConfig = global.AppConfig.desktop.auth.captcha?.ali;
  if (!aliConfig) throw Error('config error');
  const { sceneId, accessKeyID: accessKeyId, accessKeySecret = '', endpoint } = aliConfig;
  const captchaRequest = new $Captcha.VerifyIntelligentCaptchaRequest({});
  captchaRequest.captchaVerifyParam = captchaVerifyParam;
  captchaRequest.sceneId = sceneId;
  const config = new $OpenApi.Config({
    accessKeyId,
    accessKeySecret,
    endpoint
  });
  const client = new Captcha(config);
  const runtime = new $Util.RuntimeOptions({});
  return await retrySerially(async () => {
    try {
      const _result = await client.verifyIntelligentCaptchaWithOptions(captchaRequest, runtime);
      if (!_result) {
        throw new Error('captcha result is null');
      }
      console.log(_result);
      if (_result.body.code !== 'Success' || !_result.body.success) {
        throw new Error(`
				${_result.body.message}
				${new Date()}`);
      }
      return _result.body.result;
    } catch (error) {
      return Promise.reject(error);
    }
  }, 3);
};
export const emailSmsReq = async (email: string) => {
  const emailConfig = global.AppConfig.desktop.auth.idp.sms?.email;
  if (!emailConfig) throw Error('config error');

  const code = Math.floor(Math.random() * 900000 + 100000).toString();
  const transporter = getTransporter();

  await retrySerially(
    () =>
      transporter.sendMail({
        from: emailConfig.user,
        to: email,
        subject: '【sealos】验证码',
        html: `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>【sealos】验证码</title>
				<style>
					body {
						font-family: Arial, sans-serif;
						background-color: #f0f0f0;
						text-align: center;
					}

					.container {
						max-width: 400px;
						margin: 50px auto;
						padding: 20px;
						background-color: #fff;
						border-radius: 5px;
						box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
					}

					h2 {
						color: #3498db;
					}

					.verification-code {
						font-size: 24px;
						color: #333;
						margin-bottom: 20px;
					}

					.button {
						padding: 10px 20px;
						background-color: #3498db;
						color: #fff;
						border: none;
						border-radius: 5px;
						cursor: pointer;
					}

					.button:hover {
						background-color: #2980b9;
					}
				</style>
			</head>
			<body>
			<div class="container">
				<h2>尊敬的用户，您正在进行邮箱绑定操作。请输入以下验证码完成验证。</h2>
				<p>您的验证码是：</p>
				<p class="verification-code">${code}</p>
			</div>
			</body>
			</html>`
      }),
    3
  );
  return code;
};
export const emailSmsVerifyReq = async (
  email: string,
  payload: VerifyTokenPayload,
  nickname: string
) => {
  const emailConfig = global.AppConfig.desktop.auth.idp.sms?.email;
  if (!emailConfig) throw Error('config error');

  // const code = Math.floor(Math.random() * 900000 + 100000).toString();
  const token = generateVerifyEmailToken(payload);
  const transporter = getTransporter();
  const region = await globalPrisma.region.findUnique({
    where: {
      uid: getRegionUid()
    }
  });
  if (!region) throw Error('region not found');
  const domain = region.domain;
  const url = `https://${domain}/switchRegion?token=${token}&switchRegionType=${SwitchRegionType.VERIFYEMAIL}`;
  await retrySerially(
    () =>
      transporter.sendMail({
        from: emailConfig.user,
        to: email,
        subject: 'ClawCloud Email Verification',
        html: `<!DOCTYPE html>
        <html lang="en">

        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ClawCloud Email Verification</title>
        </head>

        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
            <tr>
              <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600"
                  style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(270deg, #2778FD 3.93%, #2778FD 18.25%, #829DFE 80.66%);
                               height: 120px;
                               display: flex;
                               flex-direction: column;
                               justify-content: center;
                               align-items: center;
                               gap: 10px;">
                      <img src="https://static-host-627noqh5-qwe.cloud.sealos.io/clawcloud.png" alt="ClawCloud Logo" style="max-width: 217px;">
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0; font-size: 28px; color: #000; font-weight: 700;">Dear ${nickname}</h2>
                      <p style="margin: 24px 0; font-size: 16px; color: #000; line-height: 1.6;">
                      Please click on the link below to verify your email address. This is required to confirm ownership of the email address.
                      </p>

                      <!-- Button -->
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                        style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${url}"
                            style="display: inline-block;
                                     padding: 14px 24px;
                                     width: 100%;
                                     box-sizing: border-box;
                                     text-align: center;
                                     border-radius: 8px;
                                     background: #18181B;
                                     color: #ffffff;
                                     text-decoration: none;
                                     font-size: 16px;
                                     font-weight: 500;
                                     cursor: pointer;"
                                     >
                              Verify your email address
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 24px 0; font-size: 16px; color: #000; line-height: 1.6;">
                        If you're having trouble, try copying and pasting the following URL into your browser.
                      </p>
                      <!-- Footer Text -->
                      <p style="margin: 24px 0 0; font-size: 16px; color: #000; font-weight: 700;">
                        Thank you for your support!
                      </p>
                      <p style="margin: 8px 0 0; font-size: 14px; color: #444;">
                        Clawcloud (Singapore) Private Limited<br>
                        support@run.claw.cloud
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>

        </html>`
      }),
    3
  );
  return token;
};
