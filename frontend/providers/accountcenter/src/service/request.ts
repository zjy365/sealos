import { getToken } from '@/utils/user';
import axios, {
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import type { ApiResp } from './kubernetes';
import { isApiResp } from './kubernetes';

interface RequestConfig extends AxiosRequestConfig {
  noParseAPIResponseData?: boolean;
}
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

const request = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 60000
});

// request interceptor
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // auto append service prefix
    if (config.url && !config.url?.startsWith('/api/')) {
      config.url = '' + config.url;
    }
    let _headers: AxiosHeaders = config.headers;
    const token = getToken() || '';

    // console.log('api token', token);

    //获取token，并将其添加至请求头中
    _headers['Authorization'] = config.headers.Authorization
      ? config.headers.Authorization
      : `Bearer ${token}`;
    // encodeURIComponent(
    //   getUserKubeConfig()
    // );

    if (!config.headers || config.headers['Content-Type'] === '') {
      _headers['Content-Type'] = 'application/json';
    }

    config.headers = _headers;
    return config;
  },
  (error: any) => {
    error.data = {};
    error.data.msg = '服务器异常，请联系管理员！';
    return Promise.resolve(error);
  }
);

// response interceptor
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { status, data } = response;
    if (status < 200 || status >= 300 || !isApiResp(data)) {
      return Promise.reject(
        status + ':' + showStatus(status) + ', ' + typeof data === 'string' ? data : String(data)
      );
    }
    const config: RequestConfig = response.config;
    if (config.noParseAPIResponseData) {
      return data;
    }
    const apiResp = data as ApiResp;
    if (apiResp.code < 200 || apiResp.code >= 400) {
      return Promise.reject(apiResp.code + ':' + apiResp.message);
    }

    response.data = apiResp.data;
    return response.data;
  },
  (error: any) => {
    if (axios.isCancel(error)) {
      return Promise.reject('cancel request' + String(error));
    } else {
      error.errMessage =
        'The request timed out or the server is abnormal. Please check the network or contact the administrator!';
    }
    return Promise.reject(error);
  }
);

export function GET<T = any>(
  url: string,
  data?: { [key: string]: any },
  config?: RequestConfig
): Promise<T> {
  return request.get(url, {
    params: data,
    ...config
  });
}

export function POST<T = any>(
  url: string,
  data?: { [key: string]: any },
  config?: RequestConfig
): Promise<T> {
  return request.post(url, data, config);
}

export function DELETE<T = any>(
  url: string,
  data?: { [key: string]: any },
  config?: RequestConfig
): Promise<T> {
  return request.delete(url, {
    params: data,
    ...config
  });
}
