import axios, { AxiosError, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export interface CrmApiResponse<T = any> {
  code: string;
  data: T;
}

const request = axios.create({
  baseURL: process.env.CRM_API_URL,
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

    const token = process.env.CRM_API_TOKEN;

    _headers['Authorization'] = config.headers.Authorization ? config.headers.Authorization : token;

    const cfAccessClientId = process.env['CF-Access-Client-Id'];
    const cfAccessClientSecret = process.env['CF-Access-Client-Secret'];

    if (cfAccessClientId) _headers['CF-Access-Client-Id'] = cfAccessClientId;
    if (cfAccessClientSecret) _headers['CF-Access-Client-Secret'] = cfAccessClientSecret;

    // console.log('crm token', config.headers.Authorization ? config.headers.Authorization : token);
    // console.log('cfAccessClientId', cfAccessClientId);
    // console.log('cfAccessClientSecret', cfAccessClientSecret);

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
    const { data } = response;
    const apiResp = data as CrmApiResponse;
    response.data = apiResp.data;
    return response.data;
  },
  (error: AxiosError) => {
    if (error.status === 404) {
      return Promise.resolve(null);
    }
    if (axios.isCancel(error)) {
      return Promise.reject('cancel request');
    }
    return Promise.reject(error);
  }
);

export function GET<T = any>(url: string, data?: { [key: string]: any }): Promise<T | null> {
  return request.get(url, {
    params: data
  });
}
