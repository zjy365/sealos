import { SystemEnvResponse } from '@/pages/api/getEnv';
import { GET, POST } from '@/service/request';
import { getUserSession } from '@/utils/user';
import { AxiosProgressEvent } from 'axios';

export const getAppEnv = () => GET<SystemEnvResponse>('/api/getEnv');

export const uploadFile = (
  data: FormData,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
  return POST<string[]>('/api/minio/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 3 * 60 * 1000,
    onUploadProgress
  });
};

export const checkUserTask = () =>
  GET('/api/guide/checkTask', undefined, {
    headers: {
      Authorization: getUserSession()?.token
    }
  });

export const getPriceBonus = () =>
  GET<{ amount: number; gift: number }[]>('/api/guide/getBonus', undefined, {
    headers: {
      Authorization: getUserSession()?.token
    }
  });
