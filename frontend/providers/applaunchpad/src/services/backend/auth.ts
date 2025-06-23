import { IncomingHttpHeaders } from 'http';
import { verifyInternalToken } from '../auth';

export type Authorization = {
  kubeconfig: string;
  token: string;
};

export const authSession = async (header: IncomingHttpHeaders) => {
  if (!header) return Promise.reject('unAuthorization');
  const { authorization } = header;
  if (!authorization) return Promise.reject('unAuthorization');

  try {
    const { kubeconfig, token } = JSON.parse(decodeURIComponent(authorization)) as Authorization;
    const payload = await verifyInternalToken(token);

    if (!payload) {
      return Promise.reject('unAuthorization');
    }
    return Promise.resolve({
      kubeconfig,
      tokenPayload: payload
    });
  } catch (err) {
    return Promise.reject('unAuthorization');
  }
};

export const authAppToken = async (header: IncomingHttpHeaders) => {
  if (!header) return Promise.reject('unAuthorization');
  const { authorization } = header;
  if (!authorization) return Promise.reject('unAuthorization');

  try {
    return Promise.resolve(authorization);
  } catch (err) {
    return Promise.reject('unAuthorization');
  }
};
