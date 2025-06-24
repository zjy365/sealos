import { GET, POST } from '@/service/request';
import { ApiResp } from '@/types';
import { RawRegion, Region } from '@/types/region';

export const getUsageList = (data: any) => POST('/billing/appOverview', data);

export const getRegionList = () => GET<ApiResp<Region[]>>('/getRegions');

export const getRawRegionList = () => GET<{ regionList: RawRegion[] }>('/getRegionsRaw');

export const getNamespaceList = (data: any) => POST('/billing/getNamespaceList', data);

export const getConsumption = (data: any) => POST('/billing/consumption', data);

export const getUsageDetail = (data: any) => POST('/billing/appBilling', data);

export const getAppList = () => GET('/billing/getAppList');
