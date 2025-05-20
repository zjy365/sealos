import { TUpdateInfoRequest, TUserInfoResponse } from '@/schema/user';
import { GET, POST } from '@/service/request';

export function getUserInfo() {
  return GET<TUserInfoResponse>('/user/getInfo');
}
export function updateUserInfo(data: Partial<TUpdateInfoRequest>) {
  return POST('/user/updateInfo', data);
}
export function deleteUser() {
  return POST('/user/delete');
}
