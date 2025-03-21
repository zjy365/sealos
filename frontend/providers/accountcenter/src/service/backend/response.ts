import { NextApiResponse } from 'next';
import { ApiResp } from '@/types/api';

const showStatus = (status: number) => {
  let message = '';
  switch (status) {
    case 400:
      message = 'Request error (400)';
      break;
    case 401:
      message = 'Unauthorized, please log in again (401)';
      break;
    case 403:
      message = 'Access Denied (403)';
      break;
    case 404:
      message = 'Request error (404)';
      break;
    case 405:
      message = 'Unsupported request method';
      break;
    case 408:
      message = 'Request timed out (408)';
      break;
    case 500:
      message = 'Server error (500)';
      break;
    case 501:
      message = 'Service not implemented (501)';
      break;
    case 502:
      message = 'Network error (502)';
      break;
    case 503:
      message = 'Service unavailable (503)';
      break;
    case 504:
      message = 'Network timeout (504)';
      break;
    case 505:
      message = 'HTTP version not supported (505)';
      break;
    default:
      message = `Connection Error(${status})!`;
  }
  return `${message}.Please check the network or contact the administrator!`;
};

export const jsonRes = <T = any>(res: NextApiResponse, props?: ApiResp<T>) => {
  const { code = 200, message = '', data = null, error } = props || {};
  let msg = message;

  if (code < 200 || code > 300) {
    msg = message || showStatus(code);
  }

  res.json({
    code,
    message: msg,
    data: data || error
  });
};
