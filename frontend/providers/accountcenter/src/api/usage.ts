import { GET, POST } from '@/service/request';

export const getUsageList = (data: any) => POST('/billing/appOverview', data);

export const getRegionList = () => GET('/getRegions');

export const getNamespaceList = (data: any) => POST('/billing/getNamespaceList', data);

export const getConsumption = (data: any) => POST('/billing/consumption', data);

export const getUsageDetail = (data: any) => POST('/billing/appBilling', data);

export const getAppList = () => GET('/billing/getAppList');
